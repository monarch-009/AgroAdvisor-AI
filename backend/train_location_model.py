import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import LabelEncoder
import pickle
import os
from pathlib import Path
import time

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
MODELS_DIR = PROJECT_ROOT / "models"
DATA_FILE = PROJECT_ROOT / "data" / "India Agriculture Crop Production.csv"

# Load the dataset
print(f"Loading data from {DATA_FILE}...")
df = pd.read_csv(DATA_FILE)

# Drop missing values
df = df[['State', 'District', 'Crop']].dropna()

# Encode categorical variables
print("Encoding categorical features...")
le_state = LabelEncoder()
le_district = LabelEncoder()
le_crop = LabelEncoder()

df['State_Idx'] = le_state.fit_transform(df['State'])
df['District_Idx'] = le_district.fit_transform(df['District'])
df['Crop_Idx'] = le_crop.fit_transform(df['Crop'])

num_states = len(le_state.classes_)
num_districts = len(le_district.classes_)
num_crops = len(le_crop.classes_)

print(f"Number of States: {num_states}, Districts: {num_districts}, Crops: {num_crops}")

# Save the encoders
MODELS_DIR.mkdir(parents=True, exist_ok=True)
encoders_path = MODELS_DIR / "location_encoders.pkl"
with open(encoders_path, "wb") as f:
    pickle.dump({
        "le_state": le_state,
        "le_district": le_district,
        "le_crop": le_crop
    }, f)
print(f"Saved encoders to {encoders_path}")

# PyTorch Dataset
class CropDataset(Dataset):
    def __init__(self, states, districts, crops):
        self.states = torch.tensor(states, dtype=torch.long)
        self.districts = torch.tensor(districts, dtype=torch.long)
        self.crops = torch.tensor(crops, dtype=torch.long)

    def __len__(self):
        return len(self.states)

    def __getitem__(self, idx):
        return self.states[idx], self.districts[idx], self.crops[idx]

dataset = CropDataset(df['State_Idx'].values, df['District_Idx'].values, df['Crop_Idx'].values)
dataloader = DataLoader(dataset, batch_size=512, shuffle=True)

# Define PyTorch Model
class LocationCropModel(nn.Module):
    def __init__(self, num_states, num_districts, num_crops, embedding_dim=16):
        super(LocationCropModel, self).__init__()
        self.state_embed = nn.Embedding(num_states, embedding_dim)
        self.district_embed = nn.Embedding(num_districts, embedding_dim)
        self.fc1 = nn.Linear(embedding_dim * 2, 64)
        self.fc2 = nn.Linear(64, num_crops)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)

    def forward(self, state, district):
        s_emb = self.state_embed(state)
        d_emb = self.district_embed(district)
        x = torch.cat([s_emb, d_emb], dim=1)
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Training on device: {device}")

model = LocationCropModel(num_states, num_districts, num_crops).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.005)

# Train Model
epochs = 5
print("Starting training...")
start_time = time.time()
for epoch in range(epochs):
    model.train()
    running_loss = 0.0
    for i, (states, districts, crops) in enumerate(dataloader):
        states, districts, crops = states.to(device), districts.to(device), crops.to(device)
        optimizer.zero_grad()
        outputs = model(states, districts)
        loss = criterion(outputs, crops)
        loss.backward()
        optimizer.step()
        running_loss += loss.item()

    print(f"Epoch {epoch+1}/{epochs} - Loss: {running_loss/len(dataloader):.4f}")

end_time = time.time()
print(f"Training completed in {end_time - start_time:.2f} seconds.")

# Save model weights
model_path = MODELS_DIR / "location_crop_model.pth"
torch.save({
    "model_state_dict": model.state_dict(),
    "num_states": num_states,
    "num_districts": num_districts,
    "num_crops": num_crops
}, model_path)
print(f"Saved model to {model_path}")
