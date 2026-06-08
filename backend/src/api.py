from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
import joblib
import pandas as pd
from fastapi import HTTPException
from typing import Optional

from .ndvi_service import get_ndvi_for
from .fertilizer_service import recommend_fertilizer
import requests
import datetime
import math

app = FastAPI()



@app.get("/ndvi")
def get_ndvi(lat: float, lon: float):
    """Compute NDVI using Google Earth Engine via `ndvi_service`.

    This endpoint requires Earth Engine to be installed and authenticated.
    If Earth Engine is not configured the endpoint returns 501 with
    a helpful message directing the user to README setup steps.
    """
    try:
        ndvi_value, acq_date, source = get_ndvi_for(lat, lon)
        # classify
        if ndvi_value >= 0.6:
            status = "Healthy"
        elif ndvi_value >= 0.4:
            status = "Moderate"
        elif ndvi_value >= 0.2:
            status = "Poor"
        else:
            status = "Very poor"

        return {
            "ndvi_score": round(ndvi_value, 3),
            "health_status": status,
            "imagery_date": acq_date,
            "source": source,
        }
    except RuntimeError as rte:
        raise HTTPException(status_code=501, detail=str(rte))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NDVI processing failed: {e}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "https://crop-recommendation-system2-clean.onrender.com",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load('models/crop_model.pkl')

class CropInput(BaseModel):

    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    soil_type: str
    lat: Optional[float] = None
    lon: Optional[float] = None

    @field_validator("N")
    @classmethod
    def validate_n(cls, v):
        if not (0 <= v <= 200):
            raise ValueError(f"N must be between 0 and 200, got {v}")
        return v

    @field_validator("P")
    @classmethod
    def validate_p(cls, v):
        if not (0 <= v <= 200):
            raise ValueError(f"P must be between 0 and 200, got {v}")
        return v

    @field_validator("K")
    @classmethod
    def validate_k(cls, v):
        if not (0 <= v <= 200):
            raise ValueError(f"K must be between 0 and 200, got {v}")
        return v

    @field_validator("temperature")
    @classmethod
    def validate_temperature(cls, v):
        if not (-10 <= v <= 50):
            raise ValueError(f"Temperature must be between -10 and 50°C, got {v}")
        return v

    @field_validator("humidity")
    @classmethod
    def validate_humidity(cls, v):
        if not (0 <= v <= 100):
            raise ValueError(f"Humidity must be between 0 and 100%, got {v}")
        return v

    @field_validator("ph")
    @classmethod
    def validate_ph(cls, v):
        if not (0 <= v <= 14):
            raise ValueError(f"pH must be between 0 and 14, got {v}")
        return v

    @field_validator("rainfall")
    @classmethod
    def validate_rainfall(cls, v):
        if not (0 <= v <= 5000):
            raise ValueError(f"Rainfall must be between 0 and 5000 mm, got {v}")
        return v

    @field_validator("soil_type")
    @classmethod
    def validate_soil_type(cls, v):
        valid_soils = ["Alluvial", "Black", "Red", "Laterite", "Clay", "Sandy", "Loamy"]
        if v not in valid_soils:
            raise ValueError(f"Soil type must be one of {valid_soils}, got '{v}'")
        return v

class FertilizerInput(BaseModel):
    """Input schema for fertilizer recommendation endpoint."""
    crop: str
    N: float
    P: float
    K: float

    @field_validator("N")
    @classmethod
    def validate_n(cls, v):
        if not (0 <= v <= 200):
            raise ValueError(f"N must be between 0 and 200, got {v}")
        return v

    @field_validator("P")
    @classmethod
    def validate_p(cls, v):
        if not (0 <= v <= 200):
            raise ValueError(f"P must be between 0 and 200, got {v}")
        return v

    @field_validator("K")
    @classmethod
    def validate_k(cls, v):
        if not (0 <= v <= 200):
            raise ValueError(f"K must be between 0 and 200, got {v}")
        return v


@app.get("/")
def home():

    return {
        "message":
        "Crop Recommendation API Running"
    }

