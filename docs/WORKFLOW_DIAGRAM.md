# Workflow Diagrams

## 1. Prediction Flow (POST /predict)

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                            USER / CLIENT                                │
  │                     (Next.js Frontend or curl)                          │
  └──────────────────────────┬──────────────────────────────────────────────┘
                             │ POST /predict
                             │ { N, P, K, temp, humidity, ph, rainfall,
                             │   soil_type, lat?, lon? }
                             ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │                         FASTAPI (api.py)                             │
  │                                                                       │
  │   ┌─────────────────────────┐   ┌──────────────────────────────────┐ │
  │   │    1. Base ML Predict   │   │   2. NDVI Fusion (if coords)     │ │
  │   │  ┌───────────────────┐  │   │  ┌────────────────────────────┐  │ │
  │   │  │ crop_model.pkl    │  │   │  │ NDVIService.compute_ndvi() │  │ │
  │   │  │ (scikit-learn)    │  │   │  │ → GEE Sentinel-2           │  │ │
  │   │  │ predict()         │  │   │  │ → NDVI score + class       │  │ │
  │   │  │ predict_proba()   │  │   │  │ → ndvi_adjust delta        │  │ │
  │   │  └────────┬──────────┘  │   │  └───────────┬────────────────┘  │ │
  │   └───────────┼─────────────┘   └──────────────┼───────────────────┘ │
  │               │                                 │                      │
  │               ▼                                 ▼                      │
  │   ┌─────────────────────────────────────────────────────────────┐     │
  │   │             3. Soil Compatibility Check                     │     │
  │   │     soil_compat dict → strong / weak / unknown match        │     │
  │   └─────────────────────────────────────────────────────────────┘     │
  │                                                                       │
  │   ┌─────────────────────────────────────────────────────────────┐     │
  │   │             4. Weather Heuristic Check                       │     │
  │   │     Temperature (15-35°C) + Rainfall (100-3000mm) scoring   │     │
  │   └─────────────────────────────────────────────────────────────┘     │
  │                                                                       │
  │   ┌─────────────────────────────────────────────────────────────┐     │
  │   │        5. Weighted Fusion Confidence                        │     │
  │   │        ML 65% + NDVI 20% + Soil 10% + Weather 5%            │     │
  │   │        + NDVI adjustment delta → capped 0-100%              │     │
  │   └─────────────────────────────────────────────────────────────┘     │
  └───────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │                        RESPONSE (JSON)                               │
  │  { recommended_crop, base_model_confidence, adjusted_confidence,     │
  │    ndvi_score, ndvi_health, soil_match, weather_score,               │
  │    input_parameters, explanation }                                   │
  └──────────────────────────────────────────────────────────────────────┘
