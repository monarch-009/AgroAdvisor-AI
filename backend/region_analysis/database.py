import logging
import os
from datetime import datetime
from pymongo import MongoClient
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class MongoManager:
    """
    Handles connections and operations with MongoDB Atlas for storing 
    crop history, statistics, and recommendations.
    """
    
    def __init__(self):
        # Fallback to local if URI not provided, but usually expected in .env
        self.uri = os.getenv("MONGODB_URI")
        self.db_name = os.getenv("MONGODB_DB_NAME", "agroadvisor_region_db")
        self.client = None
        self.db = None
        self.failed_before = False

    def connect(self):
        """Establishes connection to MongoDB Atlas."""
        self.uri = os.getenv("MONGODB_URI") # Always reload URI to pick up .env changes
        if not self.uri or "<username>" in self.uri:
            raise ConnectionError("MongoDB URI is missing or contains placeholders.")
            
        try:
            # Set a 5-second timeout for connection attempts
            self.client = MongoClient(self.uri, serverSelectionTimeoutMS=5000)
            self.db = self.client[self.db_name]
            # Verify connection
            self.client.admin.command('ping')
            self.failed_before = False
            logger.info("Successfully connected to MongoDB Atlas.")
        except Exception as e:
            self.failed_before = True
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    def upload_statistics(self, stats_list: List[Dict[str, Any]]):
        """Uploads calculated crop statistics to 'crop_statistics' collection."""
        if self.db is None: self.connect()
        collection = self.db['crop_statistics']
        # Clear old stats or use update logic
        collection.delete_many({})
        collection.insert_many(stats_list)
        logger.info(f"Uploaded {len(stats_list)} statistics records.")

    def store_recommendation(self, user_query: Dict[str, Any], recommendations: List[Dict[str, Any]], user_id: str = "guest"):
        """Logs a recommendation request and its results associated with a user."""
        if self.db is None: self.connect()
        collection = self.db['user_search_history']
        log_entry = {
            "user_id": user_id,
            "query": user_query,
            "results": recommendations,
            "timestamp": datetime.utcnow()
        }
        collection.insert_one(log_entry)
        logger.info(f"Logged recommendation for user {user_id} to MongoDB.")

    def get_user_history(self, user_id: str, limit: int = 5):
        """Fetches recent search history for a specific user."""
        if self.db is None: self.connect()
        collection = self.db['user_search_history']
        return list(collection.find({"user_id": user_id}).sort("timestamp", -1).limit(limit))

    def get_dashboard_stats(self, user_id: str):
        """Calculates personalized statistics for the user dashboard."""
        if self.db is None: self.connect()
        collection = self.db['user_search_history']
        
        # Normalize User ID (remove any whitespace)
        user_id = user_id.strip()
        
        # Get all user searches
        # Try sorting by timestamp, fallback to _id if needed
        try:
            history = list(collection.find({"user_id": user_id}).sort("timestamp", -1))
            if not history:
                # Fallback check: maybe timestamps are missing?
                history = list(collection.find({"user_id": user_id}).sort("_id", -1))
        except Exception as e:
            logger.error(f"Sort failed, trying unsorted: {e}")
            history = list(collection.find({"user_id": user_id}))
        
        # DIAGNOSTIC LOGGING
        all_docs_count = collection.count_documents({})
        logger.info(f"--- MONGODB DIAGNOSTICS ---")
        logger.info(f"DB Name: {self.db_name}")
        logger.info(f"Total Docs in Collection: {all_docs_count}")
        logger.info(f"Searching for User ID: '{user_id}'")
        logger.info(f"Documents found for this user: {len(history)}")
        
        if not history:
            # If nothing found, list the first 3 IDs in DB to compare
            sample_ids = list(collection.find({}, {"user_id": 1}).limit(3))
            logger.info(f"Sample IDs in DB: {[d.get('user_id') for d in sample_ids]}")
            return None
            
        # Extract most searched crops & locations
        crop_counts = {}
        locations = {}
        
        for entry in history:
            # Handle different result formats (Dict for soil, String for regional)
            res_list = entry.get('results', [])
            if res_list:
                top_crop = None
                first_res = res_list[0]
                if isinstance(first_res, dict):
                    top_crop = first_res.get('crop')
                else:
                    top_crop = str(first_res)
                
                if top_crop:
                    crop_counts[top_crop] = crop_counts.get(top_crop, 0) + 1
            
            # Extract location if available
            q = entry.get('query', {})
            loc_str = f"{q.get('district')}, {q.get('state')}" if q.get('district') else None
            if loc_str:
                locations[loc_str] = locations.get(loc_str, 0) + 1
        
        most_recommended = sorted(crop_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        top_locations = sorted(locations.items(), key=lambda x: x[1], reverse=True)[:2]
        
        # Safe timestamp extraction
        last_ts = history[0].get('timestamp')
        if not last_ts:
            # Try to extract from _id (ObjectId has creation time)
            last_ts = history[0]['_id'].generation_time
            
        return {
            "total_searches": len(history),
            "most_recommended": [crop for crop, count in most_recommended],
            "top_locations": [loc for loc, count in top_locations],
            "last_search": last_ts,
            "recent_history": history[:5], 
            "diversity_score": len(crop_counts) 
        }

    def get_crop_history(self, crop_name: str, district: str) -> List[Dict[str, Any]]:
        """Retrieves historical data for a specific crop in a district."""
        if self.db is None: self.connect()
        collection = self.db['crop_history']
        return list(collection.find({"crop_name": crop_name, "district_name": district}))
