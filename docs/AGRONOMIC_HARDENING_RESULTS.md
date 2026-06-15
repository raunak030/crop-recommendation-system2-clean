# Smart Crop Engine v1.5 — Agronomic Hardening Results

**Date:** June 2025
**Scope:** Fix three ranking issues in `compute_top_crops()`: (A) Coffee dominating unsuitable regions, (B) 0% probability crops in top-5, (C) No probability guardrail.

**Modifications:** `backend/src/rule_engine.py` — `compute_top_crops()` only
- **Fix 1:** Blended ranking score = `0.5 × model_probability + 0.5 × (suitability_score / 100.0)`
- **Fix 2:** Probability floor — crops with `model_probability < 0.01` (1%) are excluded; guard retains top-1 if all below threshold

**Model:** RandomForest (22 classes)
**Scenarios tested:** 10 regional Indian farming scenarios

---

## Acceptance Criteria Verification

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Coffee not dominating unsuitable regions (Gujarat, Maharashtra, Haryana) | ✅ PASS | Gujarat: coffee #1→#2, Maharashtra: coffee #1→#2, Haryana: coffee #2→#4 |
| 0% probability crops eliminated from top-5 | ✅ PASS | 0% prob crops removed from ALL 10 scenarios (was 4 scenarios affected) |
| Coffee in Karnataka remains #1 | ✅ PASS | Karnataka blend score 0.9373 (coffee) vs 0.2335 (jute) — still dominant |
| 10 scenario baseline captured and compared | ✅ PASS | `backend/data/baseline_before.json` and `backend/data/baseline_after.json` |
| Frontend build passes with zero TS errors | ⏳ TBD | Will verify in Subtask 5 |
| Backend imports and runs without errors | ✅ PASS | `import rule_engine` verified OK |

---

## A. Per-Scenario Before vs After Tables

### Scenario 1 — Punjab Rice Region
*N=90, P=40, K=40, temp=25°C, humidity=75%, pH=7.0, rainfall=200mm, soil=Alluvial*

| Rank | Previous Top-5 | Prob | Suit | New Top-5 | Prob | Suit | Blend |
|------|---------------|------|------|-----------|------|------|-------|
| 1 | Jute | 66.0% | 87.14 | Jute | 66.0% | 87.14 | 0.7657 |
| 2 | Rice | 34.0% | 74.56 | Rice | 34.0% | 74.56 | 0.5428 |
| 3 | **Apple** | **0.0%** | 31.93 | — | — | — | — |
| 4 | **Banana** | **0.0%** | 43.38 | — | — | — | — |
| 5 | **Blackgram** | **0.0%** | 35.40 | — | — | — | — |

**Change:** 3 crops at 0% probability eliminated. Only jute and rice (the two valid recommendations) appear. Output is now cleaner and more honest.

---

### Scenario 2 — Haryana Wheat Belt
*N=60, P=35, K=35, temp=20°C, humidity=55%, pH=7.5, rainfall=80mm, soil=Loamy*

| Rank | Previous Top-5 | Prob | Suit | New Top-5 | Prob | Suit | Blend |
|------|---------------|------|------|-----------|------|------|-------|
| 1 | Maize | 35.0% | 72.13 | Maize | 35.0% | 72.13 | 0.5356 |
| 2 | **Coffee** | 25.0% | **24.87** | Mango | 20.0% | 43.38 | 0.3169 |
| 3 | Mango | 20.0% | 43.38 | Chickpea | 3.0% | 52.91 | 0.2796 |
| 4 | Rice | 7.0% | 32.52 | **Coffee** | 25.0% | **24.87** | 0.2494 |
| 5 | Blackgram | 3.0% | 36.42 | Mothbeans | 3.0% | 39.13 | 0.2107 |

**Change:** Coffee drops from #2 to #4, correctly penalized by its low suitability (24.87, penalty -25.2). Mango and chickpea rise due to better suitability scores despite lower model probabilities. This is the intended agronomic improvement.

---

### Scenario 3 — Uttar Pradesh Rice/Wheat Belt
*N=80, P=45, K=40, temp=24°C, humidity=65%, pH=7.2, rainfall=160mm, soil=Alluvial*

| Rank | Previous Top-5 | Prob | Suit | New Top-5 | Prob | Suit | Blend |
|------|---------------|------|------|-----------|------|------|-------|
| 1 | Jute | 49.0% | 80.40 | Jute | 49.0% | 80.40 | 0.6470 |
| 2 | Coffee | 46.0% | 67.20 | Coffee | 46.0% | 67.20 | 0.5660 |
| 3 | Maize | 3.0% | 57.19 | Maize | 3.0% | 57.19 | 0.3009 |
| 4 | Pigeonpeas | 1.0% | 47.57 | Rice | 1.0% | 58.86 | 0.2993 |
| 5 | Rice | 1.0% | 58.86 | Pigeonpeas | 1.0% | 47.57 | 0.2429 |

