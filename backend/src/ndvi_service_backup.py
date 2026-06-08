"""
NDVI service adapter using Google Earth Engine (GEE).

This module attempts to use the Earth Engine Python API to fetch
Sentinel-2 imagery, compute NDVI over a small AOI, and return a
region-mean NDVI and acquisition date.

Authentication:
- For service-account usage set `GOOGLE_APPLICATION_CREDENTIALS` to a
  service account JSON and grant the account access to Earth Engine
  (see README). Alternatively run `earthengine authenticate` locally.

This adapter deliberately does NOT fallback to simulated values. If
GEE is not available or not authenticated, it raises a RuntimeError
with explicit instructions so the caller (API) can inform the user.
"""
from typing import Tuple

try:
    import ee
except Exception as e:
    ee = None  # type: ignore

import datetime


class NDVIService:
    def __init__(self):
        if ee is None:
            raise RuntimeError("Google Earth Engine Python package not installed. Install with `pip install earthengine-api` and follow authentication steps in README.")

        try:
            # If already initialized this is a no-op, otherwise try to initialize.
            ee.Initialize()
        except Exception as exc:
            # Initialization failed; surface a helpful message.
            raise RuntimeError(
                "Earth Engine initialization failed. Ensure you have authenticated (earthengine authenticate) or set up a service account and GOOGLE_APPLICATION_CREDENTIALS as described in README. Original error: %s" % str(exc)
            )

    def compute_ndvi(self, lat: float, lon: float, buffer_m: int = 1000, days: int = 30, cloud_pct: int = 20) -> Tuple[float, str, str]:
        """Compute mean NDVI over a small AOI.

        Returns (ndvi_mean, acquisition_date_iso, source_string).
        Raises RuntimeError on any Earth Engine issues.
        """
        # Create AOI buffer (note: ee.Geometry expects lon,lat ordering)
        point = ee.Geometry.Point(lon, lat)
        aoi = point.buffer(buffer_m)

        end_date = datetime.date.today()
        start_date = end_date - datetime.timedelta(days=days)

        collection = (
            ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
            .filterBounds(aoi)
            .filterDate(start_date.isoformat(), end_date.isoformat())
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', cloud_pct))
        )

        # Map expression to compute NDVI for each image
        def _ndvi(img):
            nd = img.normalizedDifference(['B8', 'B4']).rename('NDVI')
            return img.addBands(nd)

        # Use map with client-side function via ee.Function
        ndvi_collection = collection.map(_ndvi)

        # Prefer most recent image; if none, raise
        first = ndvi_collection.sort('system:time_start', False).first()
        if first is None:
            raise RuntimeError('No Sentinel-2 images found for the AOI and date range with requested cloud filter.')

        # Reduce region mean NDVI at 10m scale
        reducer = ee.Reducer.mean()
        try:
            mean_dict = first.reduceRegion(reducer, aoi, scale=10, bestEffort=True)
            ndvi_mean = mean_dict.get('NDVI')
            ndvi_value = float(ndvi_mean.getInfo())
        except Exception as e:
            raise RuntimeError(f'Failed to reduce region: {e}')

        # Get acquisition date from image properties
        try:
            ts = int(first.get('system:time_start').getInfo())
            acq_date = datetime.datetime.utcfromtimestamp(ts / 1000.0).isoformat() + 'Z'
        except Exception:
            acq_date = datetime.date.today().isoformat()

        return ndvi_value, acq_date, 'Sentinel-2 (COPERNICUS/S2_SR_HARMONIZED)'


def get_ndvi_for(lat: float, lon: float) -> Tuple[float, str, str]:
    svc = NDVIService()
    return svc.compute_ndvi(lat, lon)
