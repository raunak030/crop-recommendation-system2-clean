"""
Smart Crop Engine v1.5 — Rule Engine

Pure, deterministic scoring functions that evaluate crop suitability
based on soil parameters, weather conditions, and ML model outputs.

All functions are stateless — no external API calls, no side effects.
"""

import math

# ---------------------------------------------------------------------------
# CROP REQUIREMENTS — min / max / mean for all 7 parameters
# Derived from training data (2200 rows, 22 crops × 100 samples each).
# ---------------------------------------------------------------------------

CROP_REQUIREMENTS: dict[str, dict[str, dict[str, float]]] = {
    "apple": {
        "N": {"min": 0, "max": 40, "mean": 20.0},
        "P": {"min": 120, "max": 145, "mean": 132.5},
        "K": {"min": 195, "max": 205, "mean": 200.0},
        "temperature": {"min": 21.04, "max": 24.0, "mean": 22.52},
        "humidity": {"min": 90.03, "max": 94.92, "mean": 92.475},
        "ph": {"min": 5.51, "max": 6.5, "mean": 6.005},
        "rainfall": {"min": 100.12, "max": 124.98, "mean": 112.55},
    },
    "banana": {
        "N": {"min": 80, "max": 120, "mean": 100.0},
        "P": {"min": 70, "max": 95, "mean": 82.5},
        "K": {"min": 45, "max": 55, "mean": 50.0},
        "temperature": {"min": 25.01, "max": 29.91, "mean": 27.46},
        "humidity": {"min": 75.03, "max": 84.98, "mean": 80.005},
        "ph": {"min": 5.51, "max": 6.49, "mean": 6.0},
        "rainfall": {"min": 90.11, "max": 119.85, "mean": 104.98},
    },
    "blackgram": {
        "N": {"min": 20, "max": 60, "mean": 40.0},
        "P": {"min": 55, "max": 80, "mean": 67.5},
        "K": {"min": 15, "max": 25, "mean": 20.0},
        "temperature": {"min": 25.1, "max": 34.95, "mean": 30.025},
        "humidity": {"min": 60.07, "max": 69.96, "mean": 65.015},
        "ph": {"min": 6.5, "max": 7.78, "mean": 7.14},
        "rainfall": {"min": 60.42, "max": 74.92, "mean": 67.67},
    },
    "chickpea": {
        "N": {"min": 20, "max": 60, "mean": 40.0},
        "P": {"min": 55, "max": 80, "mean": 67.5},
        "K": {"min": 75, "max": 85, "mean": 80.0},
        "temperature": {"min": 17.02, "max": 21.0, "mean": 19.01},
        "humidity": {"min": 14.26, "max": 19.97, "mean": 17.115},
        "ph": {"min": 5.99, "max": 8.87, "mean": 7.43},
        "rainfall": {"min": 65.11, "max": 94.78, "mean": 79.945},
    },
    "coconut": {
        "N": {"min": 0, "max": 40, "mean": 20.0},
        "P": {"min": 5, "max": 30, "mean": 17.5},
        "K": {"min": 25, "max": 35, "mean": 30.0},
        "temperature": {"min": 25.01, "max": 29.87, "mean": 27.44},
        "humidity": {"min": 90.02, "max": 99.98, "mean": 95.0},
        "ph": {"min": 5.5, "max": 6.47, "mean": 5.985},
        "rainfall": {"min": 131.09, "max": 225.63, "mean": 178.36},
    },
    "coffee": {
        "N": {"min": 80, "max": 120, "mean": 100.0},
        "P": {"min": 15, "max": 40, "mean": 27.5},
        "K": {"min": 25, "max": 35, "mean": 30.0},
        "temperature": {"min": 23.06, "max": 27.92, "mean": 25.49},
        "humidity": {"min": 50.05, "max": 69.95, "mean": 60.0},
        "ph": {"min": 6.02, "max": 7.49, "mean": 6.755},
        "rainfall": {"min": 115.16, "max": 199.47, "mean": 157.315},
    },
    "cotton": {
        "N": {"min": 100, "max": 140, "mean": 120.0},
        "P": {"min": 35, "max": 60, "mean": 47.5},
        "K": {"min": 15, "max": 25, "mean": 20.0},
        "temperature": {"min": 22.0, "max": 25.99, "mean": 23.995},
        "humidity": {"min": 75.01, "max": 84.88, "mean": 79.945},
        "ph": {"min": 5.8, "max": 7.99, "mean": 6.895},
        "rainfall": {"min": 60.65, "max": 99.93, "mean": 80.29},
    },
    "grapes": {
        "N": {"min": 0, "max": 40, "mean": 20.0},
        "P": {"min": 120, "max": 145, "mean": 132.5},
        "K": {"min": 195, "max": 205, "mean": 200.0},
        "temperature": {"min": 8.83, "max": 41.95, "mean": 25.39},
        "humidity": {"min": 80.02, "max": 83.98, "mean": 82.0},
        "ph": {"min": 5.51, "max": 6.5, "mean": 6.005},
        "rainfall": {"min": 65.01, "max": 74.92, "mean": 69.965},
    },
    "jute": {
        "N": {"min": 60, "max": 100, "mean": 80.0},
        "P": {"min": 35, "max": 60, "mean": 47.5},
        "K": {"min": 35, "max": 45, "mean": 40.0},
        "temperature": {"min": 23.09, "max": 26.99, "mean": 25.04},
        "humidity": {"min": 70.88, "max": 89.89, "mean": 80.385},
        "ph": {"min": 6.0, "max": 7.49, "mean": 6.745},
        "rainfall": {"min": 150.24, "max": 199.84, "mean": 175.04},
    },
    "kidneybeans": {
        "N": {"min": 0, "max": 40, "mean": 20.0},
        "P": {"min": 55, "max": 80, "mean": 67.5},
        "K": {"min": 15, "max": 25, "mean": 20.0},
        "temperature": {"min": 15.33, "max": 24.92, "mean": 20.125},
        "humidity": {"min": 18.09, "max": 24.97, "mean": 21.53},
        "ph": {"min": 5.5, "max": 6.0, "mean": 5.75},
        "rainfall": {"min": 60.28, "max": 149.74, "mean": 105.01},
    },
    "lentil": {
        "N": {"min": 0, "max": 40, "mean": 20.0},
        "P": {"min": 55, "max": 80, "mean": 67.5},
        "K": {"min": 15, "max": 25, "mean": 20.0},
        "temperature": {"min": 18.06, "max": 29.94, "mean": 24.0},
        "humidity": {"min": 60.09, "max": 69.92, "mean": 65.005},
        "ph": {"min": 5.92, "max": 7.84, "mean": 6.88},
        "rainfall": {"min": 35.03, "max": 54.94, "mean": 44.985},
    },
    "maize": {
        "N": {"min": 60, "max": 100, "mean": 80.0},
        "P": {"min": 35, "max": 60, "mean": 47.5},
        "K": {"min": 15, "max": 25, "mean": 20.0},
        "temperature": {"min": 18.04, "max": 26.55, "mean": 22.295},
        "humidity": {"min": 55.28, "max": 74.83, "mean": 65.055},
        "ph": {"min": 5.51, "max": 7.0, "mean": 6.255},
        "rainfall": {"min": 60.65, "max": 109.75, "mean": 85.2},
    },
    "mango": {
        "N": {"min": 0, "max": 40, "mean": 20.0},
        "P": {"min": 15, "max": 40, "mean": 27.5},
        "K": {"min": 25, "max": 35, "mean": 30.0},
        "temperature": {"min": 27.0, "max": 35.99, "mean": 31.495},
        "humidity": {"min": 45.02, "max": 54.96, "mean": 49.99},
        "ph": {"min": 4.51, "max": 6.97, "mean": 5.74},
        "rainfall": {"min": 89.29, "max": 100.81, "mean": 95.05},
    },
    "mothbeans": {
        "N": {"min": 0, "max": 40, "mean": 20.0},
        "P": {"min": 35, "max": 60, "mean": 47.5},
        "K": {"min": 15, "max": 25, "mean": 20.0},
        "temperature": {"min": 24.02, "max": 32.0, "mean": 28.01},
        "humidity": {"min": 40.01, "max": 64.96, "mean": 52.485},
        "ph": {"min": 3.5, "max": 9.94, "mean": 6.72},
        "rainfall": {"min": 30.92, "max": 74.44, "mean": 52.68},
    },
    "mungbean": {
        "N": {"min": 0, "max": 40, "mean": 20.0},
        "P": {"min": 35, "max": 60, "mean": 47.5},
        "K": {"min": 15, "max": 25, "mean": 20.0},
        "temperature": {"min": 27.01, "max": 29.91, "mean": 28.46},
        "humidity": {"min": 80.03, "max": 90.0, "mean": 85.015},
        "ph": {"min": 6.22, "max": 7.2, "mean": 6.71},
        "rainfall": {"min": 36.12, "max": 59.87, "mean": 47.995},
    },
    "muskmelon": {
        "N": {"min": 80, "max": 120, "mean": 100.0},
        "P": {"min": 5, "max": 30, "mean": 17.5},
        "K": {"min": 45, "max": 55, "mean": 50.0},
        "temperature": {"min": 27.02, "max": 29.94, "mean": 28.48},
        "humidity": {"min": 90.02, "max": 94.96, "mean": 92.49},
        "ph": {"min": 6.0, "max": 6.78, "mean": 6.39},
        "rainfall": {"min": 20.21, "max": 29.87, "mean": 25.04},
    },
    "orange": {
        "N": {"min": 0, "max": 40, "mean": 20.0},
        "P": {"min": 5, "max": 30, "mean": 17.5},
        "K": {"min": 5, "max": 15, "mean": 10.0},
        "temperature": {"min": 10.01, "max": 34.91, "mean": 22.46},
        "humidity": {"min": 90.01, "max": 94.96, "mean": 92.485},
        "ph": {"min": 6.01, "max": 8.0, "mean": 7.005},
        "rainfall": {"min": 100.17, "max": 119.69, "mean": 109.93},
    },
    "papaya": {
        "N": {"min": 31, "max": 70, "mean": 50.5},
        "P": {"min": 46, "max": 70, "mean": 58.0},
        "K": {"min": 45, "max": 55, "mean": 50.0},
        "temperature": {"min": 23.01, "max": 43.68, "mean": 33.345},
        "humidity": {"min": 90.04, "max": 94.94, "mean": 92.49},
        "ph": {"min": 6.5, "max": 6.99, "mean": 6.745},
        "rainfall": {"min": 40.35, "max": 248.86, "mean": 144.605},
    },
    "pigeonpeas": {
        "N": {"min": 0, "max": 40, "mean": 20.0},
        "P": {"min": 55, "max": 80, "mean": 67.5},
        "K": {"min": 15, "max": 25, "mean": 20.0},
        "temperature": {"min": 18.32, "max": 36.98, "mean": 27.65},
        "humidity": {"min": 30.4, "max": 69.69, "mean": 50.045},
        "ph": {"min": 4.55, "max": 7.45, "mean": 6.0},
        "rainfall": {"min": 90.05, "max": 198.83, "mean": 144.44},
    },
    "pomegranate": {
        "N": {"min": 0, "max": 40, "mean": 20.0},
        "P": {"min": 5, "max": 30, "mean": 17.5},
        "K": {"min": 35, "max": 45, "mean": 40.0},
        "temperature": {"min": 18.07, "max": 24.96, "mean": 21.515},
        "humidity": {"min": 85.13, "max": 95.0, "mean": 90.065},
        "ph": {"min": 5.56, "max": 7.2, "mean": 6.38},
        "rainfall": {"min": 102.52, "max": 112.48, "mean": 107.5},
    },
    "rice": {
        "N": {"min": 60, "max": 99, "mean": 79.5},
        "P": {"min": 35, "max": 60, "mean": 47.5},
        "K": {"min": 35, "max": 45, "mean": 40.0},
        "temperature": {"min": 20.05, "max": 26.93, "mean": 23.49},
        "humidity": {"min": 80.12, "max": 84.97, "mean": 82.545},
        "ph": {"min": 5.01, "max": 7.87, "mean": 6.44},
        "rainfall": {"min": 182.56, "max": 298.56, "mean": 240.56},
    },
    "watermelon": {
        "N": {"min": 80, "max": 120, "mean": 100.0},
        "P": {"min": 5, "max": 30, "mean": 17.5},
        "K": {"min": 45, "max": 55, "mean": 50.0},
        "temperature": {"min": 24.04, "max": 26.99, "mean": 25.515},
        "humidity": {"min": 80.03, "max": 89.98, "mean": 85.005},
        "ph": {"min": 6.0, "max": 6.96, "mean": 6.48},
        "rainfall": {"min": 40.13, "max": 59.76, "mean": 49.945},
    },
}

