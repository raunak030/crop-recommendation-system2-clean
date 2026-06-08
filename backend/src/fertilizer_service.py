"""
Fertilizer recommendation service.

Provides rule-based fertilizer recommendations by comparing
input NPK values to optimal NPK requirements for each crop.
"""

# Optimal NPK requirements (N-P-K in kg/ha) for each crop
# Sources: ICAR/FAO standard recommendations, agricultural extension guidelines
CROP_NPK_REQUIREMENTS: dict[str, dict[str, float]] = {
    "rice": {"N": 120, "P": 60, "K": 40},
    "wheat": {"N": 120, "P": 50, "K": 40},
    "maize": {"N": 80, "P": 40, "K": 20},
    "sugarcane": {"N": 150, "P": 60, "K": 40},
    "cotton": {"N": 100, "P": 50, "K": 50},
    "coconut": {"N": 50, "P": 20, "K": 80},
    "banana": {"N": 200, "P": 60, "K": 300},
    "apple": {"N": 100, "P": 50, "K": 100},
    "grapes": {"N": 80, "P": 40, "K": 80},
    "mango": {"N": 100, "P": 50, "K": 100},
    "orange": {"N": 120, "P": 50, "K": 100},
    "papaya": {"N": 150, "P": 50, "K": 150},
    "pomegranate": {"N": 100, "P": 50, "K": 100},
    "muskmelon": {"N": 80, "P": 40, "K": 60},
    "watermelon": {"N": 80, "P": 40, "K": 60},
    "coffee": {"N": 120, "P": 40, "K": 120},
    "jute": {"N": 60, "P": 30, "K": 30},
    "kidneybeans": {"N": 40, "P": 60, "K": 40},
    "chickpea": {"N": 20, "P": 40, "K": 20},
    "lentil": {"N": 20, "P": 40, "K": 20},
    "blackgram": {"N": 25, "P": 50, "K": 25},
    "mungbean": {"N": 20, "P": 40, "K": 20},
    "mothbeans": {"N": 20, "P": 40, "K": 20},
    "pigeonpeas": {"N": 25, "P": 50, "K": 25},
}

# Common fertilizers with their NPK composition (N-P-K percentages)
FERTILIZERS: list[dict] = [
    {"name": "Urea", "N": 46, "P": 0, "K": 0, "use": "Nitrogen deficiency"},
    {"name": "DAP (Di-Ammonium Phosphate)", "N": 18, "P": 46, "K": 0, "use": "Phosphorus + Nitrogen deficiency"},
    {"name": "MOP (Muriate of Potash)", "N": 0, "P": 0, "K": 60, "use": "Potassium deficiency"},
    {"name": "SSP (Single Super Phosphate)", "N": 0, "P": 20, "K": 0, "use": "Phosphorus deficiency"},
    {"name": "NPK 10-26-26", "N": 10, "P": 26, "K": 26, "use": "Balanced NPK with high P-K"},
    {"name": "NPK 12-32-16", "N": 12, "P": 32, "K": 16, "use": "High phosphorus blend"},
    {"name": "NPK 20-20-20", "N": 20, "P": 20, "K": 20, "use": "Balanced all-purpose"},
    {"name": "Ammonium Sulphate", "N": 21, "P": 0, "K": 0, "use": "Nitrogen + Sulphur"},
    {"name": "Potassium Sulphate", "N": 0, "P": 0, "K": 50, "use": "Potassium (chloride-sensitive crops)"},
]


