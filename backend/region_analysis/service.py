import pandas as pd
from pathlib import Path
from typing import List, Dict, Any
from .processor import DataProcessor
from .models import RegionModelManager
from .database import MongoManager
from .visualizer import Visualizer
import logging

logger = logging.getLogger(__name__)

class RegionAnalysisService:
    """
    Facade service that orchestrates the Region Analysis logic.
    """
    
    def __init__(self, data_path: str):
        self.processor = DataProcessor(data_path)
        self.model_manager = RegionModelManager()
        self.db = MongoManager()
        self.visualizer = Visualizer()
        self.is_initialized = False

    def initialize_system(self, run_ml: bool = False):
        """Initializes the data, calculates stats, and optionally trains models."""
        logger.info("Initializing Region Analysis System...")
        
        # Resolve absolute path to project root
        project_root = Path(__file__).resolve().parent.parent.parent
        cache_path = project_root / "models" / "region_analysis" / "stats_cache.pkl"
        
        if cache_path.exists() and not run_ml:
            logger.info("Loading statistics from cache...")
            import pickle
            with open(cache_path, "rb") as f:
                self.processor.stats_df = pickle.load(f)
            self.is_initialized = True
            logger.info("System Initialized from cache.")
            return

        # 1. Process Data
        df = self.processor.engineer_features()
        self.processor.calculate_ranking_scores()
        
        # Save cache
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        import pickle
        with open(cache_path, "wb") as f:
            pickle.dump(self.processor.stats_df, f)
        logger.info(f"Statistics cached to {cache_path}")
        
        # 2. ML Training (Optional)
        if run_ml:
            X_train, X_test, y_train, y_test = self.model_manager.prepare_data(df)
            self.model_manager.train_and_compare(X_train, X_test, y_train, y_test)
            self.model_manager.save_assets()

        # 3. DB Sync
        try:
            self.db.connect()
            # Convert stats to list of dicts for Mongo
            stats_list = self.processor.stats_df.to_dict('records')
            self.db.upload_statistics(stats_list)
        except Exception as e:
            logger.warning(f"Database sync failed (skipping for now): {e}")

        self.is_initialized = True
        logger.info("System Initialized Successfully.")

    def recommend(self, state: str, district: str, season: str) -> List[Dict[str, Any]]:
        """
        Generates crop recommendations with explainable AI details.
        """
        if not self.is_initialized:
            self.initialize_system()

        top_crops = self.processor.get_top_recommendations(state, district, season)
        
        recommendations = []
        for _, row in top_crops.iterrows():
            # Explainable AI logic
            reason = self._generate_reason(row)
            
            recommendations.append({
                "crop": row['crop_name'],
                "score": round(row['recommendation_score'], 2),
                "avg_yield": round(row['avg_yield'], 3),
                "stability": "High" if row['stability_score'] > 0.7 else "Moderate" if row['stability_score'] > 0.4 else "Low",
                "trend": "Increasing" if row['production_growth'] > 0.05 else "Stable" if row['production_growth'] > -0.05 else "Declining",
                "reason": reason
            })

        # Store to DB (Optional, skip if DB is down)
        try:
            self.db.store_recommendation(
                {"state": state, "district": district, "season": season},
                recommendations
            )
        except Exception as e:
            logger.warning(f"Failed to log recommendation to database: {e}")

        return recommendations

    def _generate_reason(self, row: pd.Series) -> str:
        """Helper to generate a human-readable explanation for a recommendation."""
        reasons = []
        if row['avg_yield'] > self.processor.stats_df['avg_yield'].median():
            reasons.append("exceptional historical yield")
        if row['stability_score'] > 0.8:
            reasons.append("consistent performance over years")
        if row['production_growth'] > 0.1:
            reasons.append("strong upward growth trend")
            
        if not reasons:
            return "Good overall performance in this district."
        
        return f"Recommended due to {' and '.join(reasons)}."
