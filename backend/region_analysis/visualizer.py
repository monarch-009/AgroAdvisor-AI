import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class Visualizer:
    """
    Generates various agricultural analytical charts and heatmaps.
    """
    
    def __init__(self, output_dir: str = None):
        if output_dir is None:
            project_root = Path(__file__).resolve().parent.parent.parent
            self.output_dir = project_root / "frontend" / "public" / "charts"
        else:
            self.output_dir = Path(output_dir)
            
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def plot_yield_trends(self, df: pd.DataFrame, district: str, crop: str):
        """Generates a line plot for historical yield trends."""
        subset = df[(df['district_name'] == district) & (df['crop_name'] == crop)].copy()
        subset['year_num'] = subset['year'].str.split('-').str[0].astype(int)
        subset.sort_values('year_num', inplace=True)

        plt.figure(figsize=(10, 6))
        sns.lineplot(data=subset, x='year_num', y='yield', marker='o')
        plt.title(f"Yield Trend: {crop} in {district}")
        plt.xlabel("Year")
        plt.ylabel("Yield (Tonnes/Hectare)")
        
        save_path = self.output_dir / f"trend_{district}_{crop}.png"
        plt.savefig(save_path)
        plt.close()
        logger.info(f"Saved yield trend chart to {save_path}")

    def plot_district_performance(self, stats_df: pd.DataFrame, state: str):
        """Generates a bar chart comparing top crops in a state."""
        subset = stats_df[stats_df['state_name'] == state].nlargest(10, 'avg_yield')
        
        fig = px.bar(subset, x='crop_name', y='avg_yield', color='district_name',
                     title=f"Top Yielding Crops in {state}",
                     labels={'avg_yield': 'Average Yield', 'crop_name': 'Crop'})
        
        save_path = self.output_dir / f"performance_{state}.html"
        fig.write_html(str(save_path))
        logger.info(f"Saved interactive performance chart to {save_path}")

    def generate_production_heatmap(self, df: pd.DataFrame, state: str):
        """Generates a heatmap of production across districts and crops."""
        subset = df[df['state_name'] == state]
        pivot = subset.pivot_table(index='crop_name', columns='district_name', values='production', aggfunc='sum').fillna(0)
        
        plt.figure(figsize=(12, 8))
        sns.heatmap(pivot, annot=False, cmap="YlGnBu")
        plt.title(f"Production Heatmap: {state}")
        
        save_path = self.output_dir / f"heatmap_{state}.png"
        plt.savefig(save_path)
        plt.close()
        logger.info(f"Saved production heatmap to {save_path}")
