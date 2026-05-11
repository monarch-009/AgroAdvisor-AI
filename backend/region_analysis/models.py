import pandas as pd
import numpy as np
import logging
from typing import Dict, Any, Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import xgboost as xgb
import lightgbm as lgb
import pickle
from pathlib import Path

logger = logging.getLogger(__name__)

class RegionModelManager:
    """
    Manages training and comparison of Machine Learning models for 
    crop yield prediction and recommendation rankings.
    """
    
    def __init__(self, models_dir: str = None):
        if models_dir is None:
            project_root = Path(__file__).resolve().parent.parent.parent
            self.models_dir = project_root / "models" / "region_analysis"
        else:
            self.models_dir = Path(models_dir)
            
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.best_model = None
        self.encoders = {}
        self.metrics = {}

    def prepare_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Encodes categorical data and splits features/target."""
        logger.info("Preparing data for ML models...")
        
        # Categorical columns to encode
        cat_cols = ['state_name', 'district_name', 'season', 'crop_name', 'crop_type']
        
        for col in cat_cols:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            self.encoders[col] = le

        # Features: state, district, season, crop, area
        # Target: yield
        X = df[['state_name', 'district_name', 'season', 'crop_name', 'area']]
        y = df['yield']
        
        return train_test_split(X, y, test_size=0.2, random_state=42)

    def train_and_compare(self, X_train, X_test, y_train, y_test) -> Dict[str, Any]:
        """Trains RF, XGBoost, and LightGBM and compares their performance."""
        
        models = {
            "RandomForest": RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42),
            "XGBoost": xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42),
            "LightGBM": lgb.LGBMRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
        }

        results = {}
        
        for name, model in models.items():
            logger.info(f"Training {name}...")
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            
            mae = mean_absolute_error(y_test, preds)
            r2 = r2_score(y_test, preds)
            
            results[name] = {"MAE": mae, "R2": r2, "model": model}
            logger.info(f"{name} Results -> MAE: {mae:.4f}, R2: {r2:.4f}")

        # Select best model based on R2 score
        best_name = max(results, key=lambda k: results[k]['R2'])
        self.best_model = results[best_name]['model']
        self.metrics = results
        
        logger.info(f"Best model selected: {best_name}")
        return results

    def save_assets(self):
        """Saves the best model and encoders."""
        if not self.best_model:
            raise ValueError("No model trained yet.")

        # Save Best Model
        with open(self.models_dir / "best_yield_model.pkl", "wb") as f:
            pickle.dump(self.best_model, f)
            
        # Save Encoders
        with open(self.models_dir / "encoders.pkl", "wb") as f:
            pickle.dump(self.encoders, f)
            
        # Save Metrics
        with open(self.models_dir / "metrics.json", "w") as f:
            import json
            # Remove 'model' object from metrics for JSON serialization
            serializable_metrics = {k: {mk: mv for mk, mv in v.items() if mk != 'model'} for k, v in self.metrics.items()}
            json.dump(serializable_metrics, f, indent=4)

        logger.info(f"Model assets saved to {self.models_dir}")