**Change:** Order preserved nearly the same. Coffee stays #2 because suitability is decent (67.20) and model probability is high (46%). In UP, this makes agronomic sense for higher-elevation areas.

---

### Scenario 4 — Maharashtra Cotton Region
*N=70, P=30, K=30, temp=32°C, humidity=50%, pH=7.5, rainfall=90mm, soil=Black*

| Rank | Previous Top-5 | Prob | Suit | New Top-5 | Prob | Suit | Blend |
|------|---------------|------|------|-----------|------|------|-------|
| 1 | **Coffee** | **43.0%** | **38.21** | **Mango** | **30.0%** | **60.98** | **0.4549** |
| 2 | **Mango** | **30.0%** | **60.98** | **Coffee** | **43.0%** | **38.21** | **0.4061** |
| 3 | Maize | 14.0% | 36.35 | Blackgram | 9.0% | 47.93 | 0.2847 |
| 4 | Blackgram | 9.0% | 47.93 | Maize | 14.0% | 36.35 | 0.2518 |
| 5 | Mothbeans | 2.0% | 47.91 | Mothbeans | 2.0% | 47.91 | 0.2495 |

**Change:** **Critical fix.** Coffee was #1 (pure prob sorting ignored its 18.2 penalty, resulting suitability 38.21). Blended ranking correctly puts mango #1 (blend 0.4549) over coffee (blend 0.4061) — mango is more suitable for Maharashtra's hot, semi-arid conditions.

---

### Scenario 5 — Karnataka Coffee Region
*N=90, P=30, K=35, temp=24°C, humidity=65%, pH=6.5, rainfall=150mm, soil=Red*

| Rank | Previous Top-5 | Prob | Suit | New Top-5 | Prob | Suit | Blend |
|------|---------------|------|------|-----------|------|------|-------|
| 1 | Coffee | 99.0% | 88.46 | Coffee | 99.0% | 88.46 | 0.9373 |
| 2 | **Jute** | **1.0%** | 45.70 | **Jute** | **1.0%** | 45.70 | 0.2335 |
| 3 | **Apple** | **0.0%** | 37.17 | — | — | — | — |
| 4 | **Banana** | **0.0%** | 43.42 | — | — | — | — |
| 5 | **Blackgram** | **0.0%** | 37.16 | — | — | — | — |

**Change:** Coffee remains #1 with overwhelming blend score (0.9373). Three 0% probability crops eliminated. Only coffee and jute displayed — jute kept because it has 1% prob (>0.01 threshold) and valid suitability.

---

### Scenario 6 — Kerala Plantation Region
*N=60, P=30, K=40, temp=28°C, humidity=85%, pH=5.5, rainfall=300mm, soil=Laterite*

| Rank | Previous Top-5 | Prob | Suit | New Top-5 | Prob | Suit | Blend |
|------|---------------|------|------|-----------|------|------|-------|
| 1 | Rice | 42.0% | 58.94 | Rice | 42.0% | 58.94 | 0.5047 |
| 2 | Coconut | 17.0% | 45.35 | Coconut | 17.0% | 45.35 | 0.3118 |
| 3 | Banana | 8.0% | 43.66 | Papaya | 6.0% | 46.08 | 0.2604 |
| 4 | Watermelon | 7.0% | 39.81 | Banana | 8.0% | 43.66 | 0.2583 |
| 5 | Papaya | 6.0% | 46.08 | Watermelon | 7.0% | 39.81 | 0.2341 |

