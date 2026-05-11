import torch
import torch.nn as nn

class LocationCropModelV2(nn.Module):
    def __init__(self, num_states, num_districts, num_tehsils, num_crops, 
                 state_emb_dim=8, dist_emb_dim=16, tehsil_emb_dim=32):
        super(LocationCropModelV2, self).__init__()
        
        self.state_emb = nn.Embedding(num_states, state_emb_dim)
        self.dist_emb = nn.Embedding(num_districts, dist_emb_dim)
        self.tehsil_emb = nn.Embedding(num_tehsils, tehsil_emb_dim)
        
        # Combined embedding size
        input_dim = state_emb_dim + dist_emb_dim + tehsil_emb_dim
        
        self.network = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.2),
            
            nn.Linear(128, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.3),
            
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            
            nn.Linear(128, num_crops)
        )
        
    def forward(self, state_ids, dist_ids, tehsil_ids):
        s_emb = self.state_emb(state_ids)
        d_emb = self.dist_emb(dist_ids)
        t_emb = self.tehsil_emb(tehsil_ids)
        
        # Concatenate embeddings
        x = torch.cat([s_emb, d_emb, t_emb], dim=1)
        
        return self.network(x)
