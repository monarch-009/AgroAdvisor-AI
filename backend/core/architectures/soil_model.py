# pyrefly: ignore [missing-import]
import torch
# pyrefly: ignore [missing-import]
import torch.nn as nn

class SoilNutrientNet(nn.Module):
    def __init__(self, num_states, num_districts, num_villages):
        super(SoilNutrientNet, self).__init__()
        
        # Embeddings for location features
        self.state_embed = nn.Embedding(num_states, 8)
        self.district_embed = nn.Embedding(num_districts, 16)
        self.village_embed = nn.Embedding(num_villages, 32)
        
        # Total embedding size = 8 + 16 + 32 = 56
        self.fc_layers = nn.Sequential(
            nn.Linear(56, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 4) # Output: N, P, K, pH
        )
        
    def forward(self, state_idx, district_idx, village_idx):
        s_emb = self.state_embed(state_idx)
        d_emb = self.district_embed(district_idx)
        v_emb = self.village_embed(village_idx)
        
        x = torch.cat([s_emb, d_emb, v_emb], dim=1)
        out = self.fc_layers(x)
        return out