```

## 2. NDVI Flow (GET /ndvi)

```
  ┌──────────────────────────────────────────────────────────────────────┐
  │                          USER / CLIENT                              │
  └──────────────────────────┬──────────────────────────────────────────┘
                             │ GET /ndvi?lat=19.076&lon=72.877
                             ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │                     FASTAPI (api.py:get_ndvi)                        │
  │                                                                      │
  │  ┌──────────────────────────────────────────────────────────────┐   │
  │  │   try:                                                        │   │
  │  │       ndvi_value, acq_date, source = get_ndvi_for(lat, lon)  │   │
  │  │       classify NDVI → Healthy/Moderate/Poor/Very poor         │   │
  │  │   except RuntimeError → HTTP 501 with instructions            │   │
  │  │   except Exception → HTTP 500                                 │   │
  │  └──────────────────────────────────────────────────────────────┘   │
  └──────────────────────────┬──────────────────────────────────────────┘
                             ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │                   NDVIService (ndvi_service.py)                      │
  │                                                                      │
  │  ┌──────────────────────────────────────────────────────────────┐   │
  │  │   __init__:                                                    │   │
  │  │     1. Check GOOGLE_APPLICATION_CREDENTIALS env var            │   │
  │  │        → ee.ServiceAccountCredentials(None, key_file=path)    │   │
  │  │     2. Check GOOGLE_CREDENTIALS_JSON env var                  │   │
  │  │        → ee.ServiceAccountCredentials(None, key_data=json)    │   │
  │  │     3. Fallback → ee.Initialize() (local dev)                 │   │
  │  │   ee.Initialize(credentials)                                  │   │
  │  └──────────────────────────────────────────────────────────────┘   │
  │                                                                      │
  │  ┌──────────────────────────────────────────────────────────────┐   │
  │  │   compute_ndvi(lat, lon, buffer=1000m, days=30, cloud=20%)  │   │
  │  │                                                              │   │
  │  │   ee.Geometry.Point(lon, lat).buffer(1000)                   │   │
  │  │         │                                                     │   │
  │  │         ▼                                                     │   │
  │  │   ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')          │   │
  │  │         │                                                     │   │
  │  │         ├── .filterBounds(aoi)                                │   │
  │  │         ├── .filterDate(start, end)                           │   │
  │  │         ├── .filter(CLOUDY_PIXEL_PERCENTAGE < 20%)            │   │
  │  │         └── .map(NDVI = (B8-B4)/(B8+B4))                     │   │
  │  │         │                                                     │   │
  │  │         ▼                                                     │   │
  │  │   .sort('system:time_start', desc).first()                    │   │
  │  │         │                                                     │   │
  │  │         ▼                                                     │   │
  │  │   .reduceRegion(mean, aoi, scale=10, bestEffort=true)         │   │
  │  │         │                                                     │   │
  │  │         ▼                                                     │   │
  │  │   Return: (ndvi_value, acq_date, source_string)               │   │
  │  └──────────────────────────────────────────────────────────────┘   │
  └──────────────────────────┬──────────────────────────────────────────┘
                             ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │                    GOOGLE EARTH ENGINE                               │
  │                                                                      │
  │   ┌─────────────────────────────────────────────────────────────┐   │
  │   │  Service Account Auth (OAuth2) → Earth Engine API            │   │
  │   │                                                              │   │
  │   │  ├── COPERNICUS/S2_SR_HARMONIZED (Sentinel-2 Level-2A)      │   │
  │   │  ├── Spatial filter: AOI buffer                              │   │
  │   │  ├── Temporal filter: last 30 days                           │   │
  │   │  ├── Cloud filter: < 20%                                    │   │
  │   │  ├── NDVI computation: (B8 - B4) / (B8 + B4)                 │   │
  │   │  └── Region reduction: mean at 10m scale                     │   │
  │   └─────────────────────────────────────────────────────────────┘   │
  └──────────────────────────────────────────────────────────────────────┘
```

## 3. Deployment Architecture

```
  ┌──────────────────────────────────────────────────────────────────────┐
  │                          USERS                                       │
  │              (Web browsers, mobile apps, curl)                       │
  └──────────────────────────┬──────────────────────────────────────────┘
                             │
                             ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │                         CLOUDFLARE / DNS                            │
  │          crop-recommendation-system2-clean.onrender.com             │
  └──────────────────────────┬──────────────────────────────────────────┘
                             │
                             ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │                     RENDER (Free Tier)                               │
  │                                                                      │
  │  ┌──────────────────────────────────────────────────────────────┐   │
  │  │  Backend Web Service                                          │   │
  │  │  ┌────────────────────────────────────────────────────────┐  │   │
  │  │  │  Uvicorn → FastAPI                                      │  │   │
  │  │  │  src.api:app                                            │  │   │
  │  │  │  Port: $PORT (auto)                                     │  │   │
  │  │  └────────────────────────────────────────────────────────┘  │   │
  │  │  ┌────────────────────────────────────────────────────────┐  │   │
  │  │  │  Environment:                                          │  │   │
  │  │  │  ├── PORT (auto)                                       │  │   │
  │  │  │  ├── GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/gee.json│  │   │
  │  │  │  │   OR                                                 │  │   │
  │  │  │  └── GOOGLE_CREDENTIALS_JSON=<raw json string>          │  │   │
  │  │  └────────────────────────────────────────────────────────┘  │   │
  │  └──────────────────────────────────────────────────────────────┘   │
  │                                                                      │
  └──────────────────────────┬──────────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
  ┌─────────────────────┐     ┌─────────────────────────────────────────┐
  │  scikit-learn       │     │  Google Earth Engine                    │
  │  crop_model.pkl     │     │  (ee.ServiceAccountCredentials)         │
  │  (Local file)       │     │  ┌───────────────────────────────────┐  │
  └─────────────────────┘     │  │  GOOGLE_APPLICATION_CREDENTIALS   │  │
                              │  │  → Service Account JSON file      │  │
                              │  │  OR                               │  │
                              │  │  GOOGLE_CREDENTIALS_JSON           │  │
                              │  │  → Raw JSON string                │  │
                              │  └───────────────────────────────────┘  │
                              │                                         │
                              │  ee.ImageCollection('COPERNICUS/...')  │
                              │     → Sentinel-2                       │
                              │     → NDVI computation                 │
                              └─────────────────────────────────────────┘
```