# Agronomic Validation Results — 25 Scenario ML Audit

**Model**: RandomForestClassifier (22 classes)  
**Source**: `backend/models/crop_model.pkl`  
**Date**: 2025  
**Auditor**: Automated Production Lockdown Audit

---

## Scenario Results Table

| # | Scenario | N | P | K | Temp | Rain | pH | Soil | Predicted Crop | Base Confidence | Top 3 | Plausible? |
|---|----------|---|---|---|------|------|----|------|---------------|-----------------|-------|-----------|
| 1 | Rice — Kerala/Alluvial/High rain | 80 | 40 | 30 | 28 | 2500 | 6.5 | alluvial | **RICE** | **58.0%** | rice(58.0%), banana(7.3%), coffee(6.1%) | ✅ |
| 2 | Rice — Punjab/Alluvial/Moderate | 60 | 30 | 30 | 22 | 500 | 7.0 | alluvial | **RICE** | **48.0%** | rice(48.0%), jute(13.0%), banana(5.9%) | ✅ |
| 3 | Rice — West Bengal/Clay/Wet | 40 | 20 | 20 | 26 | 1800 | 6.0 | clay | **RICE** | **48.0%** | rice(48.0%), papaya(10.0%), jute(8.0%) | ✅ |
| 4 | Wheat — Punjab/Loamy/Cool | 60 | 30 | 30 | 12 | 400 | 7.0 | loamy | **COFFEE** | **32.0%** | coffee(32.0%), rice(21.0%), jute(12.0%) | ❌ |
| 5 | Wheat — Haryana/Loamy/Mild | 50 | 25 | 25 | 15 | 300 | 7.5 | loamy | **COFFEE** | **31.0%** | coffee(31.0%), rice(22.0%), jute(11.0%) | ❌ |
| 6 | Arid — Rajasthan/Sandy/Dry | 10 | 10 | 10 | 35 | 200 | 8.0 | sandy | **KIDNEYBEANS** | **47.0%** | kidneybeans(47.0%), mothbeans(13.0%), orange(9.0%) | ⚠️ |
| 7 | Arid — Rajasthan/Sandy/Extreme | 5 | 5 | 5 | 40 | 100 | 8.5 | sandy | **MOTHBEANS** | **35.0%** | mothbeans(35.0%), kidneybeans(23.0%), orange(7.0%) | ⚠️ |
| 8 | Semi-arid — Gujarat/Black/Low | 20 | 15 | 10 | 30 | 400 | 7.5 | black | **MANGO** | **45.0%** | mango(45.0%), coffee(15.0%), coconut(8.0%) | ⚠️ |
| 9 | NE India/Red/Extreme Wet | 30 | 15 | 15 | 24 | 3500 | 5.5 | red | **COCONUT** | **36.0%** | coconut(36.0%), rice(17.0%), papaya(11.0%) | ✅ |
| 10 | Coastal/Clay/Humid | 40 | 30 | 20 | 28 | 2000 | 6.0 | clay | **RICE** | **37.0%** | rice(37.0%), papaya(19.0%), coconut(7.0%) | ✅ |
| 11 | Coffee — Karnataka/Red | 80 | 40 | 40 | 22 | 1200 | 6.0 | red | **RICE** | **75.0%** | rice(75.0%), jute(5.0%), banana(4.0%) | ❌ |
| 12 | High altitude — HP/Cold | 40 | 20 | 20 | 12 | 800 | 6.5 | loamy | **COFFEE** | **28.0%** | coffee(28.0%), rice(15.0%), jute(10.0%) | ❌ |
| 13 | Acidic soil/Laterite | 30 | 20 | 20 | 26 | 1500 | 4.5 | laterite | **COFFEE** | **37.0%** | coffee(37.0%), mango(8.0%), rice(8.0%) | ⚠️ |
| 14 | Alkaline soil/High pH | 40 | 30 | 30 | 28 | 600 | 8.5 | clay | **MANGO** | **42.0%** | mango(42.0%), apple(8.0%), coconut(7.0%) | ⚠️ |
| 15 | Extreme low NPK | 0 | 0 | 0 | 30 | 800 | 6.5 | sandy | **ORANGE** | **32.0%** | orange(32.0%), pigeonpeas(13.0%), mango(10.0%) | ❌ |
| 16 | Extreme high NPK | 200 | 200 | 200 | 25 | 500 | 7.0 | loamy | **APPLE** | **33.0%** | apple(33.0%), grapes(14.0%), banana(8.0%) | ❌ |
| 17 | High N only | 160 | 20 | 20 | 28 | 800 | 6.5 | loamy | **COFFEE** | **91.0%** | coffee(91.0%), rice(2.0%), jute(1.5%) | ⚠️ |
| 18 | High K only | 20 | 20 | 160 | 28 | 800 | 6.5 | loamy | **MANGO** | **20.0%** | mango(20.0%), apple(11.0%), grapes(10.0%) | ⚠️ |
| 19 | High P only | 20 | 160 | 20 | 28 | 800 | 6.5 | loamy | **PIGEONPEAS** | **26.0%** | pigeonpeas(26.0%), apple(16.0%), grapes(11.0%) | ⚠️ |
| 20 | Maize — UP/Alluvial | 60 | 30 | 30 | 25 | 700 | 7.0 | alluvial | **COFFEE** | **37.0%** | coffee(37.0%), jute(12.0%), rice(12.0%) | ❌ |
| 21 | Cotton — Maharashtra/Black/Dry | 40 | 30 | 30 | 32 | 400 | 7.5 | black | **COFFEE** | **48.0%** | coffee(48.0%), rice(10.0%), jute(9.0%) | ❌ |
| 22 | Moderate all-around | 50 | 50 | 50 | 25 | 800 | 7.0 | loamy | **COFFEE** | **72.0%** | coffee(72.0%), rice(5.0%), mango(3.0%) | ❌ |
| 23 | Moderate #2 | 60 | 40 | 30 | 28 | 900 | 6.5 | loamy | **COFFEE** | **59.0%** | coffee(59.0%), rice(7.0%), jute(5.0%) | ❌ |
| 24 | Tropical coastal/Sandy | 30 | 20 | 20 | 30 | 2000 | 6.0 | sandy | **COCONUT** | **24.0%** | coconut(24.0%), pomegranate(17.0%), papaya(14.0%) | ✅ |
| 25 | Kerala/Loamy/Wet | 40 | 30 | 30 | 28 | 2500 | 6.5 | loamy | **RICE** | **32.0%** | rice(32.0%), banana(11.0%), papaya(8.0%) | ⚠️ |

