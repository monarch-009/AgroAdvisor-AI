import pandas as pd
import numpy as np
# pyrefly: ignore [missing-import]
import torch
# pyrefly: ignore [missing-import]
import torch.nn as nn
# pyrefly: ignore [missing-import]
import torch.optim as optim
# pyrefly: ignore [missing-import]
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import pickle
import time
from pathlib import Path
import os
from soil_model import SoilNutrientNet

# Set roots
PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = PROJECT_ROOT / "models"
DATA_PATH = PROJECT_ROOT / "datasets" / "soil-nutrient-analysis.csv"

ENCODERS_SAVE_PATH = MODELS_DIR / "soil_encoders.pkl"
MODEL_SAVE_PATH = MODELS_DIR / "soil_nutrient_model.pth"
VILLAGE_MAP_SAVE_PATH = MODELS_DIR / "village_mapping.pkl"

# Backup folder for extra model copies
BACKUP_DIR = PROJECT_ROOT / "datasets" / "trained_models_backup"
BACKUP_DIR.mkdir(parents=True, exist_ok=True)
ML_MODEL_PATH = BACKUP_DIR / "soil_nutrient_model.pth"
ML_ENCODERS_PATH = BACKUP_DIR / "soil_encoders.pkl"
ML_VILLAGE_MAP_PATH = BACKUP_DIR / "village_mapping.pkl"

BATCH_SIZE = 1024
EPOCHS = 10
LEARNING_RATE = 0.001

class SoilDataset(Dataset):
    def __init__(self, states, districts, villages, targets):
        self.states = torch.tensor(states, dtype=torch.long)
        self.districts = torch.tensor(districts, dtype=torch.long)
        self.villages = torch.tensor(villages, dtype=torch.long)
        self.targets = torch.tensor(targets, dtype=torch.float32)

    def __len__(self):
        return len(self.targets)

    def __getitem__(self, idx):
        return self.states[idx], self.districts[idx], self.villages[idx], self.targets[idx]

