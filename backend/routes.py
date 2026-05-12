"""
API Routes
==========
Agent 3 — Backend/API

REST API endpoints for the Crop Advisory System:
  POST /predict-crop     — Crop recommendation
  POST /detect-disease   — Plant disease detection
  GET  /weather          — Weather data (OpenWeatherMap)
  GET  /market-prices    — Crop market prices
  GET  /predictions      — Prediction history
"""

import os
import json
import requests
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db, CropPrediction, DiseaseDetection, AdvisoryLog
from model_inference import predict_crop, detect_disease
from gemini_service import generate_crop_growth_guide
from region_analysis.service import RegionAnalysisService


router = APIRouter()

# ── OpenWeatherMap config ───────────────────────────────────────────────────
OWM_API_KEY = os.environ.get("OPENWEATHERMAP_API_KEY", "")
OWM_BASE_URL = "https://api.openweathermap.org/data/2.5"

# ── Region Analysis Service ────────────────────────────────────────────────
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "datasets", "crop-wise-area-production-yield.csv")
region_service = RegionAnalysisService(DATA_PATH)

# ── MongoDB Manager for Search History ────────────────────────────────────
from region_analysis.database import MongoManager
mongo_manager = MongoManager()
try:
    mongo_manager.connect()
except Exception:
    print("WARNING: MongoDB not connected. History features will be limited.")



# ── Request/Response Models ─────────────────────────────────────────────────

class CropInput(BaseModel):
    """Input parameters for crop prediction."""
    N: float = Field(..., ge=0, le=500, description="Nitrogen content (kg/ha)")
    P: float = Field(..., ge=0, le=500, description="Phosphorus content (kg/ha)")
    K: float = Field(..., ge=0, le=500, description="Potassium content (kg/ha)")
    temperature: float = Field(..., ge=-20, le=60, description="Temperature (°C)")
    humidity: float = Field(..., ge=0, le=100, description="Humidity (%)")
    ph: float = Field(..., ge=0, le=14, description="Soil pH value")
    rainfall: float = Field(..., ge=0, le=3000, description="Rainfall (mm)")
    user_id: str = Field("guest", description="Clerk User ID")


class LocationCropInput(BaseModel):
    """Input parameters for location-based crop prediction."""
    state: str = Field(..., description="Name of the State")
    district: str = Field(..., description="Name of the District")
    tehsil: str = Field("", description="Name of the Tehsil (Optional)")
    user_id: str = Field("guest", description="Clerk User ID")


class SoilFetchRequest(BaseModel):
    """Input for fetching soil data based on village/district."""
    state: str
    district: str
    village: str


class GrowthGuideRequest(BaseModel):
    """Input for Gemini growth guide generation."""
    crop_name: str
    state: str = ""
    district: str = ""


class CropResult(BaseModel):
    crop: str
    confidence: float


class CropResponse(BaseModel):
    success: bool
    recommendations: list[CropResult]
    message: str = ""


class DiseaseResponse(BaseModel):
    success: bool
    disease: str
    confidence: float
    treatment: str
    is_healthy: bool


# ── Crop Prediction ─────────────────────────────────────────────────────────