---

## Prediction Distribution

| Crop | Times Predicted | % of Total |
|------|----------------|------------|
| Coffee | 9 | 36% |
| Rice | 6 | 24% |
| Mango | 3 | 12% |
| Coconut | 2 | 8% |
| Kidneybeans | 1 | 4% |
| Mothbeans | 1 | 4% |
| Orange | 1 | 4% |
| Apple | 1 | 4% |
| Pigeonpeas | 1 | 4% |

## Never Predicted (13 of 22 classes = 59%)

- banana
- blackgram
- chickpea
- cotton
- grapes
- jute
- lentil
- maize
- mungbean
- muskmelon
- papaya
- pomegranate
- watermelon

## Missing Crops (Not in Model)

- wheat
- barley
- sugarcane
- groundnut
- sorghum
- millet
- tea
- rubber
- sunflower
- sesame

---

## Key Findings

1. **Coffee dominance (36%)** — Coffee is the default prediction when NPK values are moderate-to-high, regardless of temperature, rainfall, or soil type. This suggests a strong class imbalance in training data.

2. **Rice is reliable** — Rice is correctly predicted in 5/6 rice-appropriate scenarios. The 75% confidence for scenario 11 (Karnataka coffee region predicting rice) is anomalous — likely driven by the high N value (80).

3. **Arid predictions are sensible** — Kidneybeans (arid) and mothbeans (extreme arid) are drought-tolerant choices, consistent with the scenarios.

4. **59% dead classes** — 13 of 22 crop classes never appear as the top prediction in any realistic scenario. These crops exist in the model but the model never chooses them.

5. **NPK overfitting** — "High N only" produces 91% coffee confidence, suggesting the model has learned a strong N-to-coffee correlation rather than multi-factor agronomic logic.

6. **Missing major crops** — Wheat, barley, sugarcane, and groundnut are absent from the model. For Indian agriculture, this is a critical gap.

---

## Model Quality Assessment

| Metric | Value | Rating |
|--------|-------|--------|
| Plausible recommendations | ~11/25 (44%) | ⚠️ |
| Crops with agronomic sense | Rice, Coconut, Mothbeans (arid) | ✅ |
| Problematic predictions | Coffee in wheat/maize/cotton/cold regions (9/25) | ❌ |
| Model coverage | 9 of 22 classes actively used | ❌ |
| Missing major Indian crops | Wheat, Barley, Sugarcane, Groundnut | ❌ |
| Confidence reliability | Only 3/25 > 60%; 91% artifact | ⚠️ |
| Feature discrimination | Strong N bias; weak temp/rain/soil sensitivity | ❌ |

**Overall**: ⚠️ **MODERATE TO HIGH RISK**. Not suitable for production deployment without significant retraining and validation.