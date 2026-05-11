import pandas as pd
import json

csv_path = r'd:\Final_Project\AgroAdvisor_AI\data\tehsil-level-agcensus-crop.csv'
json_path = r'd:\Final_Project\AgroAdvisor_AI\frontend\src\data\tehsils.json'
ts_path = r'd:\Final_Project\AgroAdvisor_AI\frontend\src\data\tehsils.ts'

print("Reading CSV...")
df = pd.read_csv(csv_path, usecols=['district_name', 'tehsil_name'])
print("Grouping...")
mapping = df.groupby('district_name')['tehsil_name'].unique().apply(list).to_dict()
print("Formatting...")
sorted_mapping = {str(k).upper(): sorted([str(v).title() for v in val]) for k, val in mapping.items()}

print("Writing JSON...")
with open(json_path, 'w', encoding='utf-8', newline='') as f:
    json.dump(sorted_mapping, f, ensure_ascii=False)

print("Writing TS...")
with open(ts_path, 'w', encoding='utf-8', newline='') as f:
    f.write('export const tehsilData: Record<string, string[]> = ' + json.dumps(sorted_mapping, ensure_ascii=False) + ';')

print("Done!")
