# Product Requirements Document (PRD)

## Crop Recommendation System 2 Clean

**Version:** 1.0
**Date:** 2026-06-08
**Status:** MVP — In Production

---

## 1. Project Overview

A lightweight, GPS-aware crop recommendation system that combines:

- **ML-based crop prediction** from soil nutrient parameters (N, P, K, pH, temperature, humidity, rainfall)
- **Satellite NDVI fusion** (Sentinel-2 via Google Earth Engine) to incorporate real-time field health data
- **Soil compatibility scoring** based on crop-specific soil preferences
- **Weather heuristic scoring** for temperature and rainfall suitability

The system is deployed as a FastAPI backend (Render) with a Next.js frontend, designed as an MVP for precision agriculture decision support.

---

## 2. Objectives

| Objective | Status |
|-----------|--------|
| Deploy a production-grade crop recommendation API | ✅ Done |
| Integrate real-time satellite NDVI data | ✅ Code complete (pending GEE credentials) |
| Build a weighted fusion model (ML + NDVI + Soil + Weather) | ✅ Done |
| Expose predication via REST API | ✅ Done |
| Deploy to Render free tier | ✅ Done |
| Provide Next.js frontend | ✅ Done |

---

## 3. Features Implemented

| Feature | Endpoint | Description |
|---------|----------|-------------|
| Health check | `GET /` | API health endpoint |
| ML Prediction | `POST /predict` | Returns recommended crop + multi-source fused confidence |
| NDVI Endpoint | `GET /ndvi` | Returns real NDVI score, health classification, imagery date |
| NDVI Fusion | Embedded in `/predict` | Adjusts prediction confidence based on satellite data |
| Soil Match | Embedded in `/predict` | Checks crop vs soil type compatibility |
| Weather Score | Embedded in `/predict` | Heuristic temperature + rainfall scoring |
| CORS | Middleware | Allows frontend at localhost:3000 |

---

## 4. Features Remaining

| Feature | Priority | Notes |
|---------|----------|-------|
| GEE Service Account Setup | CRITICAL | Required for `/ndvi` to work in production |
| Frontend NDVI Integration | HIGH | Connect Next.js to `/ndvi` endpoint |
| Unit / Integration Tests | MEDIUM | No test coverage currently |
| CI/CD Pipeline | MEDIUM | Automatic deploy testing |
| Error Monitoring | LOW | Structured logging + alerting |
| Caching NDVI Results | LOW | Redis or in-memory cache to reduce GEE quota usage |
| Batch Prediction | LOW | Multiple lat/lon in one request |

---

## 5. Technical Stack

| Layer | Technology |
|-------|-----------|
| Backend Framework | Python 3.11 / FastAPI 0.136.3 |
| ASGI Server | Uvicorn 0.48.0 |
| ML Framework | scikit-learn 1.8.0 |
| Model Serialization | joblib 1.5.3 |
| Data Processing | Pandas 3.0.3, NumPy 2.4.6 |
| Satellite Data | Google Earth Engine (earthengine-api ≥ 0.1.337) |
| Frontend | Next.js (React / TypeScript) |
| Deployment | Render (Free Tier — Web Service) |
| Version Control | GitHub |

---

## 6. Backend Architecture

```
FastAPI Application (src/api.py)
  │
  ├── GET  /        → 200 { message }
  ├── GET  /ndvi    → 200 { ndvi_score, health_status, imagery_date, source }
  │                    or 501 { detail: "Earth Engine init failed..." }
  │
  └── POST /predict → 200 { recommended_crop, adjusted_confidence, ... }
       Body: { N, P, K, temperature, humidity, ph, rainfall, soil_type, lat?, lon? }
```

**Model:** `NDVIService` class in `ndvi_service.py` handles GEE authentication with a 3-tier fallback:

1. `GOOGLE_APPLICATION_CREDENTIALS` → file path (Render Secret File)
2. `GOOGLE_CREDENTIALS_JSON` → raw JSON string (Render env var)
3. Default `ee.Initialize()` → local development (`earthengine authenticate`)

---

## 7. API Architecture

| Method | Path | Auth | Rate Limit | Cache |
|--------|------|------|------------|-------|
| GET | `/` | None | None | None |
| GET | `/ndvi` | GEE Service Account | GEE quota (implicit) | None |
| POST | `/predict` | None | None | None |

**Error handling:**
- `HTTPException(501)` — GEE not configured (NDVI endpoint)
- `HTTPException(500)` — General processing failure
- `RuntimeError` — NDVI-specific failures (no imagery, compute errors)

