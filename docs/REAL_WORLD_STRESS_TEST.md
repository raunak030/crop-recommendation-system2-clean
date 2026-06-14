# Real-World Stress Test Report

## Executive Summary

- **Total scenarios tested**: 137
- **Average confidence**: 42.49%
- **Maximum confidence**: 88.00%
- **Minimum confidence**: 19.00%
- **Number of crops that appeared at least once**: 17 / 22 (77.3%)
- **Number of silent crops (never predicted)**: 5
- **Key finding**: Out of 22 crop classes, 5 were never predicted (23% silent). Average confidence is 42.5%. Most predicted crop is 'coffee' (28/137 = 20.4% of scenarios).

---

## Scenario Design

This stress test evaluates the trained RandomForest model across **7 agro-climatic zones** representing India's diverse agricultural regions, plus **extreme boundary conditions** and **random realistic mixes**.

### Zones Covered

- **Arid/Semi-Arid (Rajasthan/Gujarat)**: 15 scenarios
- **Coastal/Humid (Kerala/West Bengal)**: 15 scenarios
- **Cotton Belt (Gujarat/Maharashtra)**: 15 scenarios
- **Deccan Plateau (Dryland/Rainfed)**: 15 scenarios
- **Extreme: Acidic Soil pH 3.5**: 1 scenarios
- **Extreme: All High combined**: 1 scenarios
- **Extreme: All Low combined**: 1 scenarios
- **Extreme: All nutrients max**: 1 scenarios
- **Extreme: Desert (rain=0, arid high pH)**: 1 scenarios
- **Extreme: High Temp + Low Humidity**: 1 scenarios
- **Extreme: Mixed extremes high**: 1 scenarios
- **Extreme: Near Sterile conditions**: 1 scenarios
- **Extreme: Very High Humidity (100%)**: 1 scenarios
- **Extreme: Very High K**: 1 scenarios
- **Extreme: Very High N**: 1 scenarios
- **Extreme: Very High P**: 1 scenarios
- **Extreme: Very High Rainfall (400mm)**: 1 scenarios
- **Extreme: Very High Temp (50°C)**: 1 scenarios
- **Extreme: Very High pH (10.0)**: 1 scenarios
- **Extreme: Very Low Humidity (5%)**: 1 scenarios
- **Extreme: Very Low Temp (5°C)**: 1 scenarios
- **Extreme: Very Low pH (4.0)**: 1 scenarios
- **Extreme: Zero K only**: 1 scenarios
- **Extreme: Zero N only**: 1 scenarios
- **Extreme: Zero Nutrients**: 1 scenarios
- **Extreme: Zero P only**: 1 scenarios
- **Extreme: Zero Rainfall**: 1 scenarios
- **Horticulture Belt (Himachal/J&K)**: 15 scenarios
- **Random Mix: Alluvial plain (moderate everything)**: 1 scenarios
- **Random Mix: Black soil region (high pH, clay)**: 1 scenarios
- **Random Mix: Clay loam region (high K)**: 1 scenarios
- **Random Mix: Coastal alluvial (sandy, moderate)**: 1 scenarios
- **Random Mix: Forest clearing cultivation**: 1 scenarios
- **Random Mix: High-altitude farming (cool & dry)**: 1 scenarios
- **Random Mix: Intensive farming (high NPK)**: 1 scenarios
- **Random Mix: Inter-cropping mix scenario**: 1 scenarios
- **Random Mix: Irrigated command area (high input)**: 1 scenarios
- **Random Mix: Laterite soil zone (low pH, low NPK)**: 1 scenarios
- **Random Mix: Loamy soil (balanced)**: 1 scenarios
- **Random Mix: Mixed cropping (cereals+legumes)**: 1 scenarios
- **Random Mix: Monsoon transition zone**: 1 scenarios
- **Random Mix: Mountain terrace farming (cool, steep)**: 1 scenarios
- **Random Mix: Organic farming (low NPK)**: 1 scenarios
- **Random Mix: Plateau fringe (shallow soil)**: 1 scenarios
- **Random Mix: Rain-shadow region (low rainfall)**: 1 scenarios
- **Random Mix: Rainfed mix with moderate fertility**: 1 scenarios
- **Random Mix: River delta alluvial (high nutrients)**: 1 scenarios
- **Random Mix: Saline-alkaline zone (high pH)**: 1 scenarios
- **Random Mix: Sandy loam region (low retention)**: 1 scenarios
- **Random Mix: Subsistence farming (low input)**: 1 scenarios
- **Random Mix: Transition zone: humid to semi-arid**: 1 scenarios
- **Random Mix: Valley bottom (high moisture)**: 1 scenarios
- **Rice-Wheat Zone (Indo-Gangetic Plains)**: 15 scenarios

### Parameter Ranges per Zone

