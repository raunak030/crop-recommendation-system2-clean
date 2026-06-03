# Crop Recommendation System

This repository contains a lightweight crop recommendation MVP with GPS-based weather autofill and an NDVI field-health estimation hook.

Local Setup
-----------

Backend
1. Create and activate a Python virtualenv in `backend/`.
2. Install requirements:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

3. Run the API:

```bash
uvicorn src.api:app --reload --host 127.0.0.1 --port 8000
```

Frontend
1. Install dependencies and run dev server:

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 npm run dev
```

Features
- FastAPI backend with `/predict` endpoint
- Next.js frontend with GPS -> Open-Meteo autofill
- Reverse geocoding (Nominatim) and auto soil-type mapping
- NDVI estimation endpoint (`/ndvi`) — integrates with Google Earth Engine (GEE) when configured. The backend exposes an adapter at `backend/src/ndvi_service.py` that uses the Earth Engine Python API to query Sentinel-2 `COPERNICUS/S2_SR`, compute NDVI = (B8 - B4)/(B8 + B4) and reduce the mean NDVI over a small AOI.
- NDVI estimation endpoint (`/ndvi`) — integrates with Google Earth Engine (GEE) when configured. The backend exposes an adapter at `backend/src/ndvi_service.py` that uses the Earth Engine Python API to query Sentinel-2 `COPERNICUS/S2_SR_HARMONIZED`, compute NDVI = (B8 - B4)/(B8 + B4) and reduce the mean NDVI over a small AOI.

Google Earth Engine Setup (required for real NDVI)
1. Install the Earth Engine Python package in your backend environment:

```bash
pip install earthengine-api
```

2a. Quick personal auth (developer/local):

```bash
earthengine authenticate
```

This will open a browser and guide you through OAuth.

2b. Service account (recommended for deployments / Render):
 - Create a Google Cloud project and enable the Earth Engine API.
 - Create a service account and grant it access to the project.
 - Add the service account to Earth Engine following the instructions in the Earth Engine docs (granting the account access to Earth Engine).
 - Download the service account JSON key and set the environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

3. Verify initialization from Python:

```python
import ee
ee.Initialize()
print('EE initialized')
```

If initialization succeeds, the `/ndvi` endpoint will compute real NDVI values from Sentinel-2 imagery. If Earth Engine is not configured the backend will return a clear error (HTTP 501) explaining the missing authentication steps.

Render / Deployment notes for service accounts
- For Render, upload the service account JSON as a secret file or store its contents in a secret env var. In Render, set `GOOGLE_APPLICATION_CREDENTIALS` to the path where you write the secret file during build/start, or set `EE_PRIVATE_KEY_JSON` (custom approach) and write it to disk in a start script before `uvicorn` runs. Ensure the service account has been granted Earth Engine access.

Deployment
- Backend: Ready for Render. See `backend/render.yaml` and `backend/Procfile`.
- Frontend: Deploy to Vercel. Set `NEXT_PUBLIC_API_URL` to the backend URL in environment settings.

Next Steps
- (Optional) Replace or extend the Earth Engine adapter with raw Sentinel-2 processing against public archives (AWS/Copernicus) if you prefer not to use Earth Engine. See `backend/src/ndvi_service.py` for the adapter pattern.
- Add district/state enrichment via reverse geocoding components for localized recommendations.