**Change:** Minor reordering — papaya (#5→#3) and banana (#3→#4) swap due to suitability tiebreaker. All 5 crops had >1% probability so no removals. Rankings remain plausible for Kerala.

---

### Scenario 7 — Rajasthan Dryland Region
*N=20, P=15, K=15, temp=38°C, humidity=25%, pH=8.0, rainfall=40mm, soil=Sandy*

| Rank | Previous Top-5 | Prob | Suit | New Top-5 | Prob | Suit | Blend |
|------|---------------|------|------|-----------|------|------|-------|
| 1 | Mothbeans | 42.0% | 50.59 | Mothbeans | 42.0% | 50.59 | 0.4629 |
| 2 | Kidneybeans | 29.0% | 44.35 | Kidneybeans | 29.0% | 44.35 | 0.3668 |
| 3 | Chickpea | 8.0% | 28.98 | Mango | 7.0% | 37.47 | 0.2223 |
| 4 | Mango | 7.0% | 37.47 | Papaya | 1.0% | 38.81 | 0.1991 |
| 5 | Blackgram | 4.0% | 33.59 | Blackgram | 4.0% | 33.59 | 0.1880 |

**Change:** Minor reordering — chickpea (#3) drops out because suitability 28.98 is very low, replaced by papaya which has better suitability (38.81). All crops in top-5 have ≥1% probability. Mothbeans/kidneybeans remain #1/#2 as drought-tolerant choices.

---

### Scenario 8 — Gujarat Cash Crop Region
*N=80, P=40, K=30, temp=34°C, humidity=40%, pH=7.8, rainfall=100mm, soil=Black*

| Rank | Previous Top-5 | Prob | Suit | New Top-5 | Prob | Suit | Blend |
|------|---------------|------|------|-----------|------|------|-------|
| 1 | **Coffee** | **49.0%** | **16.15** | **Mango** | **21.0%** | **54.78** | **0.3789** |
| 2 | **Mango** | **21.0%** | **54.78** | **Coffee** | **49.0%** | **16.15** | **0.3257** |
| 3 | Maize | 16.0% | 35.00 | Maize | 16.0% | 35.00 | 0.2550 |
| 4 | Blackgram | 6.0% | 42.84 | Mothbeans | 5.0% | 43.86 | 0.2443 |
| 5 | Mothbeans | 5.0% | 43.86 | Blackgram | 6.0% | 42.84 | 0.2442 |

**Change:** **Critical fix — the worst-case scenario resolved.** Coffee was #1 with 49% prob but suitability of only 16.15 (penalty -37.1 for hot, dry Gujarat conditions). Blended ranking correctly puts mango #1 (0.3789 > 0.3257). This is the signature fix of this hardening pass.

---

### Scenario 9 — Madhya Pradesh Mixed Farming
*N=50, P=30, K=30, temp=28°C, humidity=55%, pH=7.0, rainfall=120mm, soil=Loamy*

| Rank | Previous Top-5 | Prob | Suit | New Top-5 | Prob | Suit | Blend |
|------|---------------|------|------|-----------|------|------|-------|
| 1 | Mango | 58.0% | 69.68 | Mango | 58.0% | 69.68 | 0.6384 |
| 2 | Coffee | 21.0% | 60.19 | Coffee | 21.0% | 60.19 | 0.4059 |
| 3 | Pomegranate | 6.0% | 34.50 | Pigeonpeas | 5.0% | 49.90 | 0.2745 |
| 4 | Pigeonpeas | 5.0% | 49.90 | Jute | 1.0% | 52.36 | 0.2668 |
| 5 | Blackgram | 3.0% | 45.84 | Blackgram | 3.0% | 45.84 | 0.2442 |

**Change:** Pomegranate (#3→out) replaced by pigeonpeas (higher suitability 49.9 vs 34.5). Jute enters at #4 with 52.36 suitability. Blackgram stays at #5. Marginal improvement.

---

### Scenario 10 — Tamil Nadu Irrigated Region
*N=80, P=35, K=40, temp=30°C, humidity=70%, pH=6.8, rainfall=180mm, soil=Clay*

| Rank | Previous Top-5 | Prob | Suit | New Top-5 | Prob | Suit | Blend |
|------|---------------|------|------|-----------|------|------|-------|
| 1 | Coffee | 57.0% | 67.15 | Coffee | 57.0% | 67.15 | 0.6208 |
| 2 | Jute | 26.0% | 49.76 | Jute | 26.0% | 49.76 | 0.3788 |
| 3 | Rice | 6.0% | 55.88 | Rice | 6.0% | 55.88 | 0.3094 |
| 4 | Mango | 4.0% | 39.12 | Papaya | 2.0% | 46.42 | 0.2421 |
| 5 | Muskmelon | 2.0% | 35.52 | Pigeonpeas | 1.0% | 47.00 | 0.2400 |

**Change:** Mango (#4→out) and muskmelon (#5→out) replaced by papaya and pigeonpeas which have higher suitability scores. Coffee remains #1 (blend 0.6208) — valid for Tamil Nadu's higher-elevation regions (Nilgiris). Coffee penalty was only 0.1, confirming conditions are close to optimal.

---

## B. Issue Resolution Summary

### Issue 1 — Coffee in unsuitable regions (Root Cause A)
**Fix applied:** Blended ranking score

| Scenario | Before | After | Verdict |
|----------|--------|-------|---------|
| Gujarat (#8) | Coffee #1 (suit=16.15) | Mango #1 (suit=54.78) | ✅ **Resolved** |
| Maharashtra (#4) | Coffee #1 (suit=38.21) | Mango #1 (suit=60.98) | ✅ **Resolved** |
| Haryana (#2) | Coffee #2 (suit=24.87) | Coffee #4 (suit=24.87) | ✅ **Improved** |
| UP (#3) | Coffee #2 (suit=67.20) | Coffee #2 (suit=67.20) | ✅ **Unchanged — valid** |
| Karnataka (#5) | Coffee #1 (suit=88.46) | Coffee #1 (suit=88.46) | ✅ **Unchanged — valid** |
| Tamil Nadu (#10) | Coffee #1 (suit=67.15) | Coffee #1 (suit=67.15) | ✅ **Unchanged — valid** |
| MP (#9) | Coffee #2 (suit=60.19) | Coffee #2 (suit=60.19) | ✅ **Unchanged — valid** |

Coffee is no longer #1 in any clearly unsuitable region. It remains #1 only in Karnataka (valid) and Tamil Nadu (marginally valid due to Nilgiri plantations).

### Issue 2 — 0% probability crops in top-5 (Root Cause B)
**Fix applied:** Probability floor (1% minimum)

| Scenario | Crops removed at 0% prob | Count |
|----------|-------------------------|-------|
| Punjab (#1) | apple, banana, blackgram | 3 |
| Karnataka (#5) | apple, banana, blackgram | 3 |
| **Total removed** | | **6** |

All 6 crop entries at 0% model probability have been eliminated from the top-5 display. The remaining slots simply aren't filled when fewer than top_n crops pass the probability floor — this is more honest than showing zero-probability crops.

### Issue 3 — No probability guardrail (Root Cause C)
**Fix applied:** 1% threshold + guard clause

The 1% minimum threshold ensures that crops with negligible model confidence do not appear in top-5. The guard clause retains at least the single highest-probability crop even if all are below 1%, so the system never returns an empty list.

---

## C. Remaining Known Limitations (brutally honest)

### Limitation 1: Blended weight (50/50) is arbitrary
The 50/50 split between model probability and normalized suitability was chosen by design analysis, not empirical optimization. A different ratio (e.g., 60/40 or 40/60) would produce different rankings. Agronomic domain experts should validate this ratio against field data before production use.

### Limitation 2: Suitability scale mismatch
Model probability ranges 0-1 (effective range 0-0.99 for this model), while suitability_score ranges 0-100 (with a practical floor around 16 for heavily penalized crops). The normalization (`suitability_score / 100.0`) compresses suitability into 0-1, but the effective range is narrower (~0.16-0.88) than model probability (0-0.99). This means probability still has slightly more influence in practice.

### Limitation 3: Coffee still appears in unsuitable regions (rank #2 or lower)
In Gujarat and Maharashtra, coffee still makes the top-5 at rank #2 because the model gives it 43-49% probability. The blended score correctly demotes it below more suitable crops, but the fact that the model assigns coffee such high probabilities in hot, dry regions is a fundamental model limitation. This cannot be fixed in the rule engine.

### Limitation 4: 1% threshold is conservative
The 1% floor keeps borderline cases like jute (1% prob in Karnataka, rank #2) and papaya/pigeonpeas (1-2% prob in various scenarios). Raising the threshold to 5% would remove more noise but might also remove agronomically valid but low-probability recommendations. The current threshold is conservatively low.

### Limitation 5: No all-crops-rejected handling tested
The guard clause (`if len(scored) < 1`) has been implemented but not tested — no scenario in our 10 test cases produced zero crops above 1% probability. In theory, an extreme scenario could exist where all 22 crops have <1% model probability, which shouldn't happen with this model but the guard exists for safety.

### Limitation 6: Ranking score not exposed in API response
The `ranking_score` is used for sorting but is not currently included in the API response. Users see the final ordered list but cannot inspect the blend ratio that determined the order. This is a transparency gap.

### Limitation 7: Double-counting concern
The blended ranking score incorporates suitability_score which itself includes ml_probability at 35% weight. So ml_probability influences the ranking in two ways: directly (50% weight in blend) and indirectly (35% of suitability_score, which is normalized to 0-1 then blended at 50%). This creates mild double-counting of the ML signal. The exact impact:
- Direct: `0.5 * prob`
- Indirect: `0.5 * ((prob * 100 * 0.35 + other_components * 0.65) / 100)` = `0.5 * (0.35 * prob + 0.65 * other_normalized)`
- Total ML influence on ranking: `0.5 * prob + 0.175 * prob = 0.675 * prob` (vs 1.0 in the old system)
- Total suitability influence: `0.5 * 0.65 * normalized_other = 0.325 * normalized_other`

This means the fix **reduces** ML's ranking dominance from 100% to 67.5% — still majority but significantly reduced.

---

## Summary

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Coffee #1 in unsuitable regions | 2 (Gujarat, Maharashtra) | 0 | ✅ -2 |
| 0% prob crops in top-5 | 6 entries across 2 scenarios | 0 | ✅ -6 |
| Coffee in Karnataka #1 | ✅ Yes | ✅ Yes | Preserved |
| Scenarios with <5 valid crops | 2 (Punjab, Karnataka) | 2 (same, less cluttered) | ✅ Cleaner |
| Coffee in top-5 (any rank) in valid regions | 5 scenarios | 5 scenarios | ✅ Unchanged |