| Zone | N Range | P Range | K Range | Temp Range (°C) | Humidity Range (%) | Rainfall Range (mm) | pH Range |
|------|---------|---------|---------|----------------|--------------------|-------------------|----------|
| Rice-Wheat Zone (Indo-Gangetic Plains) | 60-140 | 40-80 | 30-60 | 18-30 | 60-85 | 150-300 | 6.0-7.5 |
| Cotton Belt (Gujarat/Maharashtra) | 40-100 | 30-60 | 20-50 | 28-38 | 40-65 | 80-200 | 6.5-8.0 |
| Coastal/Humid (Kerala/West Bengal) | 40-100 | 30-60 | 30-60 | 25-35 | 75-95 | 200-350 | 5.0-6.5 |
| Deccan Plateau (Dryland/Rainfed) | 10-50 | 10-40 | 10-30 | 30-40 | 25-50 | 30-100 | 7.0-8.5 |
| Horticulture Belt (Himachal/J&K) | 30-80 | 20-50 | 20-40 | 10-25 | 50-75 | 80-180 | 5.5-7.0 |
| Arid/Semi-Arid (Rajasthan/Gujarat) | 10-40 | 10-30 | 10-30 | 32-45 | 15-35 | 20-80 | 7.5-9.0 |

---

## Overall Results

### Full Prediction Distribution

| Crop | Count | Percentage |
|------|-------|------------|
| coffee | 28 | 20.4% |
| mothbeans | 16 | 11.7% |
| mango | 15 | 10.9% |
| rice | 13 | 9.5% |
| papaya | 10 | 7.3% |
| banana | 9 | 6.6% |
| pigeonpeas | 8 | 5.8% |
| chickpea | 8 | 5.8% |
| maize | 7 | 5.1% |
| jute | 5 | 3.6% |
| kidneybeans | 5 | 3.6% |
| muskmelon | 4 | 2.9% |
| coconut | 3 | 2.2% |
| orange | 2 | 1.5% |
| apple | 2 | 1.5% |
| watermelon | 1 | 0.7% |
| grapes | 1 | 0.7% |

### Top 5 Most Predicted Crops

| Rank | Crop | Count | Percentage |
|------|------|-------|------------|
| 1 | coffee | 28 | 20.4% |
| 2 | mothbeans | 16 | 11.7% |
| 3 | mango | 15 | 10.9% |
| 4 | rice | 13 | 9.5% |
| 5 | papaya | 10 | 7.3% |

**Analysis**: The top 5 crops (coffee, mothbeans, mango, rice, papaya) account for 82/137 = 59.9% of all predictions.

### Crops Never Predicted (Silent Classes)

**5 silent class(es):**
- **blackgram**
- **cotton**
- **lentil**
- **mungbean**
- **pomegranate**

---

## Confidence Analysis

### Summary Statistics
- **Average confidence**: 42.49%
- **Median confidence**: 39.00%
- **Maximum confidence**: 88.00%
- **Minimum confidence**: 19.00%

### Confidence Histogram (ASCII Bar Chart)

```
     0-10% |                                        |   0 (  0.0%)
    10-20% |██                                      |   3 (  2.2%)
    20-30% |████████████████████                    |  22 ( 16.1%)
    30-40% |████████████████████████████████████████|  44 ( 32.1%)
    40-50% |█████████████████████████████           |  32 ( 23.4%)
    50-60% |███████████                             |  13 (  9.5%)
    60-70% |████████████                            |  14 ( 10.2%)
    70-80% |█████                                   |   6 (  4.4%)
    80-90% |██                                      |   3 (  2.2%)
   90-100% |                                        |   0 (  0.0%)
      100% |                                        |   0 (  0.0%)
```

### Confidence Distribution Table

| Bucket | Count | Percentage |
|--------|-------|------------|
| 0-10% | 0 | 0.0% |
| 10-20% | 3 | 2.2% |
| 20-30% | 22 | 16.1% |
| 30-40% | 44 | 32.1% |
| 40-50% | 32 | 23.4% |
| 50-60% | 13 | 9.5% |
| 60-70% | 14 | 10.2% |
| 70-80% | 6 | 4.4% |
| 80-90% | 3 | 2.2% |
| 90-100% | 0 | 0.0% |
| 100% | 0 | 0.0% |

**Analysis**: 
- The 42.5% average confidence suggests the model is **often uncertain, indicating potential feature space gaps**.
- A distribution concentrated in the 90-100% bucket would indicate high certainty across diverse inputs.
- If significant mass appears in lower buckets (0-60%), the model expresses uncertainty for many real-world scenarios.
- Extreme conditions naturally produce lower confidence, which is a healthy behavior.


## Silent Class Analysis

**5 crop(s) never predicted across 137 scenarios**

### Silent Crops
- **blackgram**
- **cotton**
- **lentil**
- **mungbean**
- **pomegranate**

### Why They Might Be Silent

Silent classes can result from:
1. **Feature space overlap**: The crop's optimal growing conditions overlap significantly with other crops, and the model consistently prefers the other crop.
2. **Training data limitations**: The original dataset may have underrepresented the specific parameter combinations needed for this crop.
3. **Niche ecological requirements**: Some crops require very specific conditions that conventional farming scenarios rarely match.
4. **Model bias**: The RandomForest may develop preference for classes with more distinct decision boundaries.

### Conditions That Might Activate Them
- **blackgram**: Would likely require specific adjustments — specific parameter combinations from its training distribution.
- **cotton**: Would likely require specific adjustments — specific parameter combinations from its training distribution.
- **lentil**: Would likely require specific adjustments — specific parameter combinations from its training distribution.
- **mungbean**: Would likely require specific adjustments — specific parameter combinations from its training distribution.
- **pomegranate**: Would likely require specific adjustments — warm to hot temperatures (25-38°C), low humidity (20-40%), low rainfall (25-100mm), pH 6.5-8.0, well-drained soil.

