"""
Silent Crop Audit — Smart Crop Engine v1.5

For each of the 22 crops, searches parameter space using training data means
and systematic ±20% variations to find conditions where the crop appears in the top-5.

Outputs to docs/SUPPORTED_CROP_VALIDATION.md
"""

import sys
import os
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import joblib
import pandas as pd
import numpy as np
from rule_engine import compute_top_crops, CROP_REQUIREMENTS

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "crop_model.pkl")

# All 22 crops trained in the model
ALL_CROPS = [
    "apple", "banana", "blackgram", "chickpea", "coconut", "coffee", "cotton",
    "grapes", "jute", "kidneybeans", "lentil", "maize", "mango", "mothbeans",
    "mungbean", "muskmelon", "orange", "papaya", "pigeonpeas", "pomegranate", "rice", "watermelon"
]

SILENT_CROPS = ["blackgram", "cotton", "lentil", "mungbean", "pomegranate"]

SOIL_TYPES = ["Alluvial", "Black", "Red", "Laterite", "Clay", "Sandy", "Loamy"]


def load_model():
    return joblib.load(MODEL_PATH)


def get_probas(model, N, P, K, temp, humidity, ph, rainfall):
    df = pd.DataFrame([[N, P, K, temp, humidity, ph, rainfall]],
                      columns=["N", "P", "K", "temperature", "humidity", "ph", "rainfall"])
    return model.predict_proba(df)[0].tolist()


