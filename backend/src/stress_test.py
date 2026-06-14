#!/usr/bin/env python3
"""
Real-World Stress Test for RandomForest Crop Recommendation Model
===============================================================
Loads the trained model, runs 120+ realistic Indian farming scenarios across
7 agro-climatic zones plus extreme boundary cases, and generates a comprehensive
markdown report at docs/REAL_WORLD_STRESS_TEST.md
"""

import joblib
import numpy as np
import os
import sys
from collections import Counter, OrderedDict

# ─── Paths ───────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "crop_model.pkl")
DOCS_DIR = os.path.join(os.path.dirname(BASE_DIR), "docs")
REPORT_PATH = os.path.join(DOCS_DIR, "REAL_WORLD_STRESS_TEST.md")
FEATURE_NAMES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

# ─── Load model ──────────────────────────────────────────────────────────────
print("Loading model...")
model = joblib.load(MODEL_PATH)
all_classes = list(model.classes_)
n_classes = len(all_classes)
print(f"Model: RandomForestClassifier with {model.n_estimators} trees")
print(f"Number of classes: {n_classes}")
print(f"Crops: {', '.join(all_classes)}\n")


# ─── Scenario generator helpers ──────────────────────────────────────────────

def scenario(N, P, K, temperature, humidity, ph, rainfall, zone="unspecified"):
    """Return a scenario dict."""
    return {
        "N": N, "P": P, "K": K,
        "temperature": temperature,
        "humidity": humidity,
        "ph": ph,
        "rainfall": rainfall,
        "zone": zone,
    }


def make_zone_scenarios(param_ranges, zone_name, n=15, seed=42):
    """Generate n varied scenarios within the given parameter ranges."""
    rng = np.random.RandomState(seed)
    scenarios = []
    lowers = [param_ranges[k][0] for k in FEATURE_NAMES]
    uppers = [param_ranges[k][1] for k in FEATURE_NAMES]
    for i in range(n):
        vals = [rng.uniform(l, u) for l, u in zip(lowers, uppers)]
        # Randomly nudge a few parameters to extremes within range for variety
        if i % 3 == 1:
            # Push one parameter to its low end
            idx = rng.randint(0, 7)
            vals[idx] = lowers[idx] + (uppers[idx] - lowers[idx]) * 0.05
        elif i % 3 == 2:
            # Push one parameter to its high end
            idx = rng.randint(0, 7)
            vals[idx] = uppers[idx] - (uppers[idx] - lowers[idx]) * 0.05
        scenarios.append(scenario(
            N=round(vals[0], 1),
            P=round(vals[1], 1),
            K=round(vals[2], 1),
            temperature=round(vals[3], 2),
            humidity=round(vals[4], 2),
            ph=round(vals[5], 2),
            rainfall=round(vals[6], 2),
            zone=zone_name,
        ))
    return scenarios


# ─── 1. Rice-Wheat Zone (Indo-Gangetic plains) ──────────────────────────────
rice_wheat_ranges = {
    "N": (60, 140), "P": (40, 80), "K": (30, 60),
    "temperature": (18, 30), "humidity": (60, 85),
    "ph": (6.0, 7.5), "rainfall": (150, 300),
}
rice_wheat_scenarios = make_zone_scenarios(
    rice_wheat_ranges, "Rice-Wheat Zone (Indo-Gangetic Plains)", n=15, seed=101
)

# ─── 2. Cotton Belt (Gujarat/Maharashtra) ────────────────────────────────────
cotton_belt_ranges = {
    "N": (40, 100), "P": (30, 60), "K": (20, 50),
    "temperature": (28, 38), "humidity": (40, 65),
    "ph": (6.5, 8.0), "rainfall": (80, 200),
}
cotton_belt_scenarios = make_zone_scenarios(
    cotton_belt_ranges, "Cotton Belt (Gujarat/Maharashtra)", n=15, seed=202
)

# ─── 3. Coastal/Humid (Kerala/West Bengal) ──────────────────────────────────
coastal_ranges = {
    "N": (40, 100), "P": (30, 60), "K": (30, 60),
    "temperature": (25, 35), "humidity": (75, 95),
    "ph": (5.0, 6.5), "rainfall": (200, 350),
}
coastal_scenarios = make_zone_scenarios(
    coastal_ranges, "Coastal/Humid (Kerala/West Bengal)", n=15, seed=303
)

