import torch
import torch.nn as nn

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