# ---------------------------------------------------------------------------
# SOIL COMPATIBILITY MAP
# crop → list of compatible soil types
# ---------------------------------------------------------------------------

SOIL_COMPATIBILITY: dict[str, list[str]] = {
    "rice": ["Alluvial", "Clay"],
    "chickpea": ["Loamy", "Black"],
    "maize": ["Loamy", "Alluvial"],
    "cotton": ["Black", "Loamy"],
    "jute": ["Alluvial", "Loamy"],
}

# ---------------------------------------------------------------------------
# COFFEE PENALTY CONFIG
# ---------------------------------------------------------------------------

COFFEE_OPTIMAL = {
    "rainfall": {"low": 115.16, "high": 199.47, "center": 157.315},
    "humidity": {"low": 50.05, "high": 69.95, "center": 60.0},
    "ph": {"low": 6.02, "high": 7.49, "center": 6.755},
}


# =========================================================================
# F ITNESS SCORE FUNCTIONS
# =========================================================================


def temperature_fitness(crop_req: dict, input_temp: float) -> float:
    """Score 0-100 for temperature fit.

    Inside training range → 100.
    Outside but within 5°C buffer → linear decay 100→0.
    Beyond buffer → 0.
    """
    low = crop_req["temperature"]["min"]
    high = crop_req["temperature"]["max"]
    if low <= input_temp <= high:
        return 100.0
    buffer = 5.0
    if input_temp < low:
        gap = low - input_temp
    else:
        gap = input_temp - high
    if gap >= buffer:
        return 0.0
    decay = (gap / buffer) * 100.0
    return round(100.0 - decay, 1)


