# FINAL FREEZE REPORT — Smart Crop Engine v1.5

**Generated:** 2025-06-27T18:00:00Z

---

## Files Changed

| File | Change |
|------|--------|
| `backend/src/rule_engine.py` | **Task 2:** Added `"ranking_score": round(entry["ranking_score"], 4)` to the `results.append({...})` dict inside `compute_top_crops()`. Exposes the blended ranking score (0.5 × prob + 0.5 × suitability/100) in API response. |
| `frontend/src/components/Navbar.tsx` | **Task 3:** Removed `{ href: "/admin", label: "Admin", mobileIcon: Settings }` from navLinks array. Removed `Settings` import from lucide-react (was only used by admin link). |
| `backend/src/evaluate_model.py` | **Task 4:** Changed output paths from `PROJECT_ROOT/../` to `PROJECT_ROOT/reports/`. `OUT_DIR`, `CSV_OUT`, `PNG_OUT` all updated. Added `os.makedirs(OUT_DIR, exist_ok=True)`. |

## Validations Passed (Task 5)

| Script | Exit Code | Result |
|--------|-----------|--------|
| `backend/src/agronomic_validation.py` | 0 | ✅ PASS — Report written to `backend/docs/AGRONOMIC_VALIDATION_REPORT.md`. 10 scenarios tested, 14 issues flagged. |
| `backend/src/explanation_audit.py` | 0 | ✅ PASS — 57 scenarios/285 crops checked. 0 inconsistencies found. |
| `backend/src/silent_crop_search.py` | 0 | ✅ PASS — Report written to `backend/docs/SUPPORTED_CROP_VALIDATION.md`. All 22 crops searchable to rank #1. |

All three scripts ran with exit code 0, no tracebacks, no exceptions.

## Agronomic Fixes Active

- ✅ **Fix 1 — Blended Ranking:** `ranking_score = 0.5 * model_probability + 0.5 * (suitability_score / 100.0)` (line 763 in `compute_top_crops()`). Coffee no longer dominates unsuitable regions; mango correctly ranks #1 in Gujarat and Maharashtra.
- ✅ **Fix 2 — Probability Floor:** Crops with `model_probability < 0.01` (1%) are skipped before populating top-5 (line 746). 6 zero-probability entries eliminated across Punjab and Karnataka scenarios.
- ✅ **Fix 3 — Fallback Guard:** If fewer than 1 crop remains after probability filter, the single highest-probability crop is retained (lines 792-796). Prevents empty recommendations.

## Ranking Score Exposure

✅ Confirmed: `ranking_score` is now included in the `/api/v2/predict` response.

**Evidence from API smoke test (Task 7):**
```json
{
    "crop_name": "jute",
    "model_probability": 0.66,
    "ranking_score": 0.7677,
    ...
}
```

The `ranking_score` uses the exact value computed for ranking (not a second formula), rounded to 4 decimal places. No changes to ranking behavior or frontend.

## Admin Navbar Removal

✅ Confirmed: Navbar no longer links to `/admin`.

- `grep "/admin" frontend/src/components/Navbar.tsx` returns **no output** (exit code 1).
- `Settings` import removed from lucide-react (was only used by admin link).
- Admin page still exists at `frontend/src/app/admin/` with `layout.tsx` and `page.tsx` — the route and components remain unchanged.

## Build Status

✅ Confirmed: Frontend `npm run build` passes.

- Exit code: 0
- TypeScript: Compiled successfully (1672ms), zero errors
- Routes generated: 11 (including `/`, `/about`, `/admin`, `/contact`, `/faq`, `/fertilizer`, `/ndvi`, `/recommend`, etc.)

## API Smoke Test Results (Task 7)

### POST /predict (v1 endpoint)

| Check | Result |
|-------|--------|
| HTTP Status | 200 ✅ |
| Valid JSON | ✅ |
| `recommended_crop` | `"jute"` ✅ |
| `base_model_confidence` | `66.0` ✅ |
| `adjusted_confidence` | `66.1` ✅ |
| `weather_score` | `100.0` ✅ |
| No null required fields | ✅ |

### POST /api/v2/predict (v2 endpoint)

| Check | Result |
|-------|--------|
| HTTP Status | 200 ✅ |
| Valid JSON | ✅ |
| `ranking_score` present | `0.7677` for jute, `0.5449` for rice ✅ |
| `uncertainty_score` with label & raw & normalized | ✅ |
| `suitability_components` complete | ✅ (ml_probability, soil_compatibility, temperature, rainfall, humidity, ph, npk) |
| No null required fields | ✅ |

### POST /api/v1/fertilizer

| Check | Result |
|-------|--------|
| HTTP Status | 200 ✅ |
| Valid JSON | ✅ |
| `fertilizer` | `"Urea"` ✅ |
| `npk_deficit` array shape | ✅ Each entry has `{nutrient, current, optimal, deficit}` |
| Deficit values correct | N: current=60, optimal=120, deficit=60 ✅ |
| `crop_optimal` present | ✅ |

## Pre-Existing Issues

Seven remaining limitations documented in `docs/AGRONOMIC_HARDENING_RESULTS.md`:

1. **Blended weight (50/50) is arbitrary** — The split between model probability and normalized suitability was chosen by design analysis, not empirical optimization. Different ratios (e.g., 60/40 or 40/60) would produce different rankings.

2. **Suitability scale mismatch** — Model probability ranges 0-1 while suitability_score ranges 0-100. Normalization compresses suitability into a narrower effective range (~0.16-0.88) than probability (0-0.99), giving probability slightly more influence.

3. **Coffee still appears in unsuitable regions (rank #2 or lower)** — In Gujarat and Maharashtra, coffee still makes top-5 at rank #2 because the model assigns it 43-49% probability. This is a fundamental model limitation that cannot be fixed in the rule engine.

4. **1% threshold is conservative** — The floor keeps borderline cases like jute (1% prob in Karnataka, rank #2). Raising to 5% would remove more noise but might remove agronomically valid recommendations.

5. **No all-crops-rejected handling tested** — The guard clause exists but was never triggered; no scenario in our 10 test cases produced zero crops above 1% probability.

6. **Double-counting concern** — The blended score incorporates suitability_score which itself includes ml_probability at 35% weight. Total ML influence on ranking is ~67.5% (down from 100% in the old system).

7. **Coffee penalty needs calibration** — The suitability penalty for coffee in non-ideal climates exists but may need adjustment. In Gujarat, penalty reduces suitability from ~53 to 16.15 (-37.1), which is effective but the exact magnitude may need domain expert review.