# ─── 4. Deccan Plateau (Dryland/Rainfed) ────────────────────────────────────
deccan_ranges = {
    "N": (10, 50), "P": (10, 40), "K": (10, 30),
    "temperature": (30, 40), "humidity": (25, 50),
    "ph": (7.0, 8.5), "rainfall": (30, 100),
}
deccan_scenarios = make_zone_scenarios(
    deccan_ranges, "Deccan Plateau (Dryland/Rainfed)", n=15, seed=404
)

# ─── 5. Horticulture Belt (Himachal/J&K) ────────────────────────────────────
horti_ranges = {
    "N": (30, 80), "P": (20, 50), "K": (20, 40),
    "temperature": (10, 25), "humidity": (50, 75),
    "ph": (5.5, 7.0), "rainfall": (80, 180),
}
horti_scenarios = make_zone_scenarios(
    horti_ranges, "Horticulture Belt (Himachal/J&K)", n=15, seed=505
)

# ─── 6. Arid/Semi-Arid (Rajasthan/Gujarat) ──────────────────────────────────
arid_ranges = {
    "N": (10, 40), "P": (10, 30), "K": (10, 30),
    "temperature": (32, 45), "humidity": (15, 35),
    "ph": (7.5, 9.0), "rainfall": (20, 80),
}
arid_scenarios = make_zone_scenarios(
    arid_ranges, "Arid/Semi-Arid (Rajasthan/Gujarat)", n=15, seed=606
)

# ─── 7. Extreme / Boundary Conditions ────────────────────────────────────────
extreme_scenarios = [
    # Zero/low nutrients
    scenario(0, 0, 0, 25, 60, 7.0, 150, "Extreme: Zero Nutrients"),
    scenario(0, 60, 40, 25, 60, 7.0, 200, "Extreme: Zero N only"),
    scenario(90, 0, 40, 25, 60, 7.0, 200, "Extreme: Zero P only"),
    scenario(90, 60, 0, 25, 60, 7.0, 200, "Extreme: Zero K only"),
    # Excessive nutrients
    scenario(200, 80, 60, 25, 60, 7.0, 200, "Extreme: Very High N"),
    scenario(140, 200, 60, 25, 60, 7.0, 200, "Extreme: Very High P"),
    scenario(140, 80, 200, 25, 60, 7.0, 200, "Extreme: Very High K"),
    scenario(200, 200, 200, 25, 60, 7.0, 200, "Extreme: All nutrients max"),
    # Temperature extremes
    scenario(60, 40, 30, 50, 30, 7.0, 100, "Extreme: Very High Temp (50°C)"),
    scenario(60, 40, 30, 5, 70, 7.0, 100, "Extreme: Very Low Temp (5°C)"),
    scenario(60, 40, 30, 48, 10, 7.0, 50, "Extreme: High Temp + Low Humidity"),
    # Humidity extremes
    scenario(60, 40, 30, 28, 5, 7.0, 150, "Extreme: Very Low Humidity (5%)"),
    scenario(60, 40, 30, 28, 100, 7.0, 250, "Extreme: Very High Humidity (100%)"),
    # Rainfall extremes
    scenario(60, 40, 30, 28, 65, 7.0, 0, "Extreme: Zero Rainfall"),
    scenario(60, 40, 30, 28, 95, 7.0, 400, "Extreme: Very High Rainfall (400mm)"),
    scenario(40, 20, 20, 40, 20, 8.5, 0, "Extreme: Desert (rain=0, arid high pH)"),
    # pH extremes
    scenario(60, 40, 30, 28, 60, 10.0, 150, "Extreme: Very High pH (10.0)"),
    scenario(60, 40, 30, 28, 60, 4.0, 200, "Extreme: Very Low pH (4.0)"),
    scenario(50, 30, 25, 35, 80, 3.5, 300, "Extreme: Acidic Soil pH 3.5"),
    # Combined extremes
    scenario(200, 200, 200, 45, 90, 8.5, 350, "Extreme: All High combined"),
    scenario(0, 0, 0, 10, 15, 4.5, 10, "Extreme: All Low combined"),
    scenario(150, 120, 100, 42, 85, 9.5, 380, "Extreme: Mixed extremes high"),
    scenario(5, 5, 5, 8, 10, 4.0, 5, "Extreme: Near Sterile conditions"),
]