def recommend_fertilizer(crop: str, N: float, P: float, K: float) -> dict:
    """Compare input NPK to optimal, recommend fertilizer that fills the gap.

    Args:
        crop: Crop name (case-insensitive)
        N: Current nitrogen level (kg/ha)
        P: Current phosphorus level (kg/ha)
        K: Current potassium level (kg/ha)

    Returns:
        dict with keys:
            - fertilizer: recommended fertilizer name
            - reason: human-readable explanation
            - npk_deficit: dict of {N: deficit, P: deficit, K: deficit}
            - crop_optimal: dict of optimal NPK values for this crop
    """
    crop_lower = crop.strip().lower()

    # Check if crop is known
    if crop_lower not in CROP_NPK_REQUIREMENTS:
        return {
            "fertilizer": "Unknown — crop not found",
            "reason": f"NPK requirements for '{crop}' are not in our database",
            "npk_deficit": {"N": 0, "P": 0, "K": 0},
            "crop_optimal": {},
        }

    optimal = CROP_NPK_REQUIREMENTS[crop_lower]

    # Calculate deficit (positive deficit = need more)
    deficit_N = max(0.0, optimal["N"] - N)
    deficit_P = max(0.0, optimal["P"] - P)
    deficit_K = max(0.0, optimal["K"] - K)

    deficits = {"N": round(deficit_N, 1), "P": round(deficit_P, 1), "K": round(deficit_K, 1)}

    # Determine which nutrient is most deficient
    if deficit_N <= 0 and deficit_P <= 0 and deficit_K <= 0:
        return {
            "fertilizer": "No fertilizer needed",
            "reason": "Soil NPK levels meet or exceed crop requirements",
            "npk_deficit": deficits,
            "crop_optimal": optimal,
        }

    # Score each fertilizer based on how well it fills the deficit
    best_fertilizer = None
    best_score = float("-inf")
    reasons = []

    for fert in FERTILIZERS:
        # How much of each nutrient this fertilizer provides per 100 kg
        # Higher score = better match for the deficit pattern
        score = 0.0
        deficit_notes = []

        if deficit_N > 0 and fert["N"] > 0:
            contribution = fert["N"] * deficit_N
            score += contribution
            deficit_notes.append("low N")

        if deficit_P > 0 and fert["P"] > 0:
            contribution = fert["P"] * deficit_P
            score += contribution
            deficit_notes.append("low P")

        if deficit_K > 0 and fert["K"] > 0:
            contribution = fert["K"] * deficit_K
            score += contribution
            deficit_notes.append("low K")

        # Prefer fertilizers that address the most limiting nutrient
        if deficit_N > 0 and deficit_P == 0 and deficit_K == 0:
            # Pure N deficit — favor high-N fertilizers
            if fert["N"] > 0 and fert["P"] == 0 and fert["K"] == 0:
                score *= 1.2  # Bonus for targeted fertilizer
        elif deficit_P > 0 and deficit_N == 0 and deficit_K == 0:
            if fert["P"] > 0 and fert["N"] == 0 and fert["K"] == 0:
                score *= 1.2
        elif deficit_K > 0 and deficit_N == 0 and deficit_P == 0:
            if fert["K"] > 0 and fert["N"] == 0 and fert["P"] == 0:
                score *= 1.2

        if score > best_score:
            best_score = score
            best_fertilizer = fert
            reasons = deficit_notes

    if best_fertilizer is None:
        return {
            "fertilizer": "No suitable fertilizer found",
            "reason": "Cannot match deficits to known fertilizers",
            "npk_deficit": deficits,
            "crop_optimal": optimal,
        }

    # Build human-readable reason
    deficit_parts = []
    if deficit_N > 0:
        deficit_parts.append(f"N is {deficit_N:.0f} kg/ha below optimal")
    if deficit_P > 0:
        deficit_parts.append(f"P is {deficit_P:.0f} kg/ha below optimal")
    if deficit_K > 0:
        deficit_parts.append(f"K is {deficit_K:.0f} kg/ha below optimal")

    reason_parts = [f"{'/'.join(reasons)}"]
    reason_parts.append(" — " + "; ".join(deficit_parts))

    return {
        "fertilizer": best_fertilizer["name"],
        "reason": "".join(reason_parts),
        "npk_deficit": deficits,
        "crop_optimal": optimal,
    }