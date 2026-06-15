# Smart Crop Engine v1.5 — Final Agronomic Hardening

## Goal
Fix three remaining agronomic ranking issues discovered in the validation report: (1) coffee dominating unsuitable regions despite penalty, (2) 0-3% probability crops leaking into top-5, (3) jute dominance in rice-belt scenarios. Only modify `backend/src/rule_engine.py`.

## Research Summary

### Root Cause A — Ranking by model_probability only
`compute_top_crops()` sorts crops by `model_probability` descending. The `coffee_penalty` reduces coffee's `suitability_score` (to 16.15/100 in Gujarat) but does NOT affect ranking. Coffee at 49% probability still ranks #1 in Gujarat despite having suitability 16.15 (penalized from ~53).

**Evidence:** Gujarat scenario — coffee model_prob 49%, suitability 16.15 (penalty -37.1 applied). Still ranked #1 above mango (21% prob, 54.78 suitability).

### Root Cause B — 0% probability crops in slots 3-5
The model outputs >1% probability for only 2-3 crops per scenario. The remaining 2-3 top-5 slots are filled with crops at 0% probability because `top_n=5` is taken from the sorted list regardless of magnitude.

**Evidence:** Punjab — apple/banana/blackgram all at 0% probability occupy slots 3-5. Karnataka — jute(1%), apple(0%), banana(0%), blackgram(0%) fill slots 2-5.

### Root Cause C — No guardrails for near-zero ML probability
No minimum threshold exists. Any crop with probability >0 makes the sorted list and can appear in top-5 if enough higher-probability crops don't exist.

## Fix Design (Minimal, 3 changes to compute_top_crops)

### Fix 1 — Blended Ranking Score (fixes Root Cause A & C)
Replace pure model_probability sorting with a blended score:
```
ranking_score = 0.5 * model_probability + 0.5 * (suitability_score / 100.0)
```
This ensures:
- **Coffee in Gujarat**: blend = 0.5*0.49 + 0.5*0.162 = 0.326. Mango = 0.5*0.21 + 0.5*0.548 = 0.379 → mango #1 ✓
- **Coffee in Maharashtra**: blend = 0.5*0.43 + 0.5*0.382 = 0.406. Mango = 0.5*0.30 + 0.5*0.610 = 0.455 → mango #1 ✓
- **Coffee in UP**: blend = 0.5*0.46 + 0.5*0.672 = 0.566. Jute = 0.5*0.49 + 0.5*0.804 = 0.647 → jute #1 ✓ (valid)
- **Coffee in Karnataka**: blend = 0.5*0.99 + 0.5*0.885 = 0.938 → still #1 ✓ (valid coffee region)

### Fix 2 — Probability Floor (fixes Root Cause B)
Apply a minimum probability threshold of 0.01 (1%) before ranking. Crops with <1% probability are excluded. This is conservative:
- All valid recommendations in the 10 scenarios have >5% probability except edge cases (pigeonpeas 1%, rice 1% in UP; mothbeans 2% in Maharashtra; mango 4% in TN)
- 1% threshold keeps those borderline cases
- Drops the literal 0% crops (apple, banana, blackgram in Punjab)
- After applying threshold: if remaining crops < 1, return the top-1 by model_probability (always valid)

### Fix 3 — Jute Moisture Validation (conservative)
Jute requires high humidity (70.88-89.89%) and substantial rainfall (150-200mm). In scenarios where both are in range, jute ranking #1 is valid. No additional constraint needed — the probability threshold + blended ranking already ensures jute only appears when it has >1% model probability AND reasonable suitability.

The model itself correctly identifies jute when NPK profile matches. The issue was never jute's validity — it was 0% crops filling slots below it.

### What does NOT change
- Model weights (35/20/12/10/8/5/10)
- Coffee penalty logic
- Suitability scoring functions
- Explanation engine
- API contracts
- Frontend
- Backend endpoints
- Any file outside rule_engine.py

## Subtasks
1. **Baseline capture**: Run all 10 scenarios through current compute_top_crops(), capture before-results
2. **Implement Fix 1** (Blended Ranking) and **Fix 2** (Probability Floor) in compute_top_crops()
3. **Validation**: Re-run all 10 scenarios, capture after-results
4. **Generate report**: docs/AGRONOMIC_HARDENING_RESULTS.md with before/after tables, issue resolution summary, and remaining limitations
5. **Verify no regressions**: Run backend smoke test (uvicorn), frontend build, and existing audit scripts

## Deliverables
| File Path | Description |
|-----------|-------------|
| backend/src/rule_engine.py | Modified with Fix 1 and Fix 2 |
| docs/AGRONOMIC_HARDENING_RESULTS.md | Before/after comparison, issue resolution summary |

## Evaluation Criteria
- Coffee no longer dominates clearly unsuitable regions (Gujarat, Maharashtra, Haryana)
- 0% probability crops eliminated from top-5
- Coffee in Karnataka remains #1 (valid coffee region)
- 10 scenario baseline captured and compared
- Frontend npm build passes with zero TypeScript errors
- Backend predict endpoint still works