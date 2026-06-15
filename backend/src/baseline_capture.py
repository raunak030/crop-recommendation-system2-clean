"""
Baseline Capture — Smart Crop Engine v1.5 Final Agronomic Hardening

Captures full results from CURRENT compute_top_crops() (pure model_probability sort)
across all 10 regional scenarios. Outputs a JSON file for before/after comparison.
"""

import sys
import os
import json
from pathlib import Path
import joblib
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rule_engine import compute_top_crops, CROP_REQUIREMENTS

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "crop_model.pkl")

SCENARIOS = [
    {
        "name": "1. Punjab — Rice Region",
        "params": {"N": 90, "P": 40, "K": 40, "temperature": 25, "humidity": 75, "ph": 7.0, "rainfall": 200, "soil_type": "Alluvial"}
    },
    {
        "name": "2. Haryana — Wheat Belt",
        "params": {"N": 60, "P": 35, "K": 35, "temperature": 20, "humidity": 55, "ph": 7.5, "rainfall": 80, "soil_type": "Loamy"}
    },
    {
        "name": "3. Uttar Pradesh — Rice/Wheat Belt",
        "params": {"N": 80, "P": 45, "K": 40, "temperature": 24, "humidity": 65, "ph": 7.2, "rainfall": 160, "soil_type": "Alluvial"}
    },
    {
        "name": "4. Maharashtra — Cotton Region",
        "params": {"N": 70, "P": 30, "K": 30, "temperature": 32, "humidity": 50, "ph": 7.5, "rainfall": 90, "soil_type": "Black"}
    },
    {
        "name": "5. Karnataka — Coffee Region",
        "params": {"N": 90, "P": 30, "K": 35, "temperature": 24, "humidity": 65, "ph": 6.5, "rainfall": 150, "soil_type": "Red"}
    },
    {
        "name": "6. Kerala — Plantation Region",
        "params": {"N": 60, "P": 30, "K": 40, "temperature": 28, "humidity": 85, "ph": 5.5, "rainfall": 300, "soil_type": "Laterite"}
    },
    {
        "name": "7. Rajasthan — Dryland Region",
        "params": {"N": 20, "P": 15, "K": 15, "temperature": 38, "humidity": 25, "ph": 8.0, "rainfall": 40, "soil_type": "Sandy"}
    },
    {
        "name": "8. Gujarat — Cash Crop Region",
        "params": {"N": 80, "P": 40, "K": 30, "temperature": 34, "humidity": 40, "ph": 7.8, "rainfall": 100, "soil_type": "Black"}
    },
    {
        "name": "9. Madhya Pradesh — Mixed Farming",
        "params": {"N": 50, "P": 30, "K": 30, "temperature": 28, "humidity": 55, "ph": 7.0, "rainfall": 120, "soil_type": "Loamy"}
    },
    {
        "name": "10. Tamil Nadu — Irrigated Region",
        "params": {"N": 80, "P": 35, "K": 40, "temperature": 30, "humidity": 70, "ph": 6.8, "rainfall": 180, "soil_type": "Clay"}
    },
]


def get_probas(model, N, P, K, temp, humidity, ph, rainfall):
    input_df = pd.DataFrame([[N, P, K, temp, humidity, ph, rainfall]],
                            columns=["N", "P", "K", "temperature", "humidity", "ph", "rainfall"])
    probas = model.predict_proba(input_df)[0]
    return probas.tolist()


def main():
    print("Loading model...")
    model = joblib.load(MODEL_PATH)
    class_names = model.classes_.tolist()
    print(f"Model loaded. {len(class_names)} classes.")

    all_results = {}

    for scenario in SCENARIOS:
        p = scenario["params"]
        print(f"\n{'─'*60}")
        print(f"Scenario: {scenario['name']}")

        probs = get_probas(model, p["N"], p["P"], p["K"],
                           p["temperature"], p["humidity"],
                           p["ph"], p["rainfall"])

        top_crops = compute_top_crops(
            probabilities=probs,
            class_names=class_names,
            soil_type=p["soil_type"],
            input_n=p["N"],
            input_p=p["P"],
            input_k=p["K"],
            input_temp=p["temperature"],
            input_humidity=p["humidity"],
            input_ph=p["ph"],
            input_rainfall=p["rainfall"],
            top_n=5,
        )

        # Full detail capture
        detail_list = []
        for rank, c in enumerate(top_crops, 1):
            detail = {
                "rank": rank,
                "crop": c["crop_name"],
                "model_probability": c["model_probability"],
                "suitability_score": c["suitability_score"],
                "suitability_components": c["suitability_components"],
                "coffee_penalty_applied": c["coffee_penalty_applied"],
                "uncertainty_label": c["uncertainty_score"]["label"],
                "ranking_score": c["model_probability"],  # BEFORE: pure model_probability
            }
            detail_list.append(detail)

        all_results[scenario["name"]] = {
            "params": {k: v for k, v in p.items()},
            "mode": "BEFORE (pure model_probability sort)",
            "top_crops": detail_list,
        }

        # Print summary
        print(f"  Inputs: N={p['N']}, P={p['P']}, K={p['K']}, temp={p['temperature']}°C, "
              f"humidity={p['humidity']}%, pH={p['ph']}, rainfall={p['rainfall']}mm, "
              f"soil={p['soil_type']}")
        print(f"  Top-5:")
        for entry in detail_list:
            prob_pct = f"{entry['model_probability']*100:.1f}%"
            print(f"    #{entry['rank']}: {entry['crop']:15s} prob={prob_pct:>7s}  "
                  f"suit={entry['suitability_score']}/100  unc={entry['uncertainty_label']}")
            if entry['coffee_penalty_applied'] > 0:
                print(f"           coffee_penalty={entry['coffee_penalty_applied']}")

    # Save baseline JSON
    output_path = Path(__file__).parent.parent / "data" / "baseline_before.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(all_results, f, indent=2)
    print(f"\n✅ Baseline BEFORE saved to {output_path}")

    # Flag analysis
    print("\n\n=== FLAG ANALYSIS (BEFORE) ===")
    print(f"{'Scenario':35s} {'<1% prob crops':30s} {'Coffee in top-5':20s} {'Coffee #1?':15s}")
    print("-" * 100)
    for sc_name, sc_data in all_results.items():
        low_prob = [c["crop"] for c in sc_data["top_crops"] if c["model_probability"] < 0.01]
        coffee_in = next((c for c in sc_data["top_crops"] if c["crop"] == "coffee"), None)
        coffee_rank = coffee_in["rank"] if coffee_in else None
        low_str = ", ".join(low_prob)[:30] if low_prob else "(none)"
        coffee_str = f"YES (rank #{coffee_rank})" if coffee_in else "no"
        coffee_first = "YES" if coffee_rank == 1 else "no"
        print(f"{sc_name[:35]:35s} {low_str:30s} {coffee_str:20s} {coffee_first:15s}")


if __name__ == "__main__":
    main()