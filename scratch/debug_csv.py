import pandas as pd
import os

path = r"d:\Final_Project\AgroAdvisor_AI\data\datasets\crop-wise-area-production-yield.csv"
df = pd.read_csv(path, low_memory=False, nrows=5)
print("Columns:", df.columns.tolist())
print("First row values:")
print(df.iloc[0].to_dict())