@app.post("/predict")
def predict(data: CropInput):

    input_df = pd.DataFrame([{

        'N': data.N,
        'P': data.P,
        'K': data.K,
        'temperature': data.temperature,
        'humidity': data.humidity,
        'ph': data.ph,
        'rainfall': data.rainfall

    }])

    # Base ML prediction
    prediction = model.predict(input_df)[0]
    probabilities = model.predict_proba(input_df)[0]
    base_confidence = round(max(probabilities) * 100, 2)

    # Fusion weights
    ML_MODEL_WEIGHT = 0.65
    NDVI_WEIGHT = 0.20
    SOIL_WEIGHT = 0.10
    WEATHER_WEIGHT = 0.05

    # NDVI: fetch if coords provided
    ndvi_score = None
    ndvi_health = None
    ndvi_adjust = 0.0
    if data.lat is not None and data.lon is not None:
        try:
            ndvi_val, acq_date, source = get_ndvi_for(data.lat, data.lon)
            ndvi_score = round(ndvi_val, 3)
            # classify health
            if ndvi_score > 0.65:
                ndvi_health = "Healthy"
                ndvi_adjust = 15.0
            elif ndvi_score >= 0.45:
                ndvi_health = "Moderate"
                ndvi_adjust = 5.0
            elif ndvi_score >= 0.25:
                ndvi_health = "Poor"
                ndvi_adjust = -5.0
            else:
                ndvi_health = "Very poor"
                ndvi_adjust = -15.0
        except Exception:
            ndvi_score = None
            ndvi_health = None

    # Soil compatibility simple lookup
    soil_compat: dict = {
        # crop: compatible soil types
        "rice": ["Alluvial", "Clay"],
        "wheat": ["Loamy", "Alluvial"],
        "maize": ["Loamy", "Alluvial"],
        "sugarcane": ["Alluvial", "Loamy"],
        "cotton": ["Black", "Loamy"],
        "barley": ["Loamy", "Sandy"],
        "chickpea": ["Loamy", "Black"],
    }

    rec_crop = str(prediction).lower()
    soil_match = "unknown"
    soil_score = 50.0
    try:
        comp = soil_compat.get(rec_crop, None)
        if comp is None:
            soil_match = "unknown"
            soil_score = 50.0
        else:
            if data.soil_type in comp:
                soil_match = "strong"
                soil_score = 100.0
            else:
                soil_match = "weak"
                soil_score = 40.0
    except Exception:
        soil_match = "unknown"
        soil_score = 50.0

    # Weather score: heuristic sanity checks
    weather_score = 50.0
    try:
        temp = data.temperature
        rain = data.rainfall
        # temperature ideal window 15-35C
        if 15 <= temp <= 35:
            temp_score = 100.0
        else:
            temp_score = max(0.0, 100.0 - abs(temp - 25.0) * 4.0)
        # rainfall: prefer >100mm (seasonal) but avoid extreme
        if rain >= 100 and rain <= 3000:
            rain_score = 100.0
        else:
            rain_score = max(0.0, 100.0 - abs(rain - 500.0) / 50.0)

        weather_score = round((temp_score * 0.5 + rain_score * 0.5), 2)
    except Exception:
        weather_score = 50.0

    # Compose final adjusted confidence via weighted components
    comp_model = base_confidence * ML_MODEL_WEIGHT
    comp_ndvi = (ndvi_score * 100.0 if ndvi_score is not None else base_confidence) * NDVI_WEIGHT
    comp_soil = soil_score * SOIL_WEIGHT
    comp_weather = weather_score * WEATHER_WEIGHT

    adjusted_confidence = comp_model + comp_ndvi + comp_soil + comp_weather

    # apply NDVI adjustment delta (rules) as additive percentage points scaled by NDVI_WEIGHT influence
    adjusted_confidence = adjusted_confidence + ndvi_adjust * (NDVI_WEIGHT)

    # cap
    adjusted_confidence = max(0.0, min(100.0, round(adjusted_confidence, 2)))

    explanation = []
    explanation.append(f"Base model confidence {base_confidence}%.")
    if ndvi_score is not None:
        explanation.append(f"NDVI {ndvi_score} ({ndvi_health}) adjusted by {ndvi_adjust:+.0f}%.")
    explanation.append(f"Soil match: {soil_match}.")
    explanation.append(f"Weather score: {weather_score}%.")

    return {
        "recommended_crop": prediction,
        "base_model_confidence": base_confidence,
        "adjusted_confidence": adjusted_confidence,
        "ndvi_score": ndvi_score,
        "ndvi_health": ndvi_health,
        "soil_match": soil_match,
        "weather_score": weather_score,
        "input_parameters": {
            "N": data.N,
            "P": data.P,
            "K": data.K,
            "temperature": data.temperature,
            "humidity": data.humidity,
            "ph": data.ph,
            "rainfall": data.rainfall,
            "soil_type": data.soil_type,
            "lat": data.lat,
            "lon": data.lon,
        },
        "explanation": " ".join(explanation),
    }

# === Versioned API routes (/api/v1/*) ===

@app.get("/api/v1/ndvi")
def get_ndvi_v1(lat: float, lon: float):
    """API v1: Compute NDVI using Google Earth Engine."""
    # Reuse the same logic as /ndvi
    return get_ndvi(lat, lon)


@app.post("/api/v1/predict")
def predict_v1(data: CropInput):
    """API v1: Get crop recommendation with weighted fusion."""
    # Reuse the same logic as /predict
    return predict(data)


@app.post("/api/v1/fertilizer")
def fertilizer_recommendation(data: FertilizerInput):
    """API v1: Get fertilizer recommendation based on crop and NPK levels.

    Compares input soil NPK values to the target crop's optimal requirements
    and recommends a fertilizer to address any deficits.
    """
    result = recommend_fertilizer(
        crop=data.crop,
        N=data.N,
        P=data.P,
        K=data.K,
    )
    return result
