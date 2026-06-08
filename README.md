# 🌾 Crop Recommendation System

[![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**AI-powered crop recommendation system with satellite NDVI analysis.**  
Enter your soil parameters (NPK, pH, temperature, humidity, rainfall) and get an instant crop recommendation — boosted by real-time satellite vegetation health data (NDVI) from Google Earth Engine and weighted fusion scoring.

---

## 📸 Screenshots

> *Screenshots coming soon — deploy the app to see it in action!*

| Feature | Preview |
|---------|---------|
| 🏠 **Home / Prediction Form** | ![Screenshot placeholder] |
| 📊 **Results with Confidence** | ![Screenshot placeholder] |
| 🛰️ **NDVI Health Display** | ![Screenshot placeholder] |
| 🌱 **Fertilizer Recommendation** | ![Screenshot placeholder] |

---

## ✨ Features

- ✅ **ML-powered crop prediction** — Random Forest classifier trained on 2,200 soil samples (22 crops)
- ✅ **Weighted fusion scoring** — ML prediction (65%) + NDVI satellite data (20%) + soil compatibility (10%) + weather conditions (5%)
- ✅ **Satellite NDVI analysis** — Real-time vegetation health from Sentinel-2 via Google Earth Engine
- ✅ **GPS autofill** — Reverse geocoding (Nominatim) + Open-Meteo weather fills in temperature, humidity, and rainfall automatically
- ✅ **GPS autofill** — Reverse geocoding (Nominatim) + Open-Meteo weather fills in temperature, humidity, and rainfall automatically
- ✅ **Soil type mapping** — Dropdown with 7 soil types; automatic compatibility scoring
- ✅ **Confidence bars** — Visual UI shows base model confidence vs. adjusted fusion confidence
- ✅ **Fertilizer recommendations** — Rule-based NPK deficit analysis suggests appropriate fertilizers
- ✅ **API versioning** — Backward-compatible `/predict` and new `/api/v1/*` endpoints
- ✅ **Input validation** — Pydantic field validators ensure realistic ranges for all parameters
- ✅ **Responsive UI** — Built with Next.js 16 + Tailwind CSS v4

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js 16)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Prediction Form → API Call → Results Card           │  │
│  │  GPS → Open-Meteo Weather → Nominatim Reverse Geo    │  │
│  │  NDVI Display • Confidence Bars • Explanations       │  │
│  └─────────────────┬────────────────────────────────────┘  │
│                    │ HTTP (axios)                           │
├────────────────────┼─────────────────────────────────────────┤
│          Backend (FastAPI)       │                          │
│  ┌─────────────────┴────────────────────────────────────┐  │
│  │  /predict  (POST)   → Random Forest → Crop + Score   │  │
│  │  /api/v1/predict                                     │  │
│  │  /ndvi      (GET)   → Earth Engine → NDVI value      │  │
│  │  /api/v1/ndvi                                        │  │
│  │  /api/v1/fertilizer (POST) → NPK deficit → Fertilizer│  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │  Weighted Fusion Engine                      │    │  │
│  │  │  ML (65%) + NDVI (20%) + Soil (10%) + Weather│    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └─────────────────┬────────────────────────────────────┘  │
│                    │                                       │
│  ┌─────────────────┴────────────────────────────────────┐  │
│  │  Google Earth Engine (Sentinel-2 SR)                 │  │
│  │  ↓ NDVI = (B8 − B4) / (B8 + B4)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn src.api:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at `http://127.0.0.1:8000`, with interactive docs at `http://127.0.0.1:8000/docs`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server (with API URL)
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## 📡 API Documentation

### Endpoints

| Method | Endpoint | Description | Request Body / Params |
|--------|----------|-------------|----------------------|
| `GET` | `/` | Health check | — |
| `POST` | `/predict` | Crop recommendation (legacy) | `CropInput` JSON |
| `POST` | `/api/v1/predict` | Crop recommendation (v1) | `CropInput` JSON |
| `GET` | `/ndvi` | NDVI from satellite imagery | `lat`, `lon` query params |
| `GET` | `/api/v1/ndvi` | NDVI from satellite imagery (v1) | `lat`, `lon` query params |
| `POST` | `/api/v1/fertilizer` | Fertilizer recommendation | `FertilizerInput` JSON |

### `/predict` Request Body

```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 20.88,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 203.0,
  "soil_type": "Alluvial",
  "lat": 28.61,
  "lon": 77.23
}
```

### `/predict` Response

```json
{
  "recommended_crop": "rice",
  "base_model_confidence": 98.5,
  "adjusted_confidence": 94.2,
  "ndvi_score": 0.72,
  "ndvi_health": "Healthy",
  "soil_match": "strong",
  "weather_score": 85.0,
  "input_parameters": { ... },
  "explanation": "Base model confidence 98.5%. NDVI 0.72 (Healthy) adjusted by +15%. Soil match: strong. Weather score: 70.0%."
}
```

### `/api/v1/fertilizer` Request Body

```json
{
  "crop": "rice",
  "N": 80,
  "P": 30,
  "K": 20
}
```

### `/api/v1/fertilizer` Response

```json
{
  "fertilizer": "DAP (Di-Ammonium Phosphate)",
  "reason": "low N/P — N is 40 kg/ha below optimal; P is 30 kg/ha below optimal",
  "npk_deficit": { "N": 40.0, "P": 30.0, "K": 20.0 },
  "crop_optimal": { "N": 120, "P": 60, "K": 40 }
}
```

---

## 🛰️ Google Earth Engine Setup (for real NDVI)

The `/ndvi` endpoint requires Google Earth Engine authentication. Two methods:

### Method A: Quick local auth

```bash
pip install earthengine-api
earthengine authenticate
```

### Method B: Service account (for Render/production)

1. Create a [Google Cloud project](https://console.cloud.google.com/)
2. Enable the **Earth Engine API**
3. Create a service account → download JSON key
4. Grant the service account access to Earth Engine in the [EE Admin panel](https://code.earthengine.google.com/)
5. Set environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```

**Without EE configured:** The endpoint returns HTTP 501 with setup instructions.

---

## 🚢 Deployment

### Backend (Render)

```yaml
# backend/render.yaml — already configured
services:
  - type: web
    name: crop-recommendation-api
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn src.api:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: GOOGLE_APPLICATION_CREDENTIALS
        sync: false  # Set as secret file
```

### Frontend (Vercel)

1. Push the `frontend/` directory to a Vercel project
2. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```
3. Deploy — Vercel auto-detects Next.js

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) + React 19 |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Backend API** | [FastAPI](https://fastapi.tiangolo.com/) (Python) |
| **ML Model** | [scikit-learn](https://scikit-learn.org/) RandomForestClassifier |
| **Satellite Data** | [Google Earth Engine](https://earthengine.google.com/) (Sentinel-2 SR) |
| **Weather** | [Open-Meteo API](https://open-meteo.com/) |
| **Reverse Geocoding** | [Nominatim](https://nominatim.org/) (OpenStreetMap) |
| **Input Validation** | [Pydantic v2](https://docs.pydantic.dev/) |
| **Model Serialization** | [joblib](https://joblib.readthedocs.io/) |

---

## 📊 Model Performance

The crop classification model achieves **100% test accuracy** on the synthetic benchmark dataset — see [`docs/MODEL_PERFORMANCE.md`](docs/MODEL_PERFORMANCE.md) for detailed metrics, feature importance analysis, and caveats.

---

## 📁 Project Structure

```
├── backend/
│   ├── data/              # Training dataset (Crop_recommendation.csv)
│   ├── models/            # Trained model (crop_model.pkl)
│   ├── src/
│   │   ├── api.py         # FastAPI application with all endpoints
│   │   ├── fertilizer_service.py  # Rule-based NPK fertilizer logic
│   │   ├── ndvi_service.py        # Google Earth Engine adapter
│   │   └── gee_check.py           # GEE setup verification
│   ├── notebooks/         # EDA notebook
│   ├── requirements.txt
│   ├── render.yaml        # Render deployment config
│   └── Procfile           # Render start command
├── frontend/
│   ├── src/app/           # Next.js app directory
│   │   ├── layout.tsx     # Root layout with metadata
│   │   ├── page.tsx       # Main page with prediction form
│   │   └── globals.css    # Tailwind CSS import
│   ├── package.json
│   └── next.config.ts
├── docs/
│   ├── MODEL_PERFORMANCE.md  # Accuracy report & analysis
│   ├── ARCHITECTURE.md
│   ├── PRD.md
│   └── WORKFLOW_DIAGRAM.md
└── README.md
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Crop Recommendation Dataset](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset) on Kaggle
- Google Earth Engine for satellite imagery access
- Open-Meteo for free weather API
- Nominatim / OpenStreetMap for reverse geocoding
- scikit-learn community for ML tools