def train_model():
    print("============================================================")
    print("      AGROADVISOR AI: SOIL NUTRIENT PREDICTION MODEL")
    print("============================================================")
    
    print(f"\n[1/5] Processing large dataset from {DATA_PATH}...")
    
    if not DATA_PATH.exists():
        print(f"Error: Dataset not found at {DATA_PATH}")
        return

    nutrient_map = {
        'Nitrogen': {'Low': 40, 'Medium': 80, 'High': 120},
        'Phosphorus': {'Low': 20, 'Medium': 40, 'High': 60},
        'Potassium': {'Low': 20, 'Medium': 40, 'High': 60},
        'Soil Ph': {'Acidic': 5.5, 'Neutral': 6.5, 'Alkaline': 7.5}
    }

    village_stats = {}

    try:
        chunk_iter = pd.read_csv(
            DATA_PATH, 
            usecols=['state_name', 'district_name', 'village_name', 'nutrient_name', 'nutrient_level', 'value'],
            chunksize=500000
        )
        
        for i, chunk in enumerate(chunk_iter):
            chunk.dropna(inplace=True)
            chunk = chunk[chunk['nutrient_name'].isin(nutrient_map.keys())]
            
            for nut, levels in nutrient_map.items():
                mask = chunk['nutrient_name'] == nut
                chunk.loc[mask, 'numeric_value'] = chunk.loc[mask, 'nutrient_level'].map(levels)
            
            chunk = chunk.dropna(subset=['numeric_value'])
            chunk['weighted_value'] = chunk['numeric_value'] * chunk['value']
            
            grouped = chunk.groupby(['state_name', 'district_name', 'village_name', 'nutrient_name'])
            chunk_agg = grouped.agg({'weighted_value': 'sum', 'value': 'sum'})
            
            for index, row in chunk_agg.iterrows():
                if index not in village_stats:
                    village_stats[index] = [0.0, 0.0]
                village_stats[index][0] += row['weighted_value']
                village_stats[index][1] += row['value']
            
            if (i + 1) % 5 == 0:
                print(f"      Processed { (i+1) * 500000 / 1000000 :.1f}M rows...")

    except Exception as e:
        print(f"Error reading dataset: {e}")
        return
        
    print("\n      Finalizing aggregation...")
    rows = []
    for (s, d, v, n), (w_sum, count) in village_stats.items():
        if count > 0:
            rows.append({
                'state_name': s, 'district_name': d, 'village_name': v, 
                'nutrient_name': n, 'final_val': w_sum / count
            })
    
    agg_df = pd.DataFrame(rows)
    pivot_df = agg_df.pivot_table(
        index=['state_name', 'district_name', 'village_name'],
        columns='nutrient_name',
        values='final_val'
    ).reset_index()
    
    pivot_df['Nitrogen'] = pivot_df['Nitrogen'].fillna(pivot_df['Nitrogen'].mean())
    pivot_df['Phosphorus'] = pivot_df['Phosphorus'].fillna(pivot_df['Phosphorus'].mean())
    pivot_df['Potassium'] = pivot_df['Potassium'].fillna(pivot_df['Potassium'].mean())
    pivot_df['Soil Ph'] = pivot_df['Soil Ph'].fillna(pivot_df['Soil Ph'].mean())
    
    print(f"      Processed {len(pivot_df)} unique villages.")
    
    print("\n[2/5] Encoding categorical features (State, District, Village)...")
    le_state = LabelEncoder()
    le_district = LabelEncoder()
    le_village = LabelEncoder()
    
    pivot_df['state_encoded'] = le_state.fit_transform(pivot_df['state_name'].astype(str).str.strip())
    pivot_df['district_encoded'] = le_district.fit_transform(pivot_df['district_name'].astype(str).str.strip())
    pivot_df['village_encoded'] = le_village.fit_transform(pivot_df['village_name'].astype(str).str.strip())
    
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    
    encoder_data = {
        "le_state": le_state,
        "le_district": le_district,
        "le_village": le_village
    }
    with open(ENCODERS_SAVE_PATH, "wb") as f:
        pickle.dump(encoder_data, f)
    with open(ML_ENCODERS_PATH, "wb") as f:
        pickle.dump(encoder_data, f)
    print(f"      DONE: Saved label encoders to {ENCODERS_SAVE_PATH}")

    print("      Creating village-to-location mapping...")
    # Handle duplicate village names by taking the first occurrence (or grouping)
    village_map = pivot_df[['village_name', 'state_name', 'district_name']].drop_duplicates(subset=['village_name'])
    village_map_dict = village_map.set_index('village_name').to_dict('index')
    
    with open(VILLAGE_MAP_SAVE_PATH, "wb") as f:
        pickle.dump(village_map_dict, f)
    with open(ML_VILLAGE_MAP_PATH, "wb") as f:
        pickle.dump(village_map_dict, f)
    print(f"      DONE: Saved village mapping to {VILLAGE_MAP_SAVE_PATH}")
    
    num_states = len(le_state.classes_)
    num_districts = len(le_district.classes_)
    num_villages = len(le_village.classes_)
    
    print(f"      Unique States: {num_states} | Districts: {num_districts} | Villages: {num_villages}")
    
    print("\n[3/5] Splitting data into training (85%) and validation (15%) sets...")
    X_s = pivot_df['state_encoded'].values
    X_d = pivot_df['district_encoded'].values
    X_v = pivot_df['village_encoded'].values
    y = pivot_df[['Nitrogen', 'Phosphorus', 'Potassium', 'Soil Ph']].values
    
    s_tr, s_te, d_tr, d_te, v_tr, v_te, y_tr, y_te = train_test_split(
        X_s, X_d, X_v, y, test_size=0.15, random_state=42
    )
    
    train_loader = DataLoader(SoilDataset(s_tr, d_tr, v_tr, y_tr), batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(SoilDataset(s_te, d_te, v_te, y_te), batch_size=BATCH_SIZE, shuffle=False)
    
    print("\n[4/5] Initializing Soil Nutrient Neural Network...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"      Utilizing device: {'GPU (CUDA)' if torch.cuda.is_available() else 'CPU'}")
    
    model = SoilNutrientNet(num_states, num_districts, num_villages).to(device)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    print(f"\n[5/5] Starting training for {EPOCHS} epochs...")
    best_val_loss = float('inf')
    
    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        start_time = time.time()
        for s, d, v, targets in train_loader:
            s, d, v, targets = s.to(device), d.to(device), v.to(device), targets.to(device)
            optimizer.zero_grad()
            outputs = model(s, d, v)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * s.size(0)
            
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for s, d, v, targets in test_loader:
                s, d, v, targets = s.to(device), d.to(device), v.to(device), targets.to(device)
                outputs = model(s, d, v)
                loss = criterion(outputs, targets)
                val_loss += loss.item() * s.size(0)
        
        val_loss /= len(test_loader.dataset)
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            save_data = {
                "model_state_dict": model.state_dict(),
                "num_states": num_states, "num_districts": num_districts, "num_villages": num_villages
            }
            torch.save(save_data, MODEL_SAVE_PATH)
            torch.save(save_data, ML_MODEL_PATH)
            
        print(f"Epoch {epoch+1} | Time: {time.time()-start_time:.1f}s | Val Loss: {val_loss:.4f}")
        
    print(f"DONE: Training Complete! Best Val MSE: {best_val_loss:.4f}")

if __name__ == "__main__":
    train_model()