def rainfall_fitness(crop_req: dict, input_rain: float) -> float:
    """Score 0-100 for rainfall fit.

    Inside training range → 100.
    Outside → linear penalty based on distance from range edge.
    """
    low = crop_req["rainfall"]["min"]
    high = crop_req["rainfall"]["max"]
    if low <= input_rain <= high:
        return 100.0
    tolerance = 100.0  # mm outside range before score hits 0
    if input_rain < low:
        gap = low - input_rain
    else:
        gap = input_rain - high
    if gap >= tolerance:
        return 0.0
    decay = (gap / tolerance) * 100.0
    return round(100.0 - decay, 1)


def ph_fitness(crop_req: dict, input_ph: float) -> float:
    """Score 0-100 for pH fit.

    Inside training range → 100.
    Outside → penalty based on distance from range edge.
    """
    low = crop_req["ph"]["min"]
    high = crop_req["ph"]["max"]
    if low <= input_ph <= high:
        return 100.0
    tolerance = 3.0  # pH units outside range before score hits 0
    if input_ph < low:
        gap = low - input_ph
    else:
        gap = input_ph - high
    if gap >= tolerance:
        return 0.0
    decay = (gap / tolerance) * 100.0
    return round(100.0 - decay, 1)


def humidity_fitness(crop_req: dict, input_humidity: float) -> float:
    """Score 0-100 for humidity fit.

    Inside training range → 100.
    Outside → penalty based on distance from range edge.
    """
    low = crop_req["humidity"]["min"]
    high = crop_req["humidity"]["max"]
    if low <= input_humidity <= high:
        return 100.0
    tolerance = 30.0  # percentage points outside before 0
    if input_humidity < low:
        gap = low - input_humidity
    else:
        gap = input_humidity - high
    if gap >= tolerance:
        return 0.0
    decay = (gap / tolerance) * 100.0
    return round(100.0 - decay, 1)