# ─── 8. Random Realistic Mixes (to exceed 120 total) ─────────────────────────
# Create varied scenarios that blend conditions from different zones
rng_real = np.random.RandomState(707)
random_scenarios = []
random_labels = [
    "Rainfed mix with moderate fertility",
    "Transition zone: humid to semi-arid",
    "High-altitude farming (cool & dry)",
    "River delta alluvial (high nutrients)",
    "Black soil region (high pH, clay)",
    "Laterite soil zone (low pH, low NPK)",
    "Alluvial plain (moderate everything)",
    "Mountain terrace farming (cool, steep)",
    "Coastal alluvial (sandy, moderate)",
    "Forest clearing cultivation",
    "Irrigated command area (high input)",
    "Rain-shadow region (low rainfall)",
    "Monsoon transition zone",
    "Plateau fringe (shallow soil)",
    "Valley bottom (high moisture)",
    "Sandy loam region (low retention)",
    "Loamy soil (balanced)",
    "Clay loam region (high K)",
    "Saline-alkaline zone (high pH)",
    "Inter-cropping mix scenario",
    "Mixed cropping (cereals+legumes)",
    "Organic farming (low NPK)",
    "Intensive farming (high NPK)",
    "Subsistence farming (low input)",
]

for i, label in enumerate(random_labels):
    # Blend random parameters across ranges
    N = round(rng_real.uniform(5, 160), 1)
    P = round(rng_real.uniform(5, 120), 1)
    K = round(rng_real.uniform(5, 100), 1)
    temp = round(rng_real.uniform(10, 42), 2)
    hum = round(rng_real.uniform(15, 95), 2)
    ph = round(rng_real.uniform(5.0, 9.0), 2)
    rain = round(rng_real.uniform(10, 350), 2)
    random_scenarios.append(scenario(N, P, K, temp, hum, ph, rain, f"Random Mix: {label}"))


# ─── Combine all scenarios ───────────────────────────────────────────────────
all_scenarios = (
    rice_wheat_scenarios
    + cotton_belt_scenarios
    + coastal_scenarios
    + deccan_scenarios
    + horti_scenarios
    + arid_scenarios
    + extreme_scenarios
    + random_scenarios
)

print(f"Total scenarios generated: {len(all_scenarios)}")
zone_counts = Counter(s["zone"] for s in all_scenarios)
print("Scenarios per zone:")
for zone, count in sorted(zone_counts.items()):
    print(f"  {zone}: {count}")
print()


# ─── Run predictions ─────────────────────────────────────────────────────────
print("Running predictions...")
results = []
for s in all_scenarios:
    feat = np.array([[s["N"], s["P"], s["K"],
                      s["temperature"], s["humidity"],
                      s["ph"], s["rainfall"]]])
    pred = model.predict(feat)[0]
    probs = model.predict_proba(feat)[0]
    pred_idx = list(model.classes_).index(pred)
    confidence = float(probs[pred_idx])
    results.append({
        **s,
        "predicted_crop": pred,
        "confidence": confidence,
        "all_probs": {cls: float(probs[i]) for i, cls in enumerate(model.classes_)},
    })

total = len(results)
print(f"Predictions complete for {total} scenarios.\n")


# ─── Statistics ──────────────────────────────────────────────────────────────

# Prediction distribution
pred_counter = Counter(r["predicted_crop"] for r in results)
sorted_preds = sorted(pred_counter.items(), key=lambda x: -x[1])

# Top 5
top5 = sorted_preds[:5]

# Silent crops
silent_crops = [c for c in all_classes if c not in pred_counter]

# Confidence stats
confidences = [r["confidence"] for r in results]
avg_confidence = np.mean(confidences)
max_confidence = max(confidences)
min_confidence = min(confidences)
median_confidence = np.median(confidences)

# Confidence distribution buckets (0-10%, 10-20%, ..., 90-100%)
buckets = OrderedDict()
for pct in range(0, 100, 10):
    buckets[f"{pct}-{pct+10}%"] = 0
buckets["100%"] = 0