@router.post("/predict-crop", response_model=CropResponse, tags=["Predictions"])
async def predict_crop_endpoint(data: CropInput, db: Session = Depends(get_db)):
    """
    Recommend crops based on soil and climate conditions.

    Accepts soil nutrient levels (N, P, K), climate data (temperature, humidity, rainfall),
    and soil pH. Returns top 3 recommended crops with confidence scores.
    """
    try:
        results = predict_crop(
            N=data.N, P=data.P, K=data.K,
            temperature=data.temperature,
            humidity=data.humidity,
            ph=data.ph,
            rainfall=data.rainfall,
        )

        # Log to database
        prediction = CropPrediction(
            user_id=data.user_id,
            nitrogen=data.N,
            phosphorus=data.P,
            potassium=data.K,
            temperature=data.temperature,
            humidity=data.humidity,
            ph=data.ph,
            rainfall=data.rainfall,
            recommended_crop=results[0]["crop"] if results else "Unknown",
            confidence=results[0]["confidence"] if results else 0.0,
            top_3_crops=json.dumps(results),
        )
        db.add(prediction)

        advisory = AdvisoryLog(
            user_id=data.user_id,
            action_type="crop_prediction",
            request_summary=f"N={data.N}, P={data.P}, K={data.K}, temp={data.temperature}",
            response_summary=f"Recommended: {results[0]['crop']}" if results else "No result",
        )
        db.add(advisory)
        db.commit()

        return CropResponse(
            success=True,
            recommendations=[CropResult(**r) for r in results],
            message=f"Top recommendation: {results[0]['crop']}" if results else "",
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post("/predict-crop-location", response_model=CropResponse, tags=["Predictions"])
async def predict_crop_location_endpoint(data: LocationCropInput, db: Session = Depends(get_db)):
    """
    Recommend crops based on location (State, District, and Tehsil).
    """
    from model_inference import predict_crop_by_location
    try:
        results = predict_crop_by_location(
            state=data.state, 
            district=data.district,
            tehsil=data.tehsil
        )

        advisory = AdvisoryLog(
            user_id=data.user_id,
            action_type="crop_prediction_location",
            request_summary=f"State={data.state}, District={data.district}, Tehsil={data.tehsil}",
            response_summary=f"Recommended: {results[0]['crop']}" if results else "No result",
        )
        db.add(advisory)
        db.commit()

        # ── MongoDB Logging (Regional History) ────────────────────────────
        try:
            mongo_manager.store_recommendation(
                user_query=data.dict(),
                recommendations=results,
                user_id=data.user_id
            )
        except Exception as e:
            print(f"MongoDB Log Error: {e}")

        return CropResponse(
            success=True,
            recommendations=[CropResult(**r) for r in results],
            message=f"Top recommendation for {data.district}, {data.state}: {results[0]['crop']}" if results else "",
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post("/generate-growth-guide", tags=["AI Advisory"])
async def generate_growth_guide_endpoint(data: GrowthGuideRequest, db: Session = Depends(get_db)):
    """
    Generate a detailed crop growth guide using Gemini AI.
    """
    try:
        location_info = f"{data.district}, {data.state}" if data.state and data.district else None
        guide_text = generate_crop_growth_guide(data.crop_name, location_info)
        
        # Log to database
        advisory = AdvisoryLog(
            action_type="gemini_growth_guide",
            request_summary=f"Crop: {data.crop_name}, Location: {location_info}",
            response_summary="Generated guide using Gemini AI",
        )
        db.add(advisory)
        db.commit()
        
        return {
            "success": True,
            "crop": data.crop_name,
            "guide": guide_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Advisory error: {str(e)}")


@router.post("/fetch-soil-data", tags=["Data"])
async def fetch_soil_data_endpoint(data: SoilFetchRequest):
    """
    Predict soil nutrient levels based on location (Village, District, State).
    """
    from model_inference import predict_soil_nutrients
    try:
        soil_data = predict_soil_nutrients(
            state=data.state,
            district=data.district,
            village=data.village
        )
        return {
            "success": True,
            "data": soil_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Soil data fetch error: {str(e)}")


# ── Disease Detection ───────────────────────────────────────────────────────

# Load disease info dataset from file (PlantVillage / ICAR sourced data)
_DISEASE_INFO_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "metadata", "disease_info.json")
_disease_info_cache = None


def _load_disease_info():
    """Load and cache disease information dataset."""
    global _disease_info_cache
    if _disease_info_cache is None:
        try:
            with open(_DISEASE_INFO_PATH, "r", encoding="utf-8") as f:
                _disease_info_cache = json.load(f)
        except FileNotFoundError:
            _disease_info_cache = {"_meta": {}, "diseases": {}, "healthy_response": {}}
    return _disease_info_cache


@router.post("/detect-disease", tags=["Predictions"])
async def detect_disease_endpoint(
    file: UploadFile = File(..., description="Leaf image for disease detection"),
    db: Session = Depends(get_db),
):
    """
    Detect plant disease from an uploaded leaf image.

    Accepts a plant leaf image (JPEG/PNG) and returns the detected disease,
    confidence score, recommended treatment, and detailed disease information
    sourced from agricultural research databases.
    """
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg", "image/webp"]:
        raise HTTPException(400, "Only JPEG, PNG, and WebP images are supported.")

    try:
        image_bytes = await file.read()
        result = detect_disease(image_bytes)

        # Enrich response with detailed disease information
        disease_data = _load_disease_info()
        disease_key = result.get("disease_key", "")
        disease_detail = disease_data.get("diseases", {}).get(disease_key)
        healthy_info = disease_data.get("healthy_response", {})

        enriched = {
            "success": True,
            **result,
            "source": disease_data.get("_meta", {}).get("source", "Agricultural database"),
            "model_type": disease_data.get("_meta", {}).get("model", "CNN"),
        }

        if result["is_healthy"]:
            enriched["detail"] = {
                "description": healthy_info.get("description", "Plant appears healthy."),
                "best_practices": healthy_info.get("best_practices", []),
            }
        elif disease_detail:
            enriched["detail"] = disease_detail

        # Log to database
        detection = DiseaseDetection(
            image_filename=file.filename,
            detected_disease=result["disease"],
            confidence=result["confidence"],
            treatment=result["treatment"],
            is_healthy=result["is_healthy"],
        )
        db.add(detection)

        advisory = AdvisoryLog(
            action_type="disease_detection",
            request_summary=f"Image: {file.filename}",
            response_summary=f"Disease: {result['disease']} ({result['confidence']:.2%})",
        )
        db.add(advisory)
        db.commit()

        return enriched

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection error: {str(e)}")


@router.get("/disease-info/{disease_key}", tags=["Data"])
async def get_disease_info(disease_key: str):
    """
    Get detailed information about a specific plant disease.

    Returns comprehensive data including causes, symptoms, treatments,
    eco-friendly remedies, nutritional impact, and best practices.
    Data sourced from PlantVillage dataset and ICAR pathology guidelines.
    """
    data = _load_disease_info()
    diseases = data.get("diseases", {})

    info = diseases.get(disease_key)
    if not info:
        # Try case-insensitive partial match
        for key, val in diseases.items():
            if disease_key.lower() in key.lower() or key.lower() in disease_key.lower():
                info = val
                break

    if not info:
        raise HTTPException(
            status_code=404,
            detail=f"Disease '{disease_key}' not found. Available: {', '.join(diseases.keys())}",
        )

    return {
        "success": True,
        "source": data.get("_meta", {}).get("source", "Agricultural database"),
        "data": info,
    }


# ── Weather Data ────────────────────────────────────────────────────────────

# WMO Weather Codes → human-readable descriptions
WMO_CODES = {
    0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
    45: "fog", 48: "depositing rime fog",
    51: "light drizzle", 53: "moderate drizzle", 55: "dense drizzle",
    61: "slight rain", 63: "moderate rain", 65: "heavy rain",
    71: "slight snow", 73: "moderate snow", 75: "heavy snow",
    80: "slight rain showers", 81: "moderate rain showers", 82: "violent rain showers",
    85: "slight snow showers", 86: "heavy snow showers",
    95: "thunderstorm", 96: "thunderstorm with slight hail", 99: "thunderstorm with heavy hail",
}


def _geocode_city(city: str):
    """Resolve a city name to lat/lon using Open-Meteo geocoding (free, no key)."""
    resp = requests.get(
        "https://geocoding-api.open-meteo.com/v1/search",
        params={"name": city, "count": 1, "language": "en"},
        timeout=8,
    )
    if resp.status_code == 200:
        results = resp.json().get("results")
        if results and len(results) > 0:
            r = results[0]
            return r["latitude"], r["longitude"], r.get("name", city), r.get("country", "")
    return None


def _fetch_open_meteo(lat: float, lon: float):
    """Fetch current weather + hourly forecast from Open-Meteo (free, no key)."""
    resp = requests.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,surface_pressure,weather_code,wind_speed_10m",
            "hourly": "temperature_2m,relative_humidity_2m,weather_code",
            "forecast_days": 2,
            "timezone": "auto",
        },
        timeout=10,
    )
    if resp.status_code == 200:
        return resp.json()
    return None


@router.get("/weather", tags=["Data"])
async def get_weather(
    city: str = Query("Mumbai", description="City name for weather forecast"),
    db: Session = Depends(get_db),
):
    """
    Get real-time weather data for a city.

    Uses Open-Meteo API (free, no key required) as the primary source.
    Falls back to OpenWeatherMap if configured, then sample data as a last resort.
    """

    # ── Strategy 1: Open-Meteo (free, no API key) ──────────────────────────
    try:
        geo = _geocode_city(city)
        if geo:
            lat, lon, resolved_name, country = geo
            data = _fetch_open_meteo(lat, lon)
            if data and "current" in data:
                current = data["current"]
                wmo = current.get("weather_code", 0)

                weather = {
                    "city": f"{resolved_name}, {country}" if country else resolved_name,
                    "temperature": round(current["temperature_2m"], 1),
                    "humidity": current["relative_humidity_2m"],
                    "pressure": round(current.get("surface_pressure", 1013)),
                    "description": WMO_CODES.get(wmo, "unknown"),
                    "wind_speed": round(current.get("wind_speed_10m", 0), 1),
                    "icon": "01d" if wmo <= 1 else "02d" if wmo <= 3 else "09d",
                    "source": "Open-Meteo (live)",
                }

                # Build 5-period forecast from hourly data (every 6 hours)
                hourly = data.get("hourly", {})
                times = hourly.get("time", [])
                temps = hourly.get("temperature_2m", [])
                hums = hourly.get("relative_humidity_2m", [])
                codes = hourly.get("weather_code", [])

                forecast = []
                step = max(1, len(times) // 5)
                for idx in range(0, len(times), step):
                    if len(forecast) >= 5:
                        break
                    forecast.append({
                        "datetime": times[idx],
                        "temperature": round(temps[idx], 1) if idx < len(temps) else 0,
                        "humidity": hums[idx] if idx < len(hums) else 0,
                        "description": WMO_CODES.get(codes[idx] if idx < len(codes) else 0, "unknown"),
                    })
                weather["forecast"] = forecast

                db.add(AdvisoryLog(
                    action_type="weather",
                    request_summary=f"City: {city}",
                    response_summary=f"Temp: {weather['temperature']}°C (live)",
                ))
                db.commit()
                return {"success": True, "data": weather}
    except Exception:
        pass  # fall through

    # ── Strategy 2: OpenWeatherMap (needs API key) ─────────────────────────
    if OWM_API_KEY:
        try:
            resp = requests.get(
                f"{OWM_BASE_URL}/weather",
                params={"q": city, "appid": OWM_API_KEY, "units": "metric"},
                timeout=10,
            )
            if resp.status_code == 200:
                data = resp.json()
                weather = {
                    "city": data.get("name", city),
                    "temperature": data["main"]["temp"],
                    "humidity": data["main"]["humidity"],
                    "pressure": data["main"]["pressure"],
                    "description": data["weather"][0]["description"],
                    "wind_speed": data["wind"]["speed"],
                    "icon": data["weather"][0]["icon"],
                    "source": "OpenWeatherMap (live)",
                }
                forecast_resp = requests.get(
                    f"{OWM_BASE_URL}/forecast",
                    params={"q": city, "appid": OWM_API_KEY, "units": "metric", "cnt": 5},
                    timeout=10,
                )
                if forecast_resp.status_code == 200:
                    forecast_data = forecast_resp.json()
                    weather["forecast"] = [
                        {
                            "datetime": f["dt_txt"],
                            "temperature": f["main"]["temp"],
                            "humidity": f["main"]["humidity"],
                            "description": f["weather"][0]["description"],
                        }
                        for f in forecast_data.get("list", [])
                    ]
                db.add(AdvisoryLog(
                    action_type="weather",
                    request_summary=f"City: {city}",
                    response_summary=f"Temp: {weather['temperature']}°C",
                ))
                db.commit()
                return {"success": True, "data": weather}
        except Exception:
            pass  # fall through

    # ── Strategy 3: Sample fallback ────────────────────────────────────────
    sample_weather = {
        "city": city,
        "temperature": 28.5,
        "humidity": 72,
        "pressure": 1012,
        "description": "partly cloudy",
        "wind_speed": 3.5,
        "icon": "02d",
        "source": "Sample Data (could not reach weather services)",
        "forecast": [
            {"datetime": "12:00", "temperature": 29.0, "humidity": 70, "description": "sunny"},
            {"datetime": "18:00", "temperature": 26.5, "humidity": 75, "description": "cloudy"},
            {"datetime": "06:00", "temperature": 24.0, "humidity": 80, "description": "light rain"},
        ],
    }
    return {"success": True, "data": sample_weather}


# ── Market Prices ───────────────────────────────────────────────────────────

@router.get("/market-prices", tags=["Data"])
async def get_market_prices(db: Session = Depends(get_db)):
    """
    Get current crop market prices.

    Returns sample market price data for major crops.
    In production, this would integrate with Agmarknet or similar APIs.
    """
    prices = [
        {"crop": "Rice", "market": "Mumbai APMC", "price_per_quintal": 2150, "unit": "INR", "trend": "up", "change": 2.5},
        {"crop": "Wheat", "market": "Delhi APMC", "price_per_quintal": 2275, "unit": "INR", "trend": "stable", "change": 0.3},
        {"crop": "Maize", "market": "Bangalore APMC", "price_per_quintal": 1950, "unit": "INR", "trend": "down", "change": -1.2},
        {"crop": "Cotton", "market": "Ahmedabad APMC", "price_per_quintal": 6200, "unit": "INR", "trend": "up", "change": 3.8},
        {"crop": "Sugarcane", "market": "Pune APMC", "price_per_quintal": 315, "unit": "INR", "trend": "stable", "change": 0.1},
        {"crop": "Soybean", "market": "Indore APMC", "price_per_quintal": 4600, "unit": "INR", "trend": "up", "change": 1.5},
        {"crop": "Potato", "market": "Kolkata APMC", "price_per_quintal": 1200, "unit": "INR", "trend": "down", "change": -2.1},
        {"crop": "Tomato", "market": "Chennai APMC", "price_per_quintal": 2800, "unit": "INR", "trend": "up", "change": 5.2},
        {"crop": "Onion", "market": "Nashik APMC", "price_per_quintal": 1800, "unit": "INR", "trend": "down", "change": -3.4},
        {"crop": "Jute", "market": "Kolkata APMC", "price_per_quintal": 5100, "unit": "INR", "trend": "stable", "change": 0.7},
    ]

    db.add(AdvisoryLog(
        action_type="market",
        request_summary="Market prices request",
        response_summary=f"Returned {len(prices)} crop prices",
    ))
    db.commit()

    return {
        "success": True,
        "data": prices,
        "last_updated": "2025-01-01T12:00:00",
        "source": "Sample Data (Agmarknet-style)",
    }


# ── History ─────────────────────────────────────────────────────────────────

@router.get("/predictions", tags=["History"])
async def get_prediction_history(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Get recent crop prediction history."""
    predictions = (
        db.query(CropPrediction)
        .order_by(CropPrediction.timestamp.desc())
        .limit(limit)
        .all()
    )
    return {
        "success": True,
        "data": [
            {
                "id": p.id,
                "timestamp": p.timestamp.isoformat() if p.timestamp else None,
                "inputs": {
                    "N": p.nitrogen, "P": p.phosphorus, "K": p.potassium,
                    "temperature": p.temperature, "humidity": p.humidity,
                    "ph": p.ph, "rainfall": p.rainfall,
                },
                "recommended_crop": p.recommended_crop,
                "confidence": p.confidence,
                "top_3": json.loads(p.top_3_crops) if p.top_3_crops else [],
            }
            for p in predictions
        ],
    }


# ── Crop Information ───────────────────────────────────────────────────────

# Load crop info dataset from file (ICAR / FAO sourced data)
_CROP_INFO_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "metadata", "crop_info.json")
_crop_info_cache = None


def _load_crop_info():
    """Load and cache crop information dataset."""
    global _crop_info_cache
    if _crop_info_cache is None:
        try:
            with open(_CROP_INFO_PATH, "r", encoding="utf-8") as f:
                _crop_info_cache = json.load(f)
        except FileNotFoundError:
            _crop_info_cache = {"_meta": {}, "crops": {}}
    return _crop_info_cache


@router.get("/crop-info", tags=["Data"])
async def get_all_crop_info():
    """
    Get information for all crops in the dataset.

    Returns metadata about all available crops from the ICAR/FAO sourced dataset.
    """
    data = _load_crop_info()
    crops = data.get("crops", {})
    summary = {
        name: {
            "name": info.get("name", name),
            "category": info.get("category", ""),
            "scientific_name": info.get("scientific_name", ""),
            "family": info.get("family", ""),
        }
        for name, info in crops.items()
    }
    return {
        "success": True,
        "count": len(summary),
        "source": data.get("_meta", {}).get("source", "Agricultural dataset"),
        "data": summary,
    }


@router.get("/crop-info/{crop_name}", tags=["Data"])
async def get_crop_info(crop_name: str):
    """
    Get detailed growing information for a specific crop.

    Returns comprehensive data including growing conditions, soil requirements,
    water needs, cultivation practices, harvest indicators, common diseases,
    and nutritional values. Data sourced from ICAR guidelines and FAO databases.
    """
    data = _load_crop_info()
    crops = data.get("crops", {})

    # Case-insensitive lookup
    crop_key = crop_name.lower()
    crop = crops.get(crop_key)

    if not crop:
        # Try matching by name field
        for key, info in crops.items():
            if info.get("name", "").lower() == crop_key:
                crop = info
                break

    if not crop:
        raise HTTPException(
            status_code=404,
            detail=f"Crop '{crop_name}' not found in dataset. Available: {', '.join(c.get('name', k) for k, c in crops.items())}",
        )

    return {
        "success": True,
        "source": data.get("_meta", {}).get("source", "Agricultural dataset"),
        "last_updated": data.get("_meta", {}).get("last_updated", ""),
        "data": crop,
    }


@router.get("/recommend")
async def get_regional_recommendation(
    state: str = Query(..., description="State name"),
    district: str = Query(..., description="District name"),
    season: str = Query(..., description="Season (Kharif, Rabi, etc.)"),
    user_id: str = Query("guest", description="Clerk User ID")
):
    """
    Get intelligent regional crop recommendations based on historical APY data.
    """
    try:
        recommendations = region_service.recommend(state, district, season)
        
        # ── MongoDB Logging (Regional Analysis) ───────────────────────────
        try:
            mongo_manager.store_recommendation(
                user_query={"state": state, "district": district, "season": season, "type": "regional_analysis"},
                recommendations=recommendations,
                user_id=user_id
            )
        except Exception as e:
            print(f"MongoDB Log Error: {e}")
            
        return {"recommended_crops": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation engine failed: {str(e)}")

# ── Dashboard & Personalized History ──────────────────────────────────────

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
        
        # If MongoDB fails or is empty, use local data to build stats
        if not stats:
            # 2. Get SQLite Data (Fallback/Hybrid)
            local_history = (
                db.query(CropPrediction)
                .filter(CropPrediction.user_id == user_id)
                .order_by(CropPrediction.timestamp.desc())
                .limit(5)
                .all()
            )
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")

@router.get("/user-history", tags=["Dashboard"])
async def get_user_search_history(user_id: str = Query(...), limit: int = 10):
    """
    Get detailed search history for a specific user from MongoDB.
    """
    try:
        history = mongo_manager.get_user_history(user_id, limit)
        for entry in history:
            if '_id' in entry: entry['_id'] = str(entry['_id'])
            if 'timestamp' in entry: entry['timestamp'] = entry['timestamp'].isoformat()
            
        return {
            "success": True,
            "data": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History error: {str(e)}")
