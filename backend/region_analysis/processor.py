import pandas as pd
import numpy as np
import logging
from pathlib import Path
from typing import Tuple, Dict

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataProcessor:
    """
    Handles data cleaning, feature engineering, and statistical analysis 
    for the Crop-wise Area Production Yield (APY) dataset.
    """
    
    def __init__(self, file_path: str):
        self.file_path = Path(file_path)
        self.df = None
        self.stats_df = None

    def load_and_clean(self) -> pd.DataFrame:
        """Loads and cleans the dataset."""
        logger.info(f"Loading dataset from {self.file_path}")
        
        # Load data
        try:
            # Using low_memory=False to avoid DtypeWarning on large files
            self.df = pd.read_csv(self.file_path, low_memory=False)
        except Exception as e:
            logger.error(f"Failed to load dataset: {e}")
            raise

        # 1. Remove duplicates
        initial_len = len(self.df)
        self.df.drop_duplicates(inplace=True)
        logger.info(f"Removed {initial_len - len(self.df)} duplicates.")

        # 2. Handle missing values
        # Fill production/yield with 0 if missing (or mean per crop)
        self.df['production'] = pd.to_numeric(self.df['production'], errors='coerce').fillna(0)
        self.df['yield'] = pd.to_numeric(self.df['yield'], errors='coerce').fillna(0)
        self.df['area'] = pd.to_numeric(self.df['area'], errors='coerce').fillna(0)

        # 3. Numeric conversion for codes
        for col in ['state_code', 'district_code', 'crop_code']:
            self.df[col] = pd.to_numeric(self.df[col], errors='coerce').fillna(-1).astype(int)

        # 4. Outlier detection (using Z-score for yield)
        yield_mean = self.df['yield'].mean()
        yield_std = self.df['yield'].std()
        # Cap outliers at 3 standard deviations
        self.df['yield'] = self.df['yield'].clip(upper=yield_mean + 3*yield_std)

        logger.info("Data cleaning complete.")
        return self.df

    def engineer_features(self) -> pd.DataFrame:
        """Creates advanced features for recommendation engine."""
        if self.df is None:
            self.load_and_clean()

        logger.info("Engineering features...")

        # A. District-Crop Frequency (Popularity)
        popularity = self.df.groupby(['district_name', 'crop_name']).size().reset_index(name='crop_frequency')
        self.df = self.df.merge(popularity, on=['district_name', 'crop_name'], how='left')

        # B. Yield Stability (Std dev per crop per district)
        stability = self.df.groupby(['district_name', 'crop_name'])['yield'].std().reset_index(name='yield_std')
        stability['yield_std'] = stability['yield_std'].fillna(0)
        self.df = self.df.merge(stability, on=['district_name', 'crop_name'], how='left')

        # C. Average Yield
        avg_yield = self.df.groupby(['district_name', 'crop_name'])['yield'].mean().reset_index(name='avg_yield')
        self.df = self.df.merge(avg_yield, on=['district_name', 'crop_name'], how='left')

        # D. Production Growth (Year-over-year change)
        # Sort by year to calculate growth
        self.df['year_start'] = self.df['year'].str.split('-').str[0].astype(int)
        self.df.sort_values(['district_name', 'crop_name', 'year_start'], inplace=True)
        
        self.df['production_growth'] = self.df.groupby(['district_name', 'crop_name'])['production'].pct_change().fillna(0)
        # Cap growth at 200% to avoid infinity/extremes
        self.df['production_growth'] = self.df['production_growth'].clip(upper=2.0)

        logger.info("Feature engineering complete.")
        return self.df

    def calculate_ranking_scores(self) -> pd.DataFrame:
        """
        Calculates the recommendation score:
        score = (0.5 * avg_yield) + (0.3 * stability_score) + (0.2 * production_growth)
        """
        logger.info("Calculating recommendation scores...")
        
        # Aggregate statistics per district, crop, and season
        stats = self.df.groupby(['state_name', 'district_name', 'season', 'crop_name']).agg({
            'avg_yield': 'mean',
            'yield_std': 'mean',
            'production_growth': 'mean',
            'production': 'sum',
            'area': 'sum'
        }).reset_index()

        # Stability Score: Inverse of Normalized Standard Deviation (higher is better)
        # We normalize yield_std relative to avg_yield (coefficient of variation)
        stats['cv'] = stats['yield_std'] / (stats['avg_yield'] + 1e-6)
        stats['stability_score'] = 1 / (1 + stats['cv'])

        # Normalize components to 0-1 range for scoring
        for col in ['avg_yield', 'stability_score', 'production_growth']:
            stats[f'norm_{col}'] = (stats[col] - stats[col].min()) / (stats[col].max() - stats[col].min() + 1e-6)

        # Final Score (Weighted)
        stats['recommendation_score'] = (
            (0.5 * stats['norm_avg_yield']) + 
            (0.3 * stats['norm_stability_score']) + 
            (0.2 * stats['norm_production_growth'])
        ) * 100

        self.stats_df = stats
        return stats

    def get_top_recommendations(self, state: str, district: str, season: str, top_n: int = 5) -> pd.DataFrame:
        """Returns top N crops for a given location and season."""
        if self.stats_df is None:
            self.calculate_ranking_scores()

        result = self.stats_df[
            (self.stats_df['state_name'].str.upper() == state.upper()) &
            (self.stats_df['district_name'].str.upper() == district.upper()) &
            (self.stats_df['season'].str.upper() == season.upper())
        ].sort_values('recommendation_score', ascending=False)

        return result.head(top_n)
