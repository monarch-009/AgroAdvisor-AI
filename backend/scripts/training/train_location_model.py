import os
import time
import json
# pyrefly: ignore [missing-import]
import torch
# pyrefly: ignore [missing-import]
import torch.nn as nn
# pyrefly: ignore [missing-import]
import torch.optim as optim
# pyrefly: ignore [missing-import]
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from pathlib import Path
import pickle

# ----------------- Configuration -----------------
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent.parent.parent
MODELS_DIR = PROJECT_ROOT / "models"
DATA_PATH = PROJECT_ROOT / "data" / "datasets" / "crop-wise-area-production-yield.csv"

MODEL_SAVE_PATH = MODELS_DIR / "location_crop_model.pth"
ENCODERS_SAVE_PATH = MODELS_DIR / "location_encoders.pkl"

BATCH_SIZE = 1024
EPOCHS = 15
LEARNING_RATE = 0.002
# -------------------------------------------------

class CropRecommenderNet(nn.Module):
    def __init__(self, num_states, num_districts, num_seasons, num_crops):
        super(CropRecommenderNet, self).__init__()
        
        # Embeddings for categorical features
        self.state_embed = nn.Embedding(num_states, 16)
        self.district_embed = nn.Embedding(num_districts, 32)
        self.season_embed = nn.Embedding(num_seasons, 8)
        
        # Total embedding size = 16 + 32 + 8 = 56
        self.fc_layers = nn.Sequential(
            nn.Linear(56, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, num_crops)
        )
        
    def forward(self, state_idx, district_idx, season_idx):
        s_emb = self.state_embed(state_idx)
        d_emb = self.district_embed(district_idx)
        se_emb = self.season_embed(season_idx)
        
        x = torch.cat([s_emb, d_emb, se_emb], dim=1)
        out = self.fc_layers(x)
        return out

class CropDataset(Dataset):
    def __init__(self, states, districts, seasons, crops):
        self.states = torch.tensor(states, dtype=torch.long)
        self.districts = torch.tensor(districts, dtype=torch.long)
        self.seasons = torch.tensor(seasons, dtype=torch.long)
        self.crops = torch.tensor(crops, dtype=torch.long)
        
    def __len__(self):
        return len(self.states)
    
    def __getitem__(self, idx):
        return self.states[idx], self.districts[idx], self.seasons[idx], self.crops[idx]

def train_model():
    print("="*60)
    print("🌱 AGROADVISOR AI: LOCATION-BASED CROP RECOMMENDATION 🌱")
    print("="*60)
    
    print(f"\n[1/5] 🚀 Loading dataset from {DATA_PATH}...")
    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        print(f"❌ Error: Dataset not found at {DATA_PATH}. Please make sure the path is correct.")
        return
        
    # Drop rows with missing critical values
    initial_len = len(df)
    df = df.dropna(subset=['state_name', 'district_name', 'season', 'crop_name'])
    print(f"      Loaded {len(df)} valid records. (Removed {initial_len - len(df)} rows with missing data)")
    
    # Initialize label encoders
    print("\n[2/5] 🔄 Encoding categorical features (State, District, Season, Crop)...")
    le_state = LabelEncoder()
    le_district = LabelEncoder()
    le_season = LabelEncoder()
    le_crop = LabelEncoder()
    
    # Strip whitespace to avoid duplicate classes like ' Kharif' and 'Kharif'
    df['state_name'] = df['state_name'].astype(str).str.strip()
    df['district_name'] = df['district_name'].astype(str).str.strip()
    df['season'] = df['season'].astype(str).str.strip()
    df['crop_name'] = df['crop_name'].astype(str).str.strip()
    
    df['state_encoded'] = le_state.fit_transform(df['state_name'])
    df['district_encoded'] = le_district.fit_transform(df['district_name'])
    df['season_encoded'] = le_season.fit_transform(df['season'])
    df['crop_encoded'] = le_crop.fit_transform(df['crop_name'])
    
    # Save encoders for inference
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    with open(ENCODERS_SAVE_PATH, "wb") as f:
        pickle.dump({
            "le_state": le_state,
            "le_district": le_district,
            "le_season": le_season,
            "le_crop": le_crop
        }, f)
    print(f"      ✅ Saved label encoders to {ENCODERS_SAVE_PATH}")
    
    num_states = len(le_state.classes_)
    num_districts = len(le_district.classes_)
    num_seasons = len(le_season.classes_)
    num_crops = len(le_crop.classes_)
    
    print(f"      Unique States: {num_states} | Districts: {num_districts} | Seasons: {num_seasons} | Crops: {num_crops}")
    
    # Split Data
    print("\n[3/5] 🔀 Splitting data into training (90%) and validation (10%) sets...")
    X_state = df['state_encoded'].values
    X_dist = df['district_encoded'].values
    X_seas = df['season_encoded'].values
    y_crop = df['crop_encoded'].values
    
    s_tr, s_te, d_tr, d_te, se_tr, se_te, y_tr, y_te = train_test_split(
        X_state, X_dist, X_seas, y_crop, test_size=0.1, random_state=42
    )
    
    train_dataset = CropDataset(s_tr, d_tr, se_tr, y_tr)
    test_dataset = CropDataset(s_te, d_te, se_te, y_te)
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)
    
    # Setup Device & Model
    print("\n[4/5] 🏗️ Initializing Neural Network Architecture...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"      🔥 Utilizing device: {'GPU (CUDA)' if torch.cuda.is_available() else 'CPU'}")
    
    model = CropRecommenderNet(num_states, num_districts, num_seasons, num_crops).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    # Training Loop
    print(f"\n[5/5] 🧠 Starting training for {EPOCHS} epochs...")
    print("-" * 70)
    print(f"{'Epoch':<10} | {'Time':<10} | {'Train Loss':<15} | {'Val Accuracy':<15}")
    print("-" * 70)
    
    best_val_acc = 0.0
    
    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        start_time = time.time()
        
        # Iterate over batches
        for i, (states, districts, seasons, targets) in enumerate(train_loader):
            states = states.to(device)
            districts = districts.to(device)
            seasons = seasons.to(device)
            targets = targets.to(device)
            
            optimizer.zero_grad()
            outputs = model(states, districts, seasons)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * states.size(0)
            
        epoch_loss = running_loss / len(train_dataset)
        
        # Validation
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for states, districts, seasons, targets in test_loader:
                states = states.to(device)
                districts = districts.to(device)
                seasons = seasons.to(device)
                targets = targets.to(device)
                
                outputs = model(states, districts, seasons)
                _, predicted = torch.max(outputs.data, 1)
                total += targets.size(0)
                correct += (predicted == targets).sum().item()
                
        val_acc = 100 * correct / total
        epoch_time = time.time() - start_time
        
        # Progress output
        status_symbol = "🌟 (New Best)" if val_acc > best_val_acc else ""
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            # Save the best model
            torch.save({
                "model_state_dict": model.state_dict(),
                "num_states": num_states,
                "num_districts": num_districts,
                "num_seasons": num_seasons,
                "num_crops": num_crops
            }, MODEL_SAVE_PATH)
            
        print(f"Epoch {epoch+1:<4} | {epoch_time:<8.1f}s | {epoch_loss:<15.4f} | {val_acc:.2f}% {status_symbol}")
        
    print("-" * 70)
    print(f"🎉 Training Complete! Best Validation Accuracy: {best_val_acc:.2f}%")
    print(f"💾 Optimal model weights saved as '{MODEL_SAVE_PATH}'")
    print("Ready to integrate into your FastAPI recommendation pipeline.")

if __name__ == "__main__":
    train_model()