def search_conditions(model, class_names, crop):
    """Search for conditions where crop appears in top-5."""
    req = CROP_REQUIREMENTS.get(crop)
    if not req:
        return None, None, None

    best_rank = None
    best_params = None
    best_score = None

    # Center values
    center_N = req["N"]["mean"]
    center_P = req["P"]["mean"]
    center_K = req["K"]["mean"]
    center_temp = req["temperature"]["mean"]
    center_hum = req["humidity"]["mean"]
    center_ph = req["ph"]["mean"]
    center_rain = req["rainfall"]["mean"]

    # Phase 1: Try center values with all soil types
    for soil in SOIL_TYPES:
        probs = get_probas(model, center_N, center_P, center_K, center_temp, center_hum, center_ph, center_rain)
        top_crops = compute_top_crops(
            probabilities=probs, class_names=class_names,
            soil_type=soil,
            input_n=center_N, input_p=center_P, input_k=center_K,
            input_temp=center_temp, input_humidity=center_hum,
            input_ph=center_ph, input_rainfall=center_rain,
            top_n=5
        )
        for entry in top_crops:
            if entry["crop_name"] == crop:
                rank = top_crops.index(entry) + 1
                if best_rank is None or rank < best_rank:
                    best_rank = rank
                    best_params = {"N": round(center_N, 1), "P": round(center_P, 1), "K": round(center_K, 1),
                                   "temperature": round(center_temp, 1), "humidity": round(center_hum, 1),
                                   "ph": round(center_ph, 1), "rainfall": round(center_rain, 1), "soil_type": soil}
                    best_score = entry["suitability_score"]
                break

    # Phase 2: Vary NPK (±20%) with best soil type
    best_soil = best_params["soil_type"] if best_params else "Loamy"
    variations = [0.8, 0.9, 1.0, 1.1, 1.2]

    for n_var in variations:
        for p_var in variations:
            for k_var in variations:
                nv = round(center_N * n_var, 1)
                pv = round(center_P * p_var, 1)
                kv = round(center_K * k_var, 1)
                probs = get_probas(model, nv, pv, kv, center_temp, center_hum, center_ph, center_rain)
                top_crops = compute_top_crops(
                    probabilities=probs, class_names=class_names,
                    soil_type=best_soil,
                    input_n=nv, input_p=pv, input_k=kv,
                    input_temp=center_temp, input_humidity=center_hum,
                    input_ph=center_ph, input_rainfall=center_rain,
                    top_n=5
                )
                for entry in top_crops:
                    if entry["crop_name"] == crop:
                        rank = top_crops.index(entry) + 1
                        if best_rank is None or rank < best_rank:
                            best_rank = rank
                            best_params = {"N": nv, "P": pv, "K": kv, "temperature": round(center_temp, 1),
                                           "humidity": round(center_hum, 1), "ph": round(center_ph, 1),
                                           "rainfall": round(center_rain, 1), "soil_type": best_soil}
                            best_score = entry["suitability_score"]
                        break

    # Phase 3: Vary temperature and humidity
    n_best = best_params["N"] if best_params else round(center_N, 1)
    p_best = best_params["P"] if best_params else round(center_P, 1)
    k_best = best_params["K"] if best_params else round(center_K, 1)

    for t_var in [0.85, 0.95, 1.0, 1.05, 1.15]:
        for h_var in [0.85, 0.95, 1.0, 1.05, 1.15]:
            tv = round(center_temp * t_var, 1)
            hv = round(center_hum * h_var, 1)
            probs = get_probas(model, n_best, p_best, k_best, tv, hv, center_ph, center_rain)
            top_crops = compute_top_crops(
                probabilities=probs, class_names=class_names,
                soil_type=best_soil,
                input_n=n_best, input_p=p_best, input_k=k_best,
                input_temp=tv, input_humidity=hv,
                input_ph=center_ph, input_rainfall=center_rain,
                top_n=5
            )
            for entry in top_crops:
                if entry["crop_name"] == crop:
                    rank = top_crops.index(entry) + 1
                    if best_rank is None or rank < best_rank:
                        best_rank = rank
                        best_params = {"N": n_best, "P": p_best, "K": k_best, "temperature": tv,
                                       "humidity": hv, "ph": round(center_ph, 1),
                                       "rainfall": round(center_rain, 1), "soil_type": best_soil}
                        best_score = entry["suitability_score"]
                    break

    # Phase 4: Vary pH and rainfall
    for ph_var in [0.85, 0.95, 1.0, 1.05, 1.15]:
        for rain_var in [0.8, 1.0, 1.2]:
            phv = round(center_ph * ph_var, 1)
            rv = round(center_rain * rain_var, 1)
            probs = get_probas(model, n_best, p_best, k_best, center_temp, center_hum, phv, rv)
            top_crops = compute_top_crops(
                probabilities=probs, class_names=class_names,
                soil_type=best_soil,
                input_n=n_best, input_p=p_best, input_k=k_best,
                input_temp=center_temp, input_humidity=center_hum,
                input_ph=phv, input_rainfall=rv,
                top_n=5
            )
            for entry in top_crops:
                if entry["crop_name"] == crop:
                    rank = top_crops.index(entry) + 1
                    if best_rank is None or rank < best_rank:
                        best_rank = rank
                        best_params = {"N": n_best, "P": p_best, "K": k_best, "temperature": round(center_temp, 1),
                                       "humidity": round(center_hum, 1), "ph": phv,
                                       "rainfall": rv, "soil_type": best_soil}
                        best_score = entry["suitability_score"]
                    break

    return best_rank, best_params, best_score