def npk_fitness(crop_req: dict, input_n: float, input_p: float, input_k: float) -> float:
    """Score 0-100 for NPK fit.

    How close the input N,P,K values are to the crop's training mean.
    Uses 3-component average. Each component: 100 at mean, linear decay
    to 0 at ±100% deviation from range center.
    """
    def _component_score(input_val: float, crop_mean: float, param_name: str) -> float:
        denom = crop_mean if crop_mean > 0 else 50.0
        ratio = abs(input_val - crop_mean) / denom
        # ratio 0 → 100, ratio 1.0 → 0, linear in between
        return round(max(0.0, 100.0 - ratio * 100.0), 1)

    n_score = _component_score(input_n, crop_req["N"]["mean"], "N")
    p_score = _component_score(input_p, crop_req["P"]["mean"], "P")
    k_score = _component_score(input_k, crop_req["K"]["mean"], "K")
    return round((n_score + p_score + k_score) / 3.0, 1)


# =========================================================================
# COFFEE PENALTY
# =========================================================================


def coffee_penalty(input_rainfall: float, input_humidity: float, input_ph: float) -> float:
    """Calculate penalty points to subtract from coffee's suitability.

    Returns penalty in 0..65 range.
    Rain penalty: 0 (in range) to 30 (far outside)
    Humidity penalty: 0 (in range) to 20 (far outside)
    pH penalty: 0 (in range) to 15 (far outside)
    """
    penalty = 0.0

    # Rainfall penalty
    r_low = COFFEE_OPTIMAL["rainfall"]["low"]
    r_high = COFFEE_OPTIMAL["rainfall"]["high"]
    r_center = COFFEE_OPTIMAL["rainfall"]["center"]
    if input_rainfall < r_low:
        gap = r_low - input_rainfall
        max_gap = r_center - r_low  # ~42mm
        if max_gap <= 0:
            max_gap = 42
        penalty += min(30.0, (gap / max_gap) * 30.0)
    elif input_rainfall > r_high:
        gap = input_rainfall - r_high
        max_gap = r_high - r_center  # ~42mm
        if max_gap <= 0:
            max_gap = 42
        penalty += min(30.0, (gap / max_gap) * 30.0)

    # Humidity penalty
    h_low = COFFEE_OPTIMAL["humidity"]["low"]
    h_high = COFFEE_OPTIMAL["humidity"]["high"]
    h_center = COFFEE_OPTIMAL["humidity"]["center"]
    if input_humidity < h_low:
        gap = h_low - input_humidity
        max_gap = h_center - h_low  # ~10
        if max_gap <= 0:
            max_gap = 10
        penalty += min(20.0, (gap / max_gap) * 20.0)
    elif input_humidity > h_high:
        gap = input_humidity - h_high
        max_gap = h_high - h_center  # ~10
        if max_gap <= 0:
            max_gap = 10
        penalty += min(20.0, (gap / max_gap) * 20.0)

    # pH penalty
    p_low = COFFEE_OPTIMAL["ph"]["low"]
    p_high = COFFEE_OPTIMAL["ph"]["high"]
    p_center = COFFEE_OPTIMAL["ph"]["center"]
    if input_ph < p_low:
        gap = p_low - input_ph
        max_gap = p_center - p_low  # ~0.735
        if max_gap <= 0:
            max_gap = 0.735
        penalty += min(15.0, (gap / max_gap) * 15.0)
    elif input_ph > p_high:
        gap = input_ph - p_high
        max_gap = p_high - p_center  # ~0.735
        if max_gap <= 0:
            max_gap = 0.735
        penalty += min(15.0, (gap / max_gap) * 15.0)

    return round(penalty, 1)


