#!/usr/bin/env python3
"""Small helper to verify Google Earth Engine availability.

Run inside your `backend` virtualenv after installing `earthengine-api`.
Examples:

    source venv/bin/activate
    pip install earthengine-api
    python src/gee_check.py

If not authenticated, run `earthengine authenticate` (interactive OAuth) or
set up a service account and `GOOGLE_APPLICATION_CREDENTIALS` before running.
"""
import sys

try:
    import ee
except Exception as e:
    print("ERROR: earthengine-api not installed:", e)
    sys.exit(2)

try:
    ee.Initialize()
    print("Earth Engine initialized successfully.")
    # quick permission check: try listing a small known collection's metadata
    try:
        col = ee.ImageCollection('COPERNICUS/S2_SR').limit(1)
        info = col.getInfo()
        print("Catalog access OK. Example image metadata fetched.")
    except Exception as inner:
        print("Initialization OK but failed to fetch collection metadata:", inner)
        print("This may indicate account/catalog access limits.")
        # still exit success since Initialize worked
    sys.exit(0)
except Exception as e:
    print("ERROR: Earth Engine initialization failed:", e)
    print("Run `earthengine authenticate` or set GOOGLE_APPLICATION_CREDENTIALS for a service account as documented in README.")
    sys.exit(3)