def main():
    print("=" * 70)
    print("SILENT CROP AUDIT — Smart Crop Engine v1.5")
    print("=" * 70)

    print("Loading model...")
    model = load_model()
    class_names = model.classes_.tolist()
    print(f"Model loaded. {len(class_names)} classes.")
    print(f"Model path: {MODEL_PATH}")

    results = {}
    not_found = []

    for crop in ALL_CROPS:
        print(f"\n{'─'*50}")
        print(f"Searching: {crop}")
        best_rank, best_params, best_score = search_conditions(model, class_names, crop)

        results[crop] = {
            "best_rank": best_rank,
            "best_params": best_params,
            "best_score": best_score,
        }

        if best_rank is not None:
            print(f"  Best rank: #{best_rank}  Score: {best_score}/100")
            if best_params:
                p = best_params
                print(f"  Params: N={p['N']}, P={p['P']}, K={p['K']}, "
                      f"temp={p['temperature']}°C, hum={p['humidity']}%, "
                      f"pH={p['ph']}, rain={p['rainfall']}mm, soil={p['soil_type']}")
        else:
            print(f"  NOT FOUND in top-5 under any tested conditions")
            not_found.append(crop)

    # Generate report
    report_path = Path(__file__).parent.parent / "docs" / "SUPPORTED_CROP_VALIDATION.md"
    report_path.parent.mkdir(parents=True, exist_ok=True)

    lines = []
    lines.append("# Supported Crop Validation — Smart Crop Engine v1.5")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"**Model:** RandomForest ({len(class_names)} classes)")
    lines.append(f"**Total crops:** {len(ALL_CROPS)}")
    lines.append(f"**Found in top-5:** {len(ALL_CROPS) - len(not_found)}/{len(ALL_CROPS)}")
    lines.append(f"**Silent (not found):** {len(not_found)}")
    lines.append("")
    lines.append("### Search Method")
    lines.append("")
    lines.append("For each crop, start at its training data mean and systematically vary:")
    lines.append("- All 7 soil types")
    lines.append("- NPK values ±20% (5 levels each)")
    lines.append("- Temperature and humidity ±15%")
    lines.append("- pH ±15% and rainfall ±20%")
    lines.append("")
    lines.append("At each variation, get real model probabilities and call `compute_top_crops()`")
    lines.append("to find if the target crop appears in the top-5.")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Per-crop results
    lines.append("## Per-Crop Results")
    lines.append("")
    lines.append("| Crop | Best Rank | Suitability Score | Conditions |")
    lines.append("|------|-----------|------------------|------------|")

    for crop in ALL_CROPS:
        r = results[crop]
        if r["best_rank"] is not None:
            p = r["best_params"]
            cond = f"N={p['N']} P={p['P']} K={p['K']} T={p['temperature']}°C H={p['humidity']}% pH={p['ph']} R={p['rainfall']}mm S={p['soil_type']}"
            lines.append(f"| {crop.title()} | #{r['best_rank']} | {r['best_score']}/100 | {cond} |")
        else:
            lines.append(f"| {crop.title()} | ❌ Not Found | — | — |")
    lines.append("")

    # Silent crops focus
    lines.append("## Silent Crops Deep Dive")
    lines.append("")
    lines.append("The following 5 crops were flagged in prior stress tests as never #1:")
    lines.append("")

    for crop in SILENT_CROPS:
        r = results.get(crop, {})
        if r.get("best_rank") is not None:
            lines.append(f"### {crop.title()} — Found at rank #{r['best_rank']}")
            lines.append("")
            lines.append(f"- **Suitability:** {r['best_score']}/100")
            if r.get("best_params"):
                p = r["best_params"]
                lines.append(f"- **Best known conditions:** N={p['N']} P={p['P']} K={p['K']}, "
                           f"T={p['temperature']}°C, H={p['humidity']}%, "
                           f"pH={p['ph']}, R={p['rainfall']}mm, soil={p['soil_type']}")
            lines.append("")
        else:
            lines.append(f"### {crop.title()} — ❌ Not found in top-5")
            lines.append("")
            lines.append("This crop never appears in the top-5 under any tested conditions.")
            lines.append("It may be consistently out-competed by crops with higher weighted scores.")
            lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## Interpretation")
    lines.append("")
    if not_found:
        lines.append(f"**{len(not_found)} crops were not reachable in the top-5:**")
        for c in not_found:
            lines.append(f"- {c.title()}")
        lines.append("")
        lines.append("Possible reasons:")
        lines.append("- Training data range is narrow, making model probability consistently low")
        lines.append("- Other crops with overlapping conditions score higher on suitability composite")
        lines.append("- Soil, climate, or NPK fitness scores insufficient to boost these crops into top-5")
    else:
        lines.append("All 22 crops are reachable in the top-5 under suitable conditions.")
    lines.append("")

    report_content = "\n".join(lines)
    report_path.write_text(report_content)
    print(f"\n\nReport written to {report_path}")


if __name__ == "__main__":
    main()