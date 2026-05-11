import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
import os

# Paths
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "datasets" / "rain"
MODELS_DIR = PROJECT_ROOT / "models"
MODELS_DIR.mkdir(exist_ok=True)

def train_rain_model():
    print("============================================================")
    print("      AGROADVISOR AI: RAINFALL PREDICTION MODEL TRAINING")
    print("============================================================")
    
    # 1. Load District-wise Rainfall
    district_path = DATA_DIR / "district wise rainfall normal.csv"
    if not district_path.exists():
        print(f"ERROR: {district_path} not found.")
        return

    print(f"[1/4] Loading district-wise rainfall data from {district_path.name}...")
    df_district = pd.read_csv(district_path)
    df_district.columns = [c.strip() for c in df_district.columns]
    
    # Fill NaNs with 0
    df_district = df_district.fillna(0)
    
    # Normalize names
    df_district['STATE_UT_NAME'] = df_district['STATE_UT_NAME'].str.upper().str.strip()
    df_district['DISTRICT'] = df_district['DISTRICT'].str.upper().str.strip()
    
    # 2. Encode categories
    print("[2/4] Encoding states and districts...")
    le_state = LabelEncoder()
    le_district = LabelEncoder()
    
    df_district['state_encoded'] = le_state.fit_transform(df_district['STATE_UT_NAME'])
    df_district['district_encoded'] = le_district.fit_transform(df_district['DISTRICT'])
    
    # 3. Train Model
    print("[3/4] Training Random Forest Regressor for seasonal rainfall...")
    X = df_district[['state_encoded', 'district_encoded']]
    # Predict all seasonal columns + Annual
    target_cols = ['Jan-Feb', 'Mar-May', 'Jun-Sep', 'Oct-Dec', 'ANNUAL']
    y = df_district[target_cols]
    
    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X, y)
    
    # 4. Save Model and Encoders
    print("[4/4] Saving model and encoders...")
    rain_data = {
        "model": model,
        "le_state": le_state,
        "le_district": le_district,
        "features": ['state_encoded', 'district_encoded'],
        "targets": target_cols
    }
    
    # Backup folder
    BACKUP_DIR = PROJECT_ROOT / "data" / "datasets" / "trained_models_backup"
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    
    save_path = BACKUP_DIR / "rain_model.pkl"
    with open(save_path, "wb") as f:
        pickle.dump(rain_data, f)
        
    # Also save to root models for consistency
    with open(MODELS_DIR / "rain_model.pkl", "wb") as f:
        pickle.dump(rain_data, f)
        
    print(f"DONE: Rain Model saved to {save_path}")
    print(f"DONE: Processed {len(df_district)} districts across {len(le_state.classes_)} states.")
    print("============================================================")

if __name__ == "__main__":
    train_rain_model()