## Extreme Scenario Results

| Scenario | N | P | K | Temp | Humidity | pH | Rainfall | Predicted Crop | Confidence |
|----------|---|---|---|------|----------|----|---------|----------------|------------|
| Extreme: Zero Nutrients | 0 | 0 | 0 | 25 | 60 | 7.0 | 150 | orange | 0.3100 |
| Extreme: Zero N only | 0 | 60 | 40 | 25 | 60 | 7.0 | 200 | pigeonpeas | 0.3600 |
| Extreme: Zero P only | 90 | 0 | 40 | 25 | 60 | 7.0 | 200 | coffee | 0.6800 |
| Extreme: Zero K only | 90 | 60 | 0 | 25 | 60 | 7.0 | 200 | maize | 0.4200 |
| Extreme: Very High N | 200 | 80 | 60 | 25 | 60 | 7.0 | 200 | coffee | 0.2800 |
| Extreme: Very High P | 140 | 200 | 60 | 25 | 60 | 7.0 | 200 | jute | 0.1900 |
| Extreme: Very High K | 140 | 80 | 200 | 25 | 60 | 7.0 | 200 | coffee | 0.1900 |
| Extreme: All nutrients max | 200 | 200 | 200 | 25 | 60 | 7.0 | 200 | apple | 0.3300 |
| Extreme: Very High Temp (50°C) | 60 | 40 | 30 | 50 | 30 | 7.0 | 100 | coffee | 0.3800 |
| Extreme: Very Low Temp (5°C) | 60 | 40 | 30 | 5 | 70 | 7.0 | 100 | maize | 0.4000 |
| Extreme: High Temp + Low Humidity | 60 | 40 | 30 | 48 | 10 | 7.0 | 50 | coffee | 0.2200 |
| Extreme: Very Low Humidity (5%) | 60 | 40 | 30 | 28 | 5 | 7.0 | 150 | coffee | 0.5300 |
| Extreme: Very High Humidity (100%) | 60 | 40 | 30 | 28 | 100 | 7.0 | 250 | papaya | 0.3900 |
| Extreme: Zero Rainfall | 60 | 40 | 30 | 28 | 65 | 7.0 | 0 | muskmelon | 0.4500 |
| Extreme: Very High Rainfall (400mm) | 60 | 40 | 30 | 28 | 95 | 7.0 | 400 | papaya | 0.3900 |
| Extreme: Desert (rain=0, arid high pH) | 40 | 20 | 20 | 40 | 20 | 8.5 | 0 | muskmelon | 0.3200 |
| Extreme: Very High pH (10.0) | 60 | 40 | 30 | 28 | 60 | 10.0 | 150 | coffee | 0.7300 |
| Extreme: Very Low pH (4.0) | 60 | 40 | 30 | 28 | 60 | 4.0 | 200 | coffee | 0.6200 |
| Extreme: Acidic Soil pH 3.5 | 50 | 30 | 25 | 35 | 80 | 3.5 | 300 | coconut | 0.4800 |
| Extreme: All High combined | 200 | 200 | 200 | 45 | 90 | 8.5 | 350 | apple | 0.5200 |
| Extreme: All Low combined | 0 | 0 | 0 | 10 | 15 | 4.5 | 10 | muskmelon | 0.3000 |
| Extreme: Mixed extremes high | 150 | 120 | 100 | 42 | 85 | 9.5 | 380 | banana | 0.3000 |
| Extreme: Near Sterile conditions | 5 | 5 | 5 | 8 | 10 | 4.0 | 5 | muskmelon | 0.3000 |

**Analysis**: Extreme scenarios reveal how the model behaves outside normal agricultural ranges — whether it degrades gracefully (low confidence, plausible crop) or produces unexpected predictions.


## Conclusion

### Overall Assessment

The RandomForest model was stress-tested across **137 scenarios** covering 7 agro-climatic zones, extreme boundary conditions, and random realistic mixes.

### Key Limitations Revealed

- **Silent classes**: 5 out of 22 crop classes were never predicted (5 silent classes — these crops may require specific conditions not frequently represented in the generated scenarios).
- **Confidence variability**: The model shows confidence ranging from 19.0% to 88.0%, with an average of 42.5%.
- **Extreme condition behavior**: Under extreme or unrealistic inputs, the model still produces a prediction — users should be aware that predictions outside typical agricultural ranges may not be agronomically valid.
- **Zone coverage**: The model responds differently across agro-climatic zones, which reflects the training data distribution.

### Recommendations

1. **Calibration**: Consider calibrating probabilities (e.g., Platt scaling or isotonic regression) to make confidence scores more reliable as uncertainty estimates.
2. **Agronomic validation layer**: Add a rule-based filter that flags predictions as \"agronomically implausible\" when inputs fall outside realistic ranges for the predicted crop.
3. **Training data expansion**: If certain crops are never predicted, consider augmenting the training data with more samples from those crops' optimal growing conditions.
4. **Confidence thresholding**: For production use, recommend setting a minimum confidence threshold (e.g., 40%) below which the system should suggest \"uncertain — consult local expert.\"
5. **Zone-specific tuning**: If regional deployment is planned, evaluate model performance separately for each agro-climatic zone.

