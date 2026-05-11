@router.get("/dashboard-summary", tags=["Dashboard"])
async def get_dashboard_summary(user_id: str = Query(...), db: Session = Depends(get_db)):
    """
    Get personalized dashboard statistics merging data from MongoDB and SQLite.
    """
    try:
        # 1. Try MongoDB Stats
        stats = None
        try:
            stats = mongo_manager.get_dashboard_stats(user_id)
        except Exception as e:
            print(f"MongoDB connection failed, falling back to local storage: {e}")

        # 2. Get SQLite Data (Fallback/Hybrid)
        local_history = (
            db.query(CropPrediction)
            .filter(CropPrediction.user_id == user_id)
            .order_by(CropPrediction.timestamp.desc())
            .limit(5)
            .all()
        )
        
        # If MongoDB fails or is empty, use local data to build stats
        if not stats:
            total_local = db.query(CropPrediction).filter(CropPrediction.user_id == user_id).count()
            
            # Simple most recommended logic for local
            from collections import Counter
            all_local = db.query(CropPrediction).filter(CropPrediction.user_id == user_id).all()
            crop_counts = Counter([p.recommended_crop for p in all_local])
            most_rec = [c for c, count in crop_counts.most_common(3)]
            
            stats = {
                "total_searches": total_local,
                "most_recommended": most_rec,
                "top_locations": [],
                "last_search": local_history[0].timestamp.isoformat() if local_history else None,
                "recent_history": [],
                "diversity_score": len(crop_counts)
            }
            
            # Format local history for the dashboard
            for p in local_history:
                stats['recent_history'].append({
                    "query": {"type": "soil_analysis", "ph": p.ph},
                    "results": [{"crop": p.recommended_crop, "confidence": p.confidence}],
                    "timestamp": p.timestamp.isoformat()
                })
        else:
            # Stats exist from MongoDB, just format them
            for entry in stats['recent_history']:
                if '_id' in entry: entry['_id'] = str(entry['_id'])
                if 'timestamp' in entry and not isinstance(entry['timestamp'], str): 
                    entry['timestamp'] = entry['timestamp'].isoformat()
            
            if stats['last_search'] and not isinstance(stats['last_search'], str):
                stats['last_search'] = stats['last_search'].isoformat()

        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        print(f"Dashboard Endpoint Error: {e}")
        # Final safety fallback
        return {
            "success": True,
            "data": {
                "total_searches": 0,
                "most_recommended": [],
                "top_locations": [],
                "last_search": None,
                "recent_history": [],
                "diversity_score": 0
            }
        }
