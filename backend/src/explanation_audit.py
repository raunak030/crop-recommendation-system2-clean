"""
Explanation Consistency Audit — Smart Crop Engine v1.5

Generates 50+ prediction scenarios and checks explanation consistency:
1. If temperature_fitness < 70, explanation must NOT say "temperature is ideal"
2. If rainfall_fitness < 70, explanation must NOT say "rainfall is adequate"
3. If soil_compatibility < 70, explanation must NOT say "strongly compatible"
4. If ML probability < 70%, should appear in risks section
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
SOIL_TYPES = ["Alluvial", "Black", "Red", "Laterite", "Clay", "Sandy", "Loamy"]


def load_model():
    return joblib.load(MODEL_PATH)


def get_probas(model, N, P, K, temp, humidity, ph, rainfall):
    df = pd.DataFrame([[N, P, K, temp, humidity, ph, rainfall]],
                      columns=["N", "P", "K", "temperature", "humidity", "ph", "rainfall"])
    return model.predict_proba(df)[0].tolist()


def generate_scenarios():
    """Generate 50+ varied parameter combinations."""
    scenarios = []

    # 1. 10 regional scenarios
    regional = [
        {"N": 90, "P": 40, "K": 40, "temperature": 25, "humidity": 75, "ph": 7.0, "rainfall": 200, "soil_type": "Alluvial"},
        {"N": 60, "P": 35, "K": 35, "temperature": 20, "humidity": 55, "ph": 7.5, "rainfall": 80, "soil_type": "Loamy"},
        {"N": 80, "P": 45, "K": 40, "temperature": 24, "humidity": 65, "ph": 7.2, "rainfall": 160, "soil_type": "Alluvial"},
        {"N": 70, "P": 30, "K": 30, "temperature": 32, "humidity": 50, "ph": 7.5, "rainfall": 90, "soil_type": "Black"},
        {"N": 90, "P": 30, "K": 35, "temperature": 24, "humidity": 65, "ph": 6.5, "rainfall": 150, "soil_type": "Red"},
        {"N": 60, "P": 30, "K": 40, "temperature": 28, "humidity": 85, "ph": 5.5, "rainfall": 300, "soil_type": "Laterite"},
        {"N": 20, "P": 15, "K": 15, "temperature": 38, "humidity": 25, "ph": 8.0, "rainfall": 40, "soil_type": "Sandy"},
        {"N": 80, "P": 40, "K": 30, "temperature": 34, "humidity": 40, "ph": 7.8, "rainfall": 100, "soil_type": "Black"},
        {"N": 50, "P": 30, "K": 30, "temperature": 28, "humidity": 55, "ph": 7.0, "rainfall": 120, "soil_type": "Loamy"},
        {"N": 80, "P": 35, "K": 40, "temperature": 30, "humidity": 70, "ph": 6.8, "rainfall": 180, "soil_type": "Clay"},
    ]
    scenarios.extend(regional)

    # 2. Extreme conditions
    extremes = [
        {"N": 10, "P": 10, "K": 10, "temperature": 10, "humidity": 10, "ph": 4.0, "rainfall": 20, "soil_type": "Sandy"},
        {"N": 150, "P": 150, "K": 200, "temperature": 42, "humidity": 95, "ph": 9.0, "rainfall": 350, "soil_type": "Clay"},
        {"N": 50, "P": 50, "K": 50, "temperature": 25, "humidity": 50, "ph": 6.5, "rainfall": 100, "soil_type": "Loamy"},
        {"N": 100, "P": 50, "K": 50, "temperature": 15, "humidity": 80, "ph": 8.5, "rainfall": 50, "soil_type": "Red"},
        {"N": 30, "P": 100, "K": 30, "temperature": 35, "humidity": 30, "ph": 5.0, "rainfall": 250, "soil_type": "Laterite"},
    ]
    scenarios.extend(extremes)

    # 3. Crop-specific optimal conditions
    for crop_name, req in CROP_REQUIREMENTS.items():
        scenarios.append({
            "N": round(req["N"]["mean"], 1),
            "P": round(req["P"]["mean"], 1),
            "K": round(req["K"]["mean"], 1),
            "temperature": round(req["temperature"]["mean"], 1),
            "humidity": round(req["humidity"]["mean"], 1),
            "ph": round(req["ph"]["mean"], 1),
            "rainfall": round(req["rainfall"]["mean"], 1),
            "soil_type": SOIL_TYPES[hash(crop_name) % len(SOIL_TYPES)],
        })

    # 4. Additional varied combos
    import random
    random.seed(42)
    for _ in range(20):
        scenarios.append({
            "N": round(random.uniform(0, 150), 1),
            "P": round(random.uniform(0, 150), 1),
            "K": round(random.uniform(0, 200), 1),
            "temperature": round(random.uniform(10, 42), 1),
            "humidity": round(random.uniform(10, 99), 1),
            "ph": round(random.uniform(4.0, 9.0), 1),
            "rainfall": round(random.uniform(20, 350), 1),
            "soil_type": random.choice(SOIL_TYPES),
        })

    return scenarios


def check_consistency(crop_name, rank, top_entry, params):
    """Check explanation consistency with actual scores."""
    inconsistencies = []
    explanation = top_entry.get("explanation", {})
    components = top_entry.get("suitability_components", {})
    scores = components.get("scores", {})

    temp_fit = scores.get("temperature_fitness", 100)
    rain_fit = scores.get("rainfall_fitness", 100)
    soil_comp = components.get("soil_compatibility_score", 100)
    ml_prob = top_entry.get("model_probability", 0) * 100

    why_text = explanation.get("why_recommended", "").lower()
    strengths = explanation.get("strengths", [])
    risks = explanation.get("risks", [])
    soil_match_text = explanation.get("soil_match", "").lower()

    # Check 1: temp_fitness < 70 → must NOT say "temperature is ideal"
    if temp_fit < 70 and "temperature is ideal" in why_text:
        inconsistencies.append(f"[temp_ideal] {crop_name}(#{rank}): temp_fit={temp_fit:.1f}<70 but says 'temperature is ideal'")

    # Check 2: rainfall_fitness < 70 → must NOT say "rainfall is adequate"
    if rain_fit < 70:
        if "rainfall is adequate" in why_text:
            inconsistencies.append(f"[rain_adequate] {crop_name}(#{rank}): rain_fit={rain_fit:.1f}<70 but says 'rainfall is adequate'")
    if rain_fit < 70:
        for s in strengths:
            if "rainfall is adequate" in s.lower():
                inconsistencies.append(f"[rain_strength] {crop_name}(#{rank}): rain_fit={rain_fit:.1f}<70 but strengths say 'rainfall is adequate'")

    # Check 3: soil_compatibility < 70 → must NOT say "strongly compatible"
    if soil_comp < 70 and "strongly compatible" in soil_match_text:
        inconsistencies.append(f"[soil_strong] {crop_name}(#{rank}): soil_comp={soil_comp:.1f}<70 but says 'strongly compatible'")

    # Check 4: ML probability < 70% → should appear in risks
    if ml_prob < 70:
        mentioned = False
        for risk in risks:
            rl = risk.lower()
            if any(word in rl for word in ["low confidence", "model", "uncertainty", "probability"]):
                mentioned = True
                break
        if not mentioned:
            inconsistencies.append(f"[ml_risk] {crop_name}(#{rank}): ML_prob={ml_prob:.1f}%<70% but not in risks section")

    return inconsistencies


def main():
    print("=" * 60)
    print("EXPLANATION CONSISTENCY AUDIT — Smart Crop Engine v1.5")
    print("=" * 60)

    print("Loading model...")
    model = load_model()
    class_names = model.classes_.tolist()
    print(f"Model loaded. {len(class_names)} classes.")

    scenarios = generate_scenarios()
    print(f"Generated {len(scenarios)} scenarios for testing")

    all_inconsistencies = []
    check_counts = {}
    scenarios_with_issues = 0
    total_checks = 0

    for idx, params in enumerate(scenarios):
        print(f"\rProcessing scenario {idx+1}/{len(scenarios)}...", end="", flush=True)

        probs = get_probas(model, params["N"], params["P"], params["K"],
                           params["temperature"], params["humidity"],
                           params["ph"], params["rainfall"])

        top_crops = compute_top_crops(
            probabilities=probs, class_names=class_names,
            soil_type=params["soil_type"],
            input_n=params["N"], input_p=params["P"], input_k=params["K"],
            input_temp=params["temperature"], input_humidity=params["humidity"],
            input_ph=params["ph"], input_rainfall=params["rainfall"],
            top_n=5
        )

        for rank, entry in enumerate(top_crops, 1):
            incs = check_consistency(entry["crop_name"], rank, entry, params)
            for inc in incs:
                all_inconsistencies.append(inc)
                check_parts = inc.split("]")[0].lstrip("[").split("_")
                check_type = check_parts[0] if len(check_parts) >= 1 else "unknown"
                check_counts[check_type] = check_counts.get(check_type, 0) + 1
                total_checks += 1
            if incs:
                scenarios_with_issues += 1

    print()
    print(f"\n{'='*60}")
    print("RESULTS")
    print(f"{'='*60}")
    print(f"Scenarios tested: {len(scenarios)}")
    print(f"Crops in top-5 checked: ~{len(scenarios) * 5}")
    print(f"Inconsistencies found: {len(all_inconsistencies)}")
    print(f"Scenarios with issues: {scenarios_with_issues}")

    if all_inconsistencies:
        print(f"\nBy check type:")
        for ctype, count in sorted(check_counts.items(), key=lambda x: -x[1]):
            print(f"  [{ctype}] {count}")
        print(f"\nAll inconsistencies:")
        for inc in all_inconsistencies:
            print(f"  {inc}")
    else:
        print(f"\n✅ ALL CHECKS PASSED — no explanation inconsistencies found")

    # Generate report
    report_path = Path(__file__).parent.parent / "docs" / "EXPLANATION_CONSISTENCY_AUDIT.md"
    report_path.parent.mkdir(parents=True, exist_ok=True)

    lines = []
    lines.append("# Explanation Consistency Audit — Smart Crop Engine v1.5")
    lines.append("")
    lines.append("## Methodology")
    lines.append("")
    lines.append(f"- **Scenarios generated:** {len(scenarios)} (regional + extreme + crop-specific + random)")
    lines.append("- For each scenario, get top-5 from `compute_top_crops()` with real model probabilities")
    lines.append("- For each crop in top-5, verify explanation text matches computed scores")
    lines.append("")
    lines.append("### Consistency Rules")
    lines.append("")
    lines.append("| # | Rule | Condition |")
    lines.append("|---|------|-----------|")
    lines.append("| 1 | temp_fitness < 70 → must NOT say 'temperature is ideal' | Must say 'acceptable' or 'outside' |")
    lines.append("| 2 | rainfall_fitness < 70 → must NOT say 'rainfall is adequate' | Must say 'low' or 'high' |")
    lines.append("| 3 | soil_compatibility < 70 → must NOT say 'strongly compatible' | Must say 'weakly compatible' |")
    lines.append("| 4 | ML probability < 70% → must appear in risks | Must mention low confidence/uncertainty |")
    lines.append("")
    lines.append("## Results")
    lines.append("")
    lines.append(f"- **Total scenarios tested:** {len(scenarios)}")
    lines.append(f"- **Total crops checked:** ~{len(scenarios) * 5}")
    lines.append(f"- **Inconsistencies found:** {len(all_inconsistencies)}")
    lines.append(f"- **Scenarios with issues:** {scenarios_with_issues}")
    lines.append("")

    if all_inconsistencies:
        lines.append("### Breakdown by Check Type")
        lines.append("")
        lines.append("| Check Type | Count |")
        lines.append("|------------|-------|")
        for ctype, count in sorted(check_counts.items(), key=lambda x: -x[1]):
            lines.append(f"| {ctype} | {count} |")
        lines.append("")

        lines.append("### All Inconsistencies")
        lines.append("")
        for i, inc in enumerate(all_inconsistencies, 1):
            lines.append(f"{i}. {inc}")
        lines.append("")

        lines.append("## Fixes Applied")
        lines.append("")
        lines.append("See code changes in `rule_engine.py` for fixes addressing these inconsistencies.")
    else:
        lines.append("### ✅ ALL CHECKS PASSED")
        lines.append("")
        lines.append("No inconsistencies were found. The explanation engine is fully consistent with")
        lines.append("computed scores across all 50+ test scenarios.")
        lines.append("")
        lines.append("## Fixes Applied")
        lines.append("")
        lines.append("None needed — all explanations were already consistent.")

    report_content = "\n".join(lines)
    report_path.write_text(report_content)
    print(f"\nReport written to {report_path}")


if __name__ == "__main__":
    main()