---

## Full Scenario Data

```
| # | Zone | N | P | K | Temp | Humidity | pH | Rainfall | Predicted Crop | Confidence |
|---|------|---|---|---|------|----------|----|----------|----------------|------------|
| 1 | Rice-Wheat Zone (Indo-Gangetic | 101.3 | 62.8 | 30.9 | 20.06 | 77.13 | 7.25 | 196.04 | jute | 0.3900 |
| 2 | Rice-Wheat Zone (Indo-Gangetic | 64.0 | 68.9 | 35.7 | 24.65 | 68.8 | 6.27 | 267.84 | jute | 0.3000 |
| 3 | Rice-Wheat Zone (Indo-Gangetic | 136.0 | 63.3 | 53.2 | 29.73 | 75.29 | 7.42 | 214.93 | banana | 0.2600 |
| 4 | Rice-Wheat Zone (Indo-Gangetic | 96.5 | 73.1 | 34.4 | 25.23 | 74.78 | 6.66 | 223.8 | rice | 0.3100 |
| 5 | Rice-Wheat Zone (Indo-Gangetic | 118.5 | 73.1 | 31.5 | 20.7 | 76.99 | 7.07 | 248.07 | rice | 0.3300 |
| 6 | Rice-Wheat Zone (Indo-Gangetic | 126.4 | 61.5 | 57.7 | 29.4 | 62.57 | 7.05 | 283.57 | coffee | 0.3200 |
| 7 | Rice-Wheat Zone (Indo-Gangetic | 65.2 | 75.0 | 36.3 | 18.11 | 71.01 | 6.93 | 231.71 | rice | 0.3600 |
| 8 | Rice-Wheat Zone (Indo-Gangetic | 93.3 | 69.2 | 31.5 | 28.72 | 65.93 | 6.09 | 254.1 | coffee | 0.4700 |
| 9 | Rice-Wheat Zone (Indo-Gangetic | 136.0 | 57.7 | 56.3 | 29.39 | 71.95 | 6.69 | 245.59 | jute | 0.2800 |
| 10 | Rice-Wheat Zone (Indo-Gangetic | 121.8 | 60.4 | 49.0 | 25.45 | 83.67 | 7.18 | 201.66 | rice | 0.4000 |
| 11 | Rice-Wheat Zone (Indo-Gangetic | 138.7 | 49.6 | 31.5 | 24.89 | 66.91 | 6.6 | 176.88 | coffee | 0.7400 |
| 12 | Rice-Wheat Zone (Indo-Gangetic | 115.0 | 67.8 | 44.9 | 29.7 | 65.09 | 6.45 | 292.5 | coffee | 0.3300 |
| 13 | Rice-Wheat Zone (Indo-Gangetic | 89.1 | 71.0 | 59.0 | 22.85 | 66.94 | 6.62 | 213.67 | banana | 0.2500 |
| 14 | Rice-Wheat Zone (Indo-Gangetic | 64.0 | 67.9 | 40.2 | 27.8 | 62.75 | 6.38 | 198.1 | coffee | 0.3600 |
| 15 | Rice-Wheat Zone (Indo-Gangetic | 79.2 | 78.8 | 38.7 | 19.77 | 83.75 | 7.42 | 202.72 | rice | 0.6100 |
| 16 | Cotton Belt (Gujarat/Maharasht | 53.5 | 37.9 | 49.3 | 37.93 | 64.87 | 7.36 | 151.95 | mango | 0.2900 |
| 17 | Cotton Belt (Gujarat/Maharasht | 46.9 | 54.3 | 27.0 | 28.5 | 53.82 | 7.16 | 90.44 | mango | 0.4400 |
| 18 | Cotton Belt (Gujarat/Maharasht | 46.6 | 58.5 | 46.7 | 32.92 | 58.05 | 7.48 | 192.1 | pigeonpeas | 0.3600 |
| 19 | Cotton Belt (Gujarat/Maharasht | 65.9 | 52.6 | 33.9 | 30.83 | 62.06 | 7.02 | 190.09 | coffee | 0.5400 |
| 20 | Cotton Belt (Gujarat/Maharasht | 88.4 | 41.6 | 21.5 | 29.77 | 40.7 | 6.56 | 118.83 | coffee | 0.3800 |
| 21 | Cotton Belt (Gujarat/Maharasht | 85.0 | 50.6 | 48.5 | 34.43 | 46.63 | 6.79 | 179.54 | coffee | 0.4600 |
| 22 | Cotton Belt (Gujarat/Maharasht | 87.5 | 49.9 | 46.6 | 36.32 | 62.63 | 7.33 | 107.75 | coffee | 0.2700 |
| 23 | Cotton Belt (Gujarat/Maharasht | 96.7 | 38.3 | 21.5 | 30.78 | 61.86 | 6.93 | 86.93 | maize | 0.5500 |
| 24 | Cotton Belt (Gujarat/Maharasht | 79.8 | 58.5 | 39.2 | 30.8 | 58.99 | 7.86 | 119.87 | coffee | 0.4500 |
| 25 | Cotton Belt (Gujarat/Maharasht | 73.2 | 57.5 | 28.3 | 30.78 | 51.24 | 6.72 | 101.43 | coffee | 0.2800 |
| 26 | Cotton Belt (Gujarat/Maharasht | 95.0 | 36.2 | 43.0 | 29.74 | 58.43 | 6.69 | 86.0 | coffee | 0.3900 |
| 27 | Cotton Belt (Gujarat/Maharasht | 66.4 | 58.5 | 34.6 | 30.46 | 63.22 | 7.61 | 198.62 | coffee | 0.4000 |
| 28 | Cotton Belt (Gujarat/Maharasht | 78.8 | 55.0 | 21.9 | 35.48 | 41.2 | 6.65 | 180.51 | coffee | 0.3500 |
| 29 | Cotton Belt (Gujarat/Maharasht | 68.4 | 40.1 | 42.8 | 34.24 | 53.56 | 6.58 | 109.4 | coffee | 0.4200 |
| 30 | Cotton Belt (Gujarat/Maharasht | 56.0 | 43.2 | 46.6 | 37.5 | 46.15 | 7.12 | 127.54 | mango | 0.2900 |
| 31 | Coastal/Humid (Kerala/West Ben | 85.0 | 38.4 | 46.5 | 33.11 | 87.42 | 5.65 | 228.05 | rice | 0.3700 |
| 32 | Coastal/Humid (Kerala/West Ben | 61.6 | 31.5 | 47.6 | 31.55 | 77.91 | 5.15 | 283.01 | rice | 0.1900 |
| 33 | Coastal/Humid (Kerala/West Ben | 63.3 | 56.5 | 34.1 | 34.5 | 89.69 | 6.31 | 302.48 | rice | 0.3000 |
| 34 | Coastal/Humid (Kerala/West Ben | 41.8 | 46.2 | 60.0 | 25.11 | 94.04 | 5.1 | 261.04 | papaya | 0.6300 |
| 35 | Coastal/Humid (Kerala/West Ben | 70.7 | 39.3 | 50.0 | 25.5 | 79.29 | 5.11 | 263.12 | rice | 0.5600 |
| 36 | Coastal/Humid (Kerala/West Ben | 52.4 | 39.1 | 51.3 | 34.38 | 93.16 | 6.49 | 342.5 | papaya | 0.7900 |
| 37 | Coastal/Humid (Kerala/West Ben | 89.2 | 57.9 | 54.6 | 27.7 | 91.45 | 6.35 | 221.34 | papaya | 0.5600 |
| 38 | Coastal/Humid (Kerala/West Ben | 95.3 | 35.6 | 51.4 | 25.86 | 89.06 | 5.08 | 321.63 | rice | 0.5600 |
| 39 | Coastal/Humid (Kerala/West Ben | 88.2 | 50.7 | 56.4 | 25.68 | 94.0 | 5.97 | 201.0 | papaya | 0.4500 |
| 40 | Coastal/Humid (Kerala/West Ben | 77.4 | 54.3 | 45.2 | 26.5 | 76.39 | 5.97 | 269.31 | rice | 0.6600 |
| 41 | Coastal/Humid (Kerala/West Ben | 53.3 | 42.4 | 31.5 | 33.45 | 89.37 | 6.08 | 309.81 | papaya | 0.2200 |
| 42 | Coastal/Humid (Kerala/West Ben | 57.3 | 34.2 | 53.1 | 33.79 | 92.14 | 5.73 | 342.5 | coconut | 0.4000 |
| 43 | Coastal/Humid (Kerala/West Ben | 58.9 | 30.8 | 39.5 | 31.52 | 94.2 | 5.09 | 276.63 | coconut | 0.6000 |
| 44 | Coastal/Humid (Kerala/West Ben | 43.0 | 36.9 | 58.9 | 32.64 | 88.28 | 5.94 | 231.73 | papaya | 0.2700 |
| 45 | Coastal/Humid (Kerala/West Ben | 66.8 | 32.3 | 55.3 | 34.5 | 85.82 | 5.32 | 250.08 | rice | 0.2400 |
| 46 | Deccan Plateau (Dryland/Rainfe | 36.8 | 20.5 | 27.9 | 32.78 | 26.31 | 8.38 | 63.05 | mango | 0.3500 |
| 47 | Deccan Plateau (Dryland/Rainfe | 10.2 | 24.6 | 11.0 | 37.7 | 33.67 | 7.54 | 80.91 | mango | 0.2900 |
| 48 | Deccan Plateau (Dryland/Rainfe | 35.3 | 35.4 | 25.9 | 30.99 | 48.75 | 7.46 | 63.34 | mango | 0.5300 |
| 49 | Deccan Plateau (Dryland/Rainfe | 44.7 | 32.2 | 17.1 | 32.96 | 25.63 | 7.24 | 87.34 | kidneybeans | 0.4400 |
| 50 | Deccan Plateau (Dryland/Rainfe | 16.1 | 31.8 | 10.2 | 30.5 | 30.73 | 8.48 | 70.71 | mothbeans | 0.5700 |
| 51 | Deccan Plateau (Dryland/Rainfe | 16.4 | 38.5 | 19.8 | 31.15 | 45.18 | 7.35 | 78.69 | mothbeans | 0.6900 |
| 52 | Deccan Plateau (Dryland/Rainfe | 21.7 | 37.2 | 29.2 | 33.36 | 36.66 | 8.08 | 81.79 | mango | 0.6200 |
| 53 | Deccan Plateau (Dryland/Rainfe | 37.7 | 20.5 | 11.0 | 36.06 | 26.25 | 8.5 | 43.15 | mothbeans | 0.3500 |
| 54 | Deccan Plateau (Dryland/Rainfe | 24.6 | 38.5 | 23.9 | 33.79 | 37.57 | 7.88 | 63.48 | mothbeans | 0.7700 |
| 55 | Deccan Plateau (Dryland/Rainfe | 30.1 | 13.1 | 13.0 | 33.1 | 27.23 | 8.27 | 78.92 | kidneybeans | 0.4100 |
| 56 | Deccan Plateau (Dryland/Rainfe | 12.0 | 28.4 | 20.9 | 37.64 | 30.29 | 8.45 | 89.16 | mango | 0.4700 |
| 57 | Deccan Plateau (Dryland/Rainfe | 25.8 | 21.3 | 20.2 | 39.11 | 48.75 | 7.01 | 50.58 | mothbeans | 0.6400 |
| 58 | Deccan Plateau (Dryland/Rainfe | 33.9 | 24.3 | 14.4 | 33.68 | 37.35 | 7.06 | 66.19 | mothbeans | 0.3700 |
| 59 | Deccan Plateau (Dryland/Rainfe | 12.0 | 10.3 | 17.0 | 35.26 | 36.69 | 7.47 | 70.74 | mothbeans | 0.5200 |
| 60 | Deccan Plateau (Dryland/Rainfe | 36.4 | 11.9 | 27.5 | 37.43 | 45.28 | 7.98 | 96.5 | mango | 0.8000 |
| 61 | Horticulture Belt (Himachal/J& | 72.5 | 28.8 | 24.5 | 12.97 | 59.45 | 5.71 | 81.08 | maize | 0.6400 |
| 62 | Horticulture Belt (Himachal/J& | 34.1 | 48.8 | 34.4 | 10.97 | 70.49 | 5.58 | 137.55 | pigeonpeas | 0.3100 |
| 63 | Horticulture Belt (Himachal/J& | 31.4 | 42.0 | 21.6 | 13.88 | 55.02 | 6.1 | 175.0 | pigeonpeas | 0.7300 |
| 64 | Horticulture Belt (Himachal/J& | 30.8 | 28.2 | 38.2 | 13.1 | 58.3 | 6.86 | 151.03 | mango | 0.2700 |
| 65 | Horticulture Belt (Himachal/J& | 32.5 | 37.0 | 28.2 | 12.4 | 52.93 | 5.78 | 111.21 | mango | 0.4500 |
| 66 | Horticulture Belt (Himachal/J& | 74.6 | 46.5 | 39.0 | 24.06 | 64.24 | 6.5 | 150.29 | coffee | 0.4600 |
| 67 | Horticulture Belt (Himachal/J& | 51.4 | 35.2 | 39.1 | 15.01 | 72.19 | 5.52 | 121.4 | mango | 0.2100 |
| 68 | Horticulture Belt (Himachal/J& | 42.3 | 28.6 | 24.6 | 23.77 | 68.58 | 5.58 | 167.12 | pigeonpeas | 0.3200 |
| 69 | Horticulture Belt (Himachal/J& | 68.9 | 28.8 | 30.4 | 24.71 | 73.75 | 5.57 | 162.39 | coffee | 0.4200 |
| 70 | Horticulture Belt (Himachal/J& | 69.3 | 29.5 | 20.8 | 21.29 | 52.78 | 5.99 | 92.24 | maize | 0.6500 |
| 71 | Horticulture Belt (Himachal/J& | 32.5 | 40.1 | 23.8 | 14.42 | 61.39 | 5.64 | 114.89 | pigeonpeas | 0.5100 |
| 72 | Horticulture Belt (Himachal/J& | 77.5 | 38.2 | 31.1 | 16.14 | 58.1 | 5.62 | 87.49 | maize | 0.4200 |
| 73 | Horticulture Belt (Himachal/J& | 73.5 | 42.7 | 26.0 | 14.35 | 51.48 | 6.39 | 87.89 | maize | 0.4700 |
| 74 | Horticulture Belt (Himachal/J& | 32.9 | 27.2 | 25.2 | 10.16 | 69.71 | 5.58 | 148.37 | pigeonpeas | 0.3500 |
| 75 | Horticulture Belt (Himachal/J& | 77.5 | 27.3 | 27.0 | 24.41 | 60.99 | 5.75 | 136.72 | coffee | 0.8800 |
| 76 | Arid/Semi-Arid (Rajasthan/Guja | 17.2 | 25.4 | 21.2 | 38.94 | 31.79 | 8.51 | 78.51 | mothbeans | 0.4800 |
| 77 | Arid/Semi-Arid (Rajasthan/Guja | 36.0 | 10.3 | 11.0 | 41.58 | 23.99 | 8.3 | 32.91 | mothbeans | 0.3500 |
| 78 | Arid/Semi-Arid (Rajasthan/Guja | 35.7 | 29.0 | 26.2 | 38.64 | 24.54 | 8.89 | 34.68 | mothbeans | 0.3100 |
| 79 | Arid/Semi-Arid (Rajasthan/Guja | 38.5 | 29.2 | 17.3 | 38.71 | 18.69 | 8.71 | 47.96 | mothbeans | 0.4200 |
| 80 | Arid/Semi-Arid (Rajasthan/Guja | 22.4 | 11.0 | 18.0 | 38.82 | 21.63 | 8.1 | 58.35 | mothbeans | 0.4000 |
| 81 | Arid/Semi-Arid (Rajasthan/Guja | 13.6 | 28.9 | 10.3 | 41.08 | 23.54 | 8.68 | 77.0 | kidneybeans | 0.4100 |
| 82 | Arid/Semi-Arid (Rajasthan/Guja | 35.8 | 14.2 | 25.9 | 39.23 | 19.83 | 7.72 | 64.52 | mango | 0.3500 |
| 83 | Arid/Semi-Arid (Rajasthan/Guja | 39.7 | 13.4 | 11.0 | 32.61 | 27.09 | 8.92 | 58.26 | mothbeans | 0.3100 |
| 84 | Arid/Semi-Arid (Rajasthan/Guja | 35.5 | 27.0 | 29.0 | 43.67 | 21.53 | 7.95 | 70.24 | mango | 0.3500 |
| 85 | Arid/Semi-Arid (Rajasthan/Guja | 11.4 | 25.3 | 17.4 | 43.29 | 18.78 | 8.27 | 66.08 | kidneybeans | 0.4400 |
| 86 | Arid/Semi-Arid (Rajasthan/Guja | 11.5 | 28.0 | 19.2 | 39.69 | 25.6 | 7.63 | 78.74 | kidneybeans | 0.4500 |
| 87 | Arid/Semi-Arid (Rajasthan/Guja | 15.4 | 19.0 | 15.5 | 38.97 | 34.0 | 7.97 | 66.16 | mothbeans | 0.5800 |
| 88 | Arid/Semi-Arid (Rajasthan/Guja | 36.5 | 19.4 | 20.3 | 33.8 | 22.93 | 8.93 | 46.28 | mothbeans | 0.4300 |
| 89 | Arid/Semi-Arid (Rajasthan/Guja | 35.9 | 11.0 | 28.7 | 38.15 | 24.15 | 8.71 | 76.57 | mango | 0.3600 |
| 90 | Arid/Semi-Arid (Rajasthan/Guja | 27.3 | 29.0 | 18.8 | 42.41 | 22.03 | 8.81 | 52.22 | mothbeans | 0.4300 |
| 91 | Extreme: Zero Nutrients | 0 | 0 | 0 | 25 | 60 | 7.0 | 150 | orange | 0.3100 |
| 92 | Extreme: Zero N only | 0 | 60 | 40 | 25 | 60 | 7.0 | 200 | pigeonpeas | 0.3600 |
| 93 | Extreme: Zero P only | 90 | 0 | 40 | 25 | 60 | 7.0 | 200 | coffee | 0.6800 |
| 94 | Extreme: Zero K only | 90 | 60 | 0 | 25 | 60 | 7.0 | 200 | maize | 0.4200 |
| 95 | Extreme: Very High N | 200 | 80 | 60 | 25 | 60 | 7.0 | 200 | coffee | 0.2800 |
| 96 | Extreme: Very High P | 140 | 200 | 60 | 25 | 60 | 7.0 | 200 | jute | 0.1900 |
| 97 | Extreme: Very High K | 140 | 80 | 200 | 25 | 60 | 7.0 | 200 | coffee | 0.1900 |
| 98 | Extreme: All nutrients max | 200 | 200 | 200 | 25 | 60 | 7.0 | 200 | apple | 0.3300 |
| 99 | Extreme: Very High Temp (50°C) | 60 | 40 | 30 | 50 | 30 | 7.0 | 100 | coffee | 0.3800 |
| 100 | Extreme: Very Low Temp (5°C) | 60 | 40 | 30 | 5 | 70 | 7.0 | 100 | maize | 0.4000 |
| 101 | Extreme: High Temp + Low Humid | 60 | 40 | 30 | 48 | 10 | 7.0 | 50 | coffee | 0.2200 |
| 102 | Extreme: Very Low Humidity (5% | 60 | 40 | 30 | 28 | 5 | 7.0 | 150 | coffee | 0.5300 |
| 103 | Extreme: Very High Humidity (1 | 60 | 40 | 30 | 28 | 100 | 7.0 | 250 | papaya | 0.3900 |
| 104 | Extreme: Zero Rainfall | 60 | 40 | 30 | 28 | 65 | 7.0 | 0 | muskmelon | 0.4500 |
| 105 | Extreme: Very High Rainfall (4 | 60 | 40 | 30 | 28 | 95 | 7.0 | 400 | papaya | 0.3900 |
| 106 | Extreme: Desert (rain=0, arid  | 40 | 20 | 20 | 40 | 20 | 8.5 | 0 | muskmelon | 0.3200 |
| 107 | Extreme: Very High pH (10.0) | 60 | 40 | 30 | 28 | 60 | 10.0 | 150 | coffee | 0.7300 |
| 108 | Extreme: Very Low pH (4.0) | 60 | 40 | 30 | 28 | 60 | 4.0 | 200 | coffee | 0.6200 |
| 109 | Extreme: Acidic Soil pH 3.5 | 50 | 30 | 25 | 35 | 80 | 3.5 | 300 | coconut | 0.4800 |
| 110 | Extreme: All High combined | 200 | 200 | 200 | 45 | 90 | 8.5 | 350 | apple | 0.5200 |
| 111 | Extreme: All Low combined | 0 | 0 | 0 | 10 | 15 | 4.5 | 10 | muskmelon | 0.3000 |
| 112 | Extreme: Mixed extremes high | 150 | 120 | 100 | 42 | 85 | 9.5 | 380 | banana | 0.3000 |
| 113 | Extreme: Near Sterile conditio | 5 | 5 | 5 | 8 | 10 | 4.0 | 5 | muskmelon | 0.3000 |
| 114 | Random Mix: Rainfed mix with m | 37.9 | 51.4 | 19.7 | 30.19 | 44.4 | 5.85 | 333.7 | pigeonpeas | 0.8600 |
| 115 | Random Mix: Transition zone: h | 133.7 | 24.5 | 86.8 | 16.25 | 84.82 | 7.29 | 151.64 | watermelon | 0.2300 |
| 116 | Random Mix: High-altitude farm | 27.5 | 106.2 | 77.9 | 20.05 | 41.77 | 6.43 | 124.35 | chickpea | 0.3800 |
| 117 | Random Mix: River delta alluvi | 119.3 | 104.0 | 68.0 | 39.37 | 43.72 | 7.4 | 94.34 | banana | 0.3100 |
| 118 | Random Mix: Black soil region  | 29.8 | 17.4 | 83.4 | 39.03 | 92.43 | 7.76 | 133.74 | papaya | 0.3200 |
| 119 | Random Mix: Laterite soil zone | 67.3 | 35.3 | 93.4 | 20.3 | 83.72 | 5.87 | 172.9 | rice | 0.5200 |
| 120 | Random Mix: Alluvial plain (mo | 48.0 | 79.4 | 70.8 | 19.54 | 58.36 | 5.47 | 135.0 | chickpea | 0.3300 |
| 121 | Random Mix: Mountain terrace f | 114.3 | 78.8 | 41.0 | 39.41 | 26.01 | 6.94 | 103.47 | banana | 0.2600 |
| 122 | Random Mix: Coastal alluvial ( | 101.2 | 43.9 | 65.2 | 10.31 | 54.7 | 7.02 | 287.89 | coffee | 0.2700 |
| 123 | Random Mix: Forest clearing cu | 123.3 | 56.9 | 73.9 | 17.89 | 36.21 | 5.37 | 107.19 | chickpea | 0.3300 |
| 124 | Random Mix: Irrigated command  | 158.8 | 99.4 | 68.6 | 41.99 | 75.93 | 6.38 | 183.91 | banana | 0.6100 |
| 125 | Random Mix: Rain-shadow region | 153.6 | 17.2 | 94.4 | 33.83 | 24.78 | 5.05 | 32.27 | chickpea | 0.3200 |
| 126 | Random Mix: Monsoon transition | 63.2 | 77.7 | 69.8 | 14.94 | 53.02 | 5.77 | 244.61 | chickpea | 0.2500 |
| 127 | Random Mix: Plateau fringe (sh | 104.9 | 108.3 | 63.0 | 41.03 | 29.26 | 6.08 | 70.51 | grapes | 0.3000 |
| 128 | Random Mix: Valley bottom (hig | 56.6 | 103.8 | 67.3 | 19.8 | 24.32 | 5.04 | 166.83 | chickpea | 0.6200 |
| 129 | Random Mix: Sandy loam region  | 40.9 | 71.6 | 41.0 | 35.69 | 78.15 | 5.47 | 286.38 | papaya | 0.2800 |
| 130 | Random Mix: Loamy soil (balanc | 118.2 | 53.7 | 93.3 | 27.13 | 71.5 | 6.3 | 237.71 | jute | 0.2400 |
| 131 | Random Mix: Clay loam region ( | 56.8 | 76.3 | 67.8 | 21.49 | 19.67 | 6.72 | 297.53 | chickpea | 0.7700 |
| 132 | Random Mix: Saline-alkaline zo | 89.7 | 86.5 | 52.6 | 15.08 | 86.95 | 6.12 | 344.86 | banana | 0.4900 |
| 133 | Random Mix: Inter-cropping mix | 128.4 | 97.0 | 58.7 | 29.02 | 38.04 | 6.69 | 119.38 | banana | 0.4200 |
| 134 | Random Mix: Mixed cropping (ce | 112.6 | 11.6 | 69.2 | 23.2 | 19.62 | 6.97 | 287.71 | chickpea | 0.4200 |
| 135 | Random Mix: Organic farming (l | 96.3 | 34.5 | 50.3 | 14.65 | 71.88 | 6.88 | 134.94 | coffee | 0.2700 |
| 136 | Random Mix: Intensive farming  | 99.0 | 99.5 | 50.0 | 33.27 | 77.31 | 5.43 | 334.67 | banana | 0.6400 |
| 137 | Random Mix: Subsistence farmin | 33.5 | 14.8 | 8.1 | 36.47 | 62.52 | 8.43 | 264.06 | orange | 0.3200 |
```
