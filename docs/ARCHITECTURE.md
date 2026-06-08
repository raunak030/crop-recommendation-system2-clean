# Architecture Summary — Crop Recommendation System 2 Clean

## 1. Backend Framework

| Component          | Technology          |
|--------------------|---------------------|
| Web Framework      | FastAPI (Python 3)  |
| ASGI Server        | Uvicorn             |
| ML Framework       | scikit-learn (joblib) |
| Data Processing    | Pandas, NumPy       |
| External APIs      | Google Earth Engine (ee), Open-Meteo (via `requests`) |

## 2. Project Structure

```
backend/
├── Procfile                          # Render start command
├── render.yaml                       # Render service definition
├── requirements.txt                  # Python dependencies
├── data/
│   └── Crop_recommendation.csv       # Training dataset
├── models/
│   └── crop_model.pkl                # Trained scikit-learn classifier
├── notebooks/
│   └── eda.ipynb                     # Exploratory Data Analysis
└── src/
    ├── api.py                        # FastAPI application — routes, CORS, prediction logic
    ├── ndvi_service.py               # GEE-backed NDVI computation service
    ├── ndvi_service_backup.py        # Previous version (unchanged reference)
    └── gee_check.py                  # CLI helper to verify GEE connectivity
```

## 3. NDVI Workflow

```
Client (Frontend / curl)
  │  GET /ndvi?lat=...&lon=...
  ▼
FastAPI (api.py:get_ndvi)
  │
  ▼
NDVIService (ndvi_service.py)
  │  __init__ → ee.Initialize() via ServiceAccountCredentials
  │  compute_ndvi(lat, lon, ...)
  │
  ▼
Google Earth Engine
  │  ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  │    → filterBounds(aoi)
  │    → filterDate(start, end)
  │    → filter(CLOUDY_PIXEL_PERCENTAGE < cloud_pct)
  │    → map(NDVI = (B8 - B4) / (B8 + B4))
  │    → sort(system:time_start, desc)
  │    → first()
  │    → reduceRegion(mean, aoi, scale=10)
  │
  ▼
Response: { ndvi_score, health_status, imagery_date, source }
```

## 4. Model / Prediction Workflow

```
Client (Frontend / curl)
  │  POST /predict { N, P, K, temperature, humidity, ph, rainfall, soil_type, lat?, lon? }
  ▼
FastAPI (api.py:predict)
  │
  ├── 1. Base ML Prediction
  │     → Load crop_model.pkl (scikit-learn classifier)
  │     → predict() + predict_proba()
  │     → Returns: recommended_crop, base_model_confidence
  │
  ├── 2. NDVI Fusion (if lat/lon provided)
  │     → Calls get_ndvi_for(lat, lon)
  │     → Classifies NDVI into Healthy/Moderate/Poor/Very poor
  │     → Generates ndvi_adjust delta (±5 to ±15)
  │
  ├── 3. Soil Compatibility
  │     → Matches recommended_crop against hardcoded soil_compat dict
  │     → Returns: strong/weak/unknown match + soil_score
  │
  ├── 4. Weather Heuristic
  │     → Checks temperature (15-35°C ideal) + rainfall (100-3000mm ideal)
  │     → Returns: weather_score (0-100)
  │
  └── 5. Weighted Fusion
        ML_MODEL_WEIGHT = 0.65
        NDVI_WEIGHT = 0.20
        SOIL_WEIGHT = 0.10
        WEATHER_WEIGHT = 0.05
        → adjusted_confidence = Σ(component * weight) + ndvi_adjust * NDVI_WEIGHT
        → Capped to 0-100%
```

## 5. API Architecture

| Method | Endpoint  | Inputs                                      | Outputs                                          |
|--------|-----------|---------------------------------------------|---------------------------------------------------|
| GET    | `/`       | —                                           | `{ message: "Crop Recommendation API Running" }` |
| GET    | `/ndvi`   | `lat`, `lon` (query params)                 | `{ ndvi_score, health_status, imagery_date, source }` |
| POST   | `/predict`| JSON body: CropInput (N, P, K, temp, hum, ph, rainfall, soil_type, lat?, lon?) | `{ recommended_crop, base_model_confidence, adjusted_confidence, ndvi_score, ndvi_health, soil_match, weather_score, input_parameters, explanation }` |

## 6. Deployment Architecture

```
Render (Free Tier)
  │
  ├── web service: crop-recommendation-backend
  │     Web: uvicorn src.api:app --host 0.0.0.0 --port $PORT
  │     Build: pip install -r requirements.txt
  │     Plan: Free
  │
  └── Environment Variables Required:
        ├── GOOGLE_APPLICATION_CREDENTIALS  OR  GOOGLE_CREDENTIALS_JSON
        │     (for GEE Service Account authentication)
        └── PORT (auto-set by Render)
```

## 7. Key Dependencies (ML/NDVI specific)

- `earthengine-api` ≥ 0.1.337 — Google Earth Engine Python client
- `scikit-learn` 1.8.0 — ML model loading and inference
- `joblib` 1.5.3 — Model serialization
- `fastapi` 0.136.3 — API framework
- `pydantic` — Request validation
- `pandas` — DataFrame construction for prediction