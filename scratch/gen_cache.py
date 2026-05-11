import pandas as pd
import numpy as np
from pathlib import Path
import os

print("Generating statistics cache...")
file_path = Path(r"d:\Final_Project\AgroAdvisor_AI\data\datasets\crop-wise-area-production-yield.csv")
df = pd.read_csv(file_path, low_memory=False)

# Numeric conversion
df['production'] = pd.to_numeric(df['production'], errors='coerce').fillna(0)
df['yield'] = pd.to_numeric(df['yield'], errors='coerce').fillna(0)
df['area'] = pd.to_numeric(df['area'], errors='coerce').fillna(0)

# Features
avg_yield = df.groupby(['district_name', 'crop_name'])['yield'].mean().reset_index(name='avg_yield')
df = df.merge(avg_yield, on=['district_name', 'crop_name'], how='left')

stability = df.groupby(['district_name', 'crop_name'])['yield'].std().reset_index(name='yield_std').fillna(0)
df = df.merge(stability, on=['district_name', 'crop_name'], how='left')

df['year_start'] = df['year'].str.split('-').str[0].astype(int)
df.sort_values(['district_name', 'crop_name', 'year_start'], inplace=True)
df['production_growth'] = df.groupby(['district_name', 'crop_name'])['production'].pct_change().fillna(0).clip(upper=2.0)

# Ranking
stats = df.groupby(['state_name', 'district_name', 'season', 'crop_name']).agg({
    'avg_yield': 'mean',
    'yield_std': 'mean',
    'production_growth': 'mean',
    'production': 'sum',
    'area': 'sum'
}).reset_index()

stats['cv'] = stats['yield_std'] / (stats['avg_yield'] + 1e-6)
stats['stability_score'] = 1 / (1 + stats['cv'])

for col in ['avg_yield', 'stability_score', 'production_growth']:
    stats[f'norm_{col}'] = (stats[col] - stats[col].min()) / (stats[col].max() - stats[col].min() + 1e-6)

stats['recommendation_score'] = ((0.5 * stats['norm_avg_yield']) + (0.3 * stats['norm_stability_score']) + (0.2 * stats['norm_production_growth'])) * 100

output_path = Path(r"d:\Final_Project\AgroAdvisor_AI\models\region_analysis\stats_cache.csv")
output_path.parent.mkdir(parents=True, exist_ok=True)
stats.to_csv(output_path, index=False)
print(f"Done! Saved to {output_path}")