for c in confidences:
    pct = int(c * 100)
    if pct >= 100:
        buckets["100%"] += 1
    elif pct >= 0:
        lo = (pct // 10) * 10
        buckets[f"{lo}-{lo+10}%"] += 1

# Parameter stats
param_stats = {}
for feat in FEATURE_NAMES:
    vals = [s[feat] for s in all_scenarios]
    param_stats[feat] = {
        "min": round(min(vals), 2),
        "max": round(max(vals), 2),
        "mean": round(np.mean(vals), 2),
    }

# ─── Print to stdout ─────────────────────────────────────────────────────────

print("=" * 70)
print("REAL-WORLD STRESS TEST — RESULTS")
print("=" * 70)
print(f"\nTotal scenarios tested: {total}")
print(f"Number of crops: {n_classes}")

print(f"\n--- Prediction Distribution ---")
for crop, count in sorted_preds:
    pct = (count / total) * 100
    print(f"  {crop:20s}: {count:3d} ({pct:5.1f}%)")

print(f"\n--- Top 5 Most Predicted Crops ---")
for i, (crop, count) in enumerate(top5, 1):
    pct = (count / total) * 100
    print(f"  {i}. {crop:20s}: {count:3d} ({pct:5.1f}%)")

print(f"\n--- Crops Never Predicted ({len(silent_crops)}) ---")
if silent_crops:
    print(f"  {', '.join(silent_crops)}")
else:
    print("  (none — all crops predicted at least once)")

print(f"\n--- Confidence Statistics ---")
print(f"  Average confidence: {avg_confidence:.4f} ({avg_confidence*100:.2f}%)")
print(f"  Median confidence:  {median_confidence:.4f} ({median_confidence*100:.2f}%)")
print(f"  Maximum confidence: {max_confidence:.4f} ({max_confidence*100:.2f}%)")
print(f"  Minimum confidence: {min_confidence:.4f} ({min_confidence*100:.2f}%)")

print(f"\n--- Confidence Distribution ---")
for bucket, count in buckets.items():
    pct = (count / total) * 100
    bar = "█" * (count * 50 // total) if total > 0 else ""
    print(f"  {bucket:>8s}: {count:3d} ({pct:5.1f}%) {bar}")

print(f"\n--- Parameter Ranges ---")
for feat in FEATURE_NAMES:
    s = param_stats[feat]
    print(f"  {feat:12s}: min={s['min']:>8.2f}, max={s['max']:>8.2f}, mean={s['mean']:>8.2f}")

print(f"\n--- Extreme Scenario Results ---")
for r in results:
    if "Extreme" in r["zone"]:
        print(f"  [{r['zone']:45s}] → {r['predicted_crop']:15s} (conf={r['confidence']:.4f})")

print(f"\nReport will be saved to: {REPORT_PATH}")
print("=" * 70)


# ─── Generate Markdown Report ────────────────────────────────────────────────

def ascii_histogram(counts_dict, total, width=40):
    """Generate an ASCII histogram with the given bucket counts."""
    max_count = max(counts_dict.values()) if counts_dict else 1
    lines = []
    for bucket, count in counts_dict.items():
        pct = (count / total * 100) if total > 0 else 0
        bar_len = int((count / max_count) * width) if max_count > 0 else 0
        bar = "█" * bar_len
        lines.append(f"  {bucket:>8s} |{bar:<{width}}| {count:3d} ({pct:5.1f}%)")
    return "\n".join(lines)


def zone_param_table():
    """Return a markdown table of zone parameter ranges."""
    zones_data = [
        ("Rice-Wheat Zone (Indo-Gangetic Plains)", rice_wheat_ranges),
        ("Cotton Belt (Gujarat/Maharashtra)", cotton_belt_ranges),
        ("Coastal/Humid (Kerala/West Bengal)", coastal_ranges),
        ("Deccan Plateau (Dryland/Rainfed)", deccan_ranges),
        ("Horticulture Belt (Himachal/J&K)", horti_ranges),
        ("Arid/Semi-Arid (Rajasthan/Gujarat)", arid_ranges),
    ]
    lines = ["| Zone | N Range | P Range | K Range | Temp Range (°C) | Humidity Range (%) | Rainfall Range (mm) | pH Range |"]
    lines.append("|------|---------|---------|---------|----------------|--------------------|-------------------|----------|")
    for name, ranges in zones_data:
        lines.append(
            f"| {name} | {ranges['N'][0]}-{ranges['N'][1]} | {ranges['P'][0]}-{ranges['P'][1]} | "
            f"{ranges['K'][0]}-{ranges['K'][1]} | {ranges['temperature'][0]}-{ranges['temperature'][1]} | "
            f"{ranges['humidity'][0]}-{ranges['humidity'][1]} | {ranges['rainfall'][0]}-{ranges['rainfall'][1]} | "
            f"{ranges['ph'][0]}-{ranges['ph'][1]} |"
        )
    return "\n".join(lines)


def zone_contributions():
    """Return zone contribution counts as markdown list."""
    lines = []
    zone_contrib = Counter(s["zone"] for s in all_scenarios)
    for zone, count in sorted(zone_contrib.items()):
        lines.append(f"- **{zone}**: {count} scenarios")
    return "\n".join(lines)


def extreme_results_table(results):
    """Return extreme scenario results as markdown table."""
    lines = ["| Scenario | N | P | K | Temp | Humidity | pH | Rainfall | Predicted Crop | Confidence |"]
    lines.append("|----------|---|---|---|------|----------|----|---------|----------------|------------|")
    for r in results:
        if "Extreme" in r["zone"]:
            lines.append(
                f"| {r['zone']} | {r['N']} | {r['P']} | {r['K']} | "
                f"{r['temperature']} | {r['humidity']} | {r['ph']} | {r['rainfall']} | "
                f"{r['predicted_crop']} | {r['confidence']:.4f} |"
            )
    return "\n".join(lines)


def scenario_data_table(results):
    """Return all scenario data as markdown code block table."""
    lines = [
        "| # | Zone | N | P | K | Temp | Humidity | pH | Rainfall | Predicted Crop | Confidence |",
        "|---|------|---|---|---|------|----------|----|----------|----------------|------------|",
    ]
    for i, r in enumerate(results, 1):
        zone_short = r["zone"][:30]
        lines.append(
            f"| {i} | {zone_short} | {r['N']} | {r['P']} | {r['K']} | "
            f"{r['temperature']} | {r['humidity']} | {r['ph']} | {r['rainfall']} | "
            f"{r['predicted_crop']} | {r['confidence']:.4f} |"
        )
    return "\n".join(lines)


# Calculate stats for report
n_appeared = len(pred_counter)
n_silent = len(silent_crops)
pct_appeared = (n_appeared / n_classes) * 100
top_crop, top_count = sorted_preds[0] if sorted_preds else ("N/A", 0)
top_pct = (top_count / total) * 100

# Build key finding
if n_silent == 0:
    key_finding = (f"All {n_classes} crop classes were predicted at least once across the {total} scenarios, "
                   f"indicating broad feature space coverage. "
                   f"Average confidence is {avg_confidence*100:.1f}%, suggesting "
                   f"{'strong' if avg_confidence > 0.8 else 'moderate' if avg_confidence > 0.5 else 'modest'} model certainty.")
else:
    key_finding = (f"Out of {n_classes} crop classes, {n_silent} were never predicted ({n_silent/n_classes*100:.0f}% silent). "
                   f"Average confidence is {avg_confidence*100:.1f}%. "
                   f"Most predicted crop is '{top_crop}' ({top_count}/{total} = {top_pct:.1f}% of scenarios).")

report_content = f"""# Real-World Stress Test Report

## Executive Summary

- **Total scenarios tested**: {total}
- **Average confidence**: {avg_confidence*100:.2f}%
- **Maximum confidence**: {max_confidence*100:.2f}%
- **Minimum confidence**: {min_confidence*100:.2f}%
- **Number of crops that appeared at least once**: {n_appeared} / {n_classes} ({pct_appeared:.1f}%)
- **Number of silent crops (never predicted)**: {n_silent}
- **Key finding**: {key_finding}

---

## Scenario Design

This stress test evaluates the trained RandomForest model across **7 agro-climatic zones** representing India's diverse agricultural regions, plus **extreme boundary conditions** and **random realistic mixes**.

### Zones Covered

{zone_contributions()}

### Parameter Ranges per Zone

{zone_param_table()}

---

## Overall Results

### Full Prediction Distribution

| Crop | Count | Percentage |
|------|-------|------------|
"""

for crop, count in sorted_preds:
    pct = (count / total) * 100
    report_content += f"| {crop} | {count} | {pct:.1f}% |\n"

report_content += f"""
### Top 5 Most Predicted Crops

| Rank | Crop | Count | Percentage |
|------|------|-------|------------|
"""
for i, (crop, count) in enumerate(top5, 1):
    pct = (count / total) * 100
    report_content += f"| {i} | {crop} | {count} | {pct:.1f}% |\n"

top5_crop_names = [c for c, _ in top5]
report_content += f"""
**Analysis**: The top 5 crops ({', '.join(top5_crop_names)}) account for {sum(c for _, c in top5)}/{total} = {sum(c for _, c in top5)/total*100:.1f}% of all predictions.

### Crops Never Predicted (Silent Classes)

**{len(silent_crops)} silent class(es):**
"""
if silent_crops:
    for crop in silent_crops:
        report_content += f"- **{crop}**\n"
else:
    report_content += "- (none — all crop classes appeared at least once)\n"

report_content += """
---

## Confidence Analysis

### Summary Statistics
- **Average confidence**: {avg_conf:.2f}%
- **Median confidence**: {med_conf:.2f}%
- **Maximum confidence**: {max_conf:.2f}%
- **Minimum confidence**: {min_conf:.2f}%

### Confidence Histogram (ASCII Bar Chart)

```
{histogram}
```

### Confidence Distribution Table

| Bucket | Count | Percentage |
|--------|-------|------------|
""".format(
    avg_conf=avg_confidence*100,
    med_conf=median_confidence*100,
    max_conf=max_confidence*100,
    min_conf=min_confidence*100,
    histogram=ascii_histogram(buckets, total),
)

for bucket, count in buckets.items():
    pct = (count / total) * 100
    report_content += f"| {bucket} | {count} | {pct:.1f}% |\n"

# Determine confidence interpretation
if avg_confidence > 0.8:
    conf_analysis = "very certain across most scenarios"
elif avg_confidence > 0.5:
    conf_analysis = "moderately confident, with some uncertainty"
else:
    conf_analysis = "often uncertain, indicating potential feature space gaps"

report_content += f"""
**Analysis**: 
- The {avg_confidence*100:.1f}% average confidence suggests the model is **{conf_analysis}**.
- A distribution concentrated in the 90-100% bucket would indicate high certainty across diverse inputs.
- If significant mass appears in lower buckets (0-60%), the model expresses uncertainty for many real-world scenarios.
- Extreme conditions naturally produce lower confidence, which is a healthy behavior.

"""

# Silent class analysis
report_content += f"""
## Silent Class Analysis

**{len(silent_crops)} crop(s) never predicted across {total} scenarios**
"""
if silent_crops:
    report_content += """
### Silent Crops
"""
    for crop in silent_crops:
        report_content += f"- **{crop}**\n"

    report_content += """
### Why They Might Be Silent

Silent classes can result from:
1. **Feature space overlap**: The crop's optimal growing conditions overlap significantly with other crops, and the model consistently prefers the other crop.
2. **Training data limitations**: The original dataset may have underrepresented the specific parameter combinations needed for this crop.
3. **Niche ecological requirements**: Some crops require very specific conditions that conventional farming scenarios rarely match.
4. **Model bias**: The RandomForest may develop preference for classes with more distinct decision boundaries.

### Conditions That Might Activate Them
"""
    for crop in silent_crops:
        # Provide agronomic context for each silent crop
        report_content += f"- **{crop}**: Would likely require specific adjustments — "
        if crop == "coconut":
            report_content += "high humidity (>80%), moderate to high rainfall (>200mm), coastal sandy soils (pH 5.5-7.0), warm temps (27-32°C)."
        elif crop == "coffee":
            report_content += "cool temperatures (15-28°C), high humidity (>70%), moderate rainfall (150-250mm), slightly acidic soil (pH 5.0-6.5), shade conditions."
        elif crop == "papaya":
            report_content += "warm temperatures (25-30°C), moderate humidity (60-80%), well-drained soil (pH 6.0-7.0), consistent rainfall (150-200mm)."
        elif crop == "mango":
            report_content += "warm temperatures (24-30°C), low to moderate humidity (30-60%), moderate rainfall (75-150mm), pH 5.5-7.5, dry season for flowering."
        elif crop == "apple":
            report_content += "cold temperatures (10-25°C), moderate humidity (60-75%), moderate rainfall (100-180mm), pH 6.0-7.0, chilling hours requirement."
        elif crop == "grapes":
            report_content += "warm temperatures (20-35°C), low humidity (30-50%), low to moderate rainfall (50-150mm), pH 6.5-8.0, well-drained soil."
        elif crop == "banana":
            report_content += "warm temperatures (25-35°C), high humidity (>75%), high rainfall (200-300mm), pH 5.5-7.0, rich organic soil."
        elif crop == "pomegranate":
            report_content += "warm to hot temperatures (25-38°C), low humidity (20-40%), low rainfall (25-100mm), pH 6.5-8.0, well-drained soil."
        elif crop == "muskmelon":
            report_content += "warm temperatures (25-35°C), moderate humidity (50-70%), moderate rainfall (80-150mm), pH 6.0-7.5, sandy loam soil."
        elif crop == "watermelon":
            report_content += "warm temperatures (25-35°C), moderate humidity (50-70%), moderate rainfall (80-150mm), pH 6.0-7.5, well-drained sandy soil."
        elif crop == "jute":
            report_content += "warm temperatures (25-35°C), high humidity (>80%), high rainfall (250-350mm), pH 5.5-7.0, fertile alluvial soil."
        else:
            report_content += "specific parameter combinations from its training distribution."
        report_content += "\n"
else:
    report_content += """
### Silent Crops
- (None — all 22 crop classes were predicted at least once, indicating the model can activate every class given appropriate inputs.)

### Analysis
The model successfully covers all 22 crop classes across the diverse scenarios tested. This suggests the RandomForest has learned decision boundaries that span the full feature space without leaving any crop entirely dormant.
"""

# Extreme scenario results
report_content += f"""
## Extreme Scenario Results

{extreme_results_table(results)}

**Analysis**: Extreme scenarios reveal how the model behaves outside normal agricultural ranges — whether it degrades gracefully (low confidence, plausible crop) or produces unexpected predictions.

"""

# Conclusion
report_content += f"""
## Conclusion

### Overall Assessment

The RandomForest model was stress-tested across **{total} scenarios** covering 7 agro-climatic zones, extreme boundary conditions, and random realistic mixes.

### Key Limitations Revealed

- **Silent classes**: {n_silent} out of {n_classes} crop classes were never predicted ({"none" if n_silent == 0 else f"{n_silent} silent classes — these crops may require specific conditions not frequently represented in the generated scenarios"}).
- **Confidence variability**: The model shows confidence ranging from {min_confidence*100:.1f}% to {max_confidence*100:.1f}%, with an average of {avg_confidence*100:.1f}%.
- **Extreme condition behavior**: Under extreme or unrealistic inputs, the model still produces a prediction — users should be aware that predictions outside typical agricultural ranges may not be agronomically valid.
- **Zone coverage**: The model responds differently across agro-climatic zones, which reflects the training data distribution.

### Recommendations

1. **Calibration**: Consider calibrating probabilities (e.g., Platt scaling or isotonic regression) to make confidence scores more reliable as uncertainty estimates.
2. **Agronomic validation layer**: Add a rule-based filter that flags predictions as \\"agronomically implausible\\" when inputs fall outside realistic ranges for the predicted crop.
3. **Training data expansion**: If certain crops are never predicted, consider augmenting the training data with more samples from those crops' optimal growing conditions.
4. **Confidence thresholding**: For production use, recommend setting a minimum confidence threshold (e.g., 40%) below which the system should suggest \\"uncertain — consult local expert.\\"
5. **Zone-specific tuning**: If regional deployment is planned, evaluate model performance separately for each agro-climatic zone.

---

## Full Scenario Data

```
{scenario_data_table(results)}
```
"""

# Write the report
os.makedirs(DOCS_DIR, exist_ok=True)
with open(REPORT_PATH, "w") as f:
    f.write(report_content)

print(f"\n✅ Report written to {REPORT_PATH}")
print(f"   File size: {os.path.getsize(REPORT_PATH)} bytes")