# =========================================================================
# SOIL COMPATIBILITY SCORE
# =========================================================================


def soil_compatibility_score(crop: str, soil_type: str | None) -> float:
    """Score 0-100 for soil compatibility.

    If no soil_type provided → 50.0 (neutral).
    If crop has compatibility known and soil_type matches → 100.0.
    If crop has compatibility known and soil_type does NOT match → 20.0.
    If crop has no compatibility data → 50.0 (unknown).
    """
    if not soil_type:
        return 50.0

    compat = SOIL_COMPATIBILITY.get(crop.lower())
    if compat is None:
        return 50.0

    if soil_type in compat:
        return 100.0
    return 20.0


# =========================================================================
# SUITABILITY SCORE  (weighted composite, 0-100)
# =========================================================================


def suitability_score(
    ml_probability: float,
    soil_type: str | None,
    crop: str,
    input_n: float,
    input_p: float,
    input_k: float,
    input_temp: float,
    input_humidity: float,
    input_ph: float,
    input_rainfall: float,
) -> dict:
    """Compute weighted composite suitability score (0-100) and component scores.

    Weights:
      ML probability:   35%
      Soil compatibility: 20%
      Temperature:       12%
      Rainfall:          10%
      Humidity:           8%
      pH:                 5%
      NPK:               10%

    Returns dict with:
      - total: float 0-100
      - components: dict of individual scores
      - coffee_penalty_applied: float (0 if not coffee)
    """
    crop_lower = crop.lower()

    # Convert ML probability (0-1) to score (0-100)
    ml_score = ml_probability * 100.0

    # Get crop requirements
    req = CROP_REQUIREMENTS.get(crop_lower)
    if req is None:
        return {
            "total": 0.0,
            "components": {
                "ml_probability": 0.0,
                "soil_compatibility": 0.0,
                "temperature": 0.0,
                "rainfall": 0.0,
                "humidity": 0.0,
                "ph": 0.0,
                "npk": 0.0,
            },
            "coffee_penalty_applied": 0.0,
        }

    # Compute individual scores
    soil_score = soil_compatibility_score(crop_lower, soil_type)
    temp_score = temperature_fitness(req, input_temp)
    rain_score = rainfall_fitness(req, input_rainfall)
    hum_score = humidity_fitness(req, input_humidity)
    ph_score = ph_fitness(req, input_ph)
    npk_score = npk_fitness(req, input_n, input_p, input_k)

    # Weighted sum before penalty
    total = (
        ml_score * 0.35
        + soil_score * 0.20
        + temp_score * 0.12
        + rain_score * 0.10
        + hum_score * 0.08
        + ph_score * 0.05
        + npk_score * 0.10
    )

    # Apply coffee penalty if applicable
    coffee_penalty_applied = 0.0
    if crop_lower == "coffee":
        coffee_penalty_applied = coffee_penalty(input_rainfall, input_humidity, input_ph)
        total -= coffee_penalty_applied

    # Cap 0-100
    total = max(0.0, min(100.0, round(total, 2)))

    return {
        "total": total,
        "components": {
            "ml_probability": round(ml_score, 1),
            "soil_compatibility": soil_score,
            "temperature": temp_score,
            "rainfall": rain_score,
            "humidity": hum_score,
            "ph": ph_score,
            "npk": npk_score,
        },
        "coffee_penalty_applied": coffee_penalty_applied,
    }