---

## 8. ML Pipeline

```
Training (Notebook: eda.ipynb)
  │
  ├── Dataset: Crop_recommendation.csv
  │     Features: N, P, K, temperature, humidity, ph, rainfall
  │     Target: crop (22 classes)
  │
  └── Model: crop_model.pkl (scikit-learn classifier)
        → Serialized with joblib
        → Currently unknown classifier type (not specified in api.py)
        → Supports predict() and predict_proba()

Inference (api.py)
  │
  ├── Load model from models/crop_model.pkl
  ├── predict(input_df)[0] → recommended_crop
  ├── predict_proba(input_df)[0] → max() → base_confidence
  └── Passed to fusion pipeline
```

---

## 9. NDVI Pipeline

```
NDVIService.__init__()
  │
  ├── Check GOOGLE_APPLICATION_CREDENTIALS env var
  ├── Check GOOGLE_CREDENTIALS_JSON env var
  └── Fallback: ee.Initialize()
  │
  ▼
NDVIService.compute_ndvi(lat, lon, buffer=1000m, days=30, cloud=20%)
  │
  ├── Create AOI: ee.Geometry.Point(lon, lat).buffer(1000)
  ├── Query: ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  │     .filterBounds(aoi)
  │     .filterDate(today-30, today)
  │     .filter(CLOUDY_PIXEL_PERCENTAGE < 20%)
  │     .map(NDVI = (B8-B4)/(B8+B4))
  │
  ├── Select: Most recent image (sort by system:time_start)
  ├── Reduce: mean NDVI at 10m scale over AOI
  └── Return: (ndvi_value, acq_date, "Sentinel-2 (COPERNICUS/S2_SR_HARMONIZED)")
```

---

## 10. Deployment Architecture

| Component | Host | URL |
|-----------|------|-----|
| Backend API | Render (Free) | https://crop-recommendation-system2-clean.onrender.com |
| API Docs | Render (Free) | https://crop-recommendation-system2-clean.onrender.com/docs |
| Frontend | Vercel (planned) | TBD |
| Source Code | GitHub | https://github.com/raunak030/crop-recommendation-system2-clean |

**Render Config (render.yaml):**
```yaml
services:
  - type: web
    name: crop-recommendation-backend
    env: python
    plan: free
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn src.api:app --host 0.0.0.0 --port $PORT"
```

**Required Environment Variables:**
- `GOOGLE_APPLICATION_CREDENTIALS` (Secret File) **OR** `GOOGLE_CREDENTIALS_JSON` (raw JSON string)
- `PORT` (auto-set by Render)

---

## 11. Future Roadmap

| Phase | Features | Timeline |
|-------|----------|----------|
| **Phase 1 (Current)** | MVP with ML + NDVI fusion | ✅ Done |
| **Phase 2** | GEE auth fix + test NDVI endpoint | Immediate |
| **Phase 3** | Frontend NDVI integration + API polish | Next |
| **Phase 4** | Unit tests + CI/CD (GitHub Actions) | Next |
| **Phase 5** | Historical NDVI trends + time series | Future |
| **Phase 6** | Batch prediction + district enrichment | Future |
| **Phase 7** | Caching layer + rate limiting | Future |

---

## 12. Production Checklist

### Critical (Must Fix Before Production Confidence)

- [ ] Create Google Cloud service account with Earth Engine access
- [ ] Grant service account access in Earth Engine (earthengine)
- [ ] Upload service account JSON as Render Secret File
- [ ] Set `GOOGLE_APPLICATION_CREDENTIALS` env var in Render dashboard
- [ ] Verify `/ndvi` returns real NDVI value (not 501)
- [ ] Verify `/predict` with lat/lon (NDVI fusion works)

### Important (Should Fix Soon)

- [ ] Add unit tests for NDVI service, prediction API, fusion logic
- [ ] Add CI/CD pipeline (GitHub Actions → test → deploy)
- [ ] Pin exact dependency versions in requirements.txt
- [ ] Add structured logging (structlog / loguru)
- [ ] Add API health check endpoint with GEE status

### Nice to Have

- [ ] Caching NDVI results (reduce GEE API calls)
- [ ] Rate limiting on `/predict` and `/ndvi`
- [ ] Automatic crop_model.pkl update pipeline
- [ ] Frontend improvements: loading states, error boundaries
- [ ] HTTPS enforcement (verify on Render)