# =========================================================================
# UNCERTAINTY SCORE  (entropy-based)
# =========================================================================


def uncertainty_score(probabilities: list[float]) -> dict:
    """Compute entropy-based uncertainty score.

    H = -sum(p_i * log(p_i)) for all i=1..22
    Normalized by log(22) to get 0-1 scale.

    Returns:
      - raw: raw entropy value
      - normalized: 0-1 scale
      - label: 'Low' | 'Medium' | 'High'
    """
    n_classes = len(probabilities)
    if n_classes == 0:
        return {"raw": 0.0, "normalized": 0.0, "label": "Low"}

    # Compute entropy
    entropy = 0.0
    for p in probabilities:
        if p > 0:
            entropy -= p * math.log(p)

    max_entropy = math.log(n_classes)  # log(22) ≈ 3.09
    normalized = entropy / max_entropy if max_entropy > 0 else 0.0

    # Classify
    if normalized < 0.4:
        label = "Low"
    elif normalized <= 0.7:
        label = "Medium"
    else:
        label = "High"

    return {
        "raw": round(entropy, 4),
        "normalized": round(normalized, 4),
        "label": label,
    }


# =========================================================================
# EXPLANATION ENGINE
# =========================================================================


def explanation_engine(
    crop: str,
    rank: int,
    ml_probability: float,
    suit_result: dict,
    input_temp: float,
    input_rainfall: float,
    soil_type: str | None,
) -> dict:
    """Generate human-readable explanation for a crop recommendation.

    Args:
        crop: Crop name
        rank: Position in top-5 (1-5)
        ml_probability: Raw model probability (0-1)
        suit_result: Result from suitability_score()
        input_temp: Input temperature
        input_rainfall: Input rainfall
        soil_type: Input soil type or None

    Returns dict with 4 sections:
      - why_recommended: str
      - strengths: list[str]
      - risks: list[str]
      - soil_match: str
    """
    crop_lower = crop.lower()
    req = CROP_REQUIREMENTS.get(crop_lower)
    components = suit_result["components"]
    pct = round(ml_probability * 100, 1)

    # ── why_recommended ──
    temp_range_ok = req and req["temperature"]["min"] <= input_temp <= req["temperature"]["max"]
    temp_desc = "ideal" if temp_range_ok else ("acceptable" if abs(input_temp - (req["temperature"]["mean"] if req else 25)) < 8 else "outside")

    rain_range_ok = req and req["rainfall"]["min"] <= input_rainfall <= req["rainfall"]["max"]
    if rain_range_ok:
        rain_desc = "adequate"
    elif req and input_rainfall < req["rainfall"]["min"]:
        rain_desc = "low"
    else:
        rain_desc = "high"

    why = (
        f"Crop ranks #{rank} because: "
        f"(1) model probability {pct}%, "
        f"(2) temperature {input_temp}°C is {temp_desc} for this crop, "
        f"(3) rainfall {input_rainfall}mm is {rain_desc} for this crop"
    )

    # ── strengths (component scores >= 70) ──
    strengths = []
    if components["ml_probability"] >= 70:
        strengths.append(f"Strong ML prediction ({components['ml_probability']}% probability)")
    if components["soil_compatibility"] >= 70:
        strengths.append(f"Soil compatibility ({components['soil_compatibility']}%) — well-suited to your soil type")
    if components["temperature"] >= 70:
        strengths.append(f"Temperature fit ({components['temperature']}%) — within ideal growing range")
    if components["rainfall"] >= 70:
        strengths.append(f"Rainfall fit ({components['rainfall']}%) — your rainfall matches this crop's needs")
    if components["humidity"] >= 70:
        strengths.append(f"Humidity fit ({components['humidity']}%) — good humidity match")
    if components["ph"] >= 70:
        strengths.append(f"pH fit ({components['ph']}%) — soil pH is well-aligned")
    if components["npk"] >= 70:
        strengths.append(f"NPK balance ({components['npk']}%) — nutrients are close to optimal")

    if not strengths:
        strengths.append("No individual parameter scores reach the 70% threshold")

    # ── risks (component scores < 70) ──
    risks = []
    if components["ml_probability"] < 70 and components["ml_probability"] < 50:
        risks.append(f"Model uncertainty: ML probability is only {components['ml_probability']}%")
    elif components["ml_probability"] < 70:
        risks.append(f"Moderate model confidence ({components['ml_probability']}%)")
    if components["soil_compatibility"] < 70:
        risks.append(f"Soil may not be ideal ({components['soil_compatibility']}% match)")
    if components["temperature"] < 70:
        risks.append(f"Temperature ({input_temp}°C) may be suboptimal ({components['temperature']}% fit)")
    if components["rainfall"] < 70:
        risks.append(f"Rainfall ({input_rainfall}mm) is suboptimal ({components['rainfall']}% fit)")
    if components["humidity"] < 70:
        risks.append(f"Humidity may stress the crop ({components['humidity']}% fit)")
    if components["ph"] < 70:
        risks.append(f"pH level is not ideal ({components['ph']}% fit)")
    if components["npk"] < 70:
        risks.append(f"NPK nutrients are not at optimal levels ({components['npk']}% fit)")
    if suit_result["coffee_penalty_applied"] > 0:
        risks.append(f"Coffee penalty applied: −{suit_result['coffee_penalty_applied']} points for conditions outside coffee's optimal range")
    if not risks and suit_result["total"] < 85:
        risks.append("Overall suitability is decent but not exceptional — consider local expert advice")

    # ── soil_match ──
    if soil_type:
        compat = SOIL_COMPATIBILITY.get(crop_lower)
        if compat is None:
            soil_match_str = f"Soil type {soil_type} has unknown compatibility with {crop.capitalize()}"
        elif soil_type in compat:
            soil_match_str = f"Soil type {soil_type} is strongly compatible with {crop.capitalize()}"
        else:
            soil_match_str = f"Soil type {soil_type} is weakly compatible with {crop.capitalize()}"
    else:
        soil_match_str = "No soil type provided for compatibility assessment"

    return {
        "why_recommended": why,
        "strengths": strengths,
        "risks": risks,
        "soil_match": soil_match_str,
    }


# =========================================================================
# COMPUTE TOP CROPS  (orchestrator)
# =========================================================================


def compute_top_crops(
    probabilities: list[float],
    class_names: list[str],
    soil_type: str | None,
    input_n: float,
    input_p: float,
    input_k: float,
    input_temp: float,
    input_humidity: float,
    input_ph: float,
    input_rainfall: float,
    top_n: int = 5,
) -> list[dict]:
    """Compute enriched top-N crop recommendations.

    Args:
        probabilities: List of 22 class probabilities from predict_proba
        class_names: List of 22 class names matching the probability order
        soil_type: Soil type or None
        input_n, input_p, input_k, input_temp, input_humidity, input_ph, input_rainfall: Input params
        top_n: Number of results to return (default 5)

    Returns:
        List of dicts sorted by model_probability descending, each with:
          - crop_name, model_probability, suitability_score, uncertainty_score, explanation
    """
    # Compute global uncertainty from all probabilities
    uncertainty = uncertainty_score(probabilities)

    # Fix 1 & Fix 2: Compute suitability for ALL crops, apply probability floor, use blended ranking
    scored = []
    for i in range(len(class_names)):
        prob = probabilities[i]
        crop_name = class_names[i]

        # Fix 2: Probability floor — skip crops with <1% model probability
        if prob < 0.01:
            continue

        suit = suitability_score(
            ml_probability=prob,
            soil_type=soil_type,
            crop=crop_name,
            input_n=input_n,
            input_p=input_p,
            input_k=input_k,
            input_temp=input_temp,
            input_humidity=input_humidity,
            input_ph=input_ph,
            input_rainfall=input_rainfall,
        )

        # Fix 1: Blended ranking score — 50% model probability, 50% normalized suitability
        ranking_score = 0.5 * prob + 0.5 * (suit["total"] / 100.0)

        scored.append({
            "crop_name": crop_name,
            "model_probability": prob,
            "ranking_score": ranking_score,
            "suitability_score": suit["total"],
            "suitability_components": suit["components"],
            "coffee_penalty_applied": suit["coffee_penalty_applied"],
            "suit": suit,
        })

    # Guard: if fewer than 1 crop remains after probability filter, keep highest-probability crop
    if len(scored) < 1:
        max_prob = max(probabilities)
        max_idx = probabilities.index(max_prob)
        crop_name = class_names[max_idx]
        suit = suitability_score(
            ml_probability=max_prob,
            soil_type=soil_type,
            crop=crop_name,
            input_n=input_n,
            input_p=input_p,
            input_k=input_k,
            input_temp=input_temp,
            input_humidity=input_humidity,
            input_ph=input_ph,
            input_rainfall=input_rainfall,
        )
        ranking_score = 0.5 * max_prob + 0.5 * (suit["total"] / 100.0)
        scored.append({
            "crop_name": crop_name,
            "model_probability": max_prob,
            "ranking_score": ranking_score,
            "suitability_score": suit["total"],
            "suitability_components": suit["components"],
            "coffee_penalty_applied": suit["coffee_penalty_applied"],
            "suit": suit,
        })

    # Sort by blended ranking score descending (Fix 1)
    scored.sort(key=lambda x: x["ranking_score"], reverse=True)

    # Build results from top_n
    results = []
    for rank, entry in enumerate(scored[:top_n], start=1):
        expl = explanation_engine(
            crop=entry["crop_name"],
            rank=rank,
            ml_probability=entry["model_probability"],
            suit_result=entry["suit"],
            input_temp=input_temp,
            input_rainfall=input_rainfall,
            soil_type=soil_type,
        )

        results.append({
            "crop_name": entry["crop_name"],
            "model_probability": round(entry["model_probability"], 4),
            "ranking_score": round(entry["ranking_score"], 4),
            "suitability_score": entry["suitability_score"],
            "suitability_components": entry["suitability_components"],
            "coffee_penalty_applied": entry["coffee_penalty_applied"],
            "uncertainty_score": {
                "label": uncertainty["label"],
                "raw": uncertainty["raw"],
                "normalized": uncertainty["normalized"],
            },
            "explanation": expl,
        })

    return results