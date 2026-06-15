# Fertilizer Unit Audit — Smart Crop Engine v1.5

## Summary

A complete audit of the fertilizer recommendation flow revealed **two bugs**:
1. **Format mismatch**: Frontend expects `npk_deficit` as `NpkDeficit[]` array but backend returned a flat `dict`
2. **Unit label mismatch**: UI displayed "ppm" but actual data convention is kg/ha

---

## Full Data Flow Trace

### 1. Frontend Input (`frontend/src/app/fertilizer/page.tsx`)
- User selects a crop from dropdown (20 options)
- User enters N, P, K values (each `min="0" max="200"`)
- **Before fix**: inputs showed `unit="ppm"` and section header "Current NPK Levels (ppm)"
- POST to `/api/v1/fertilizer` with `{crop, N, P, K}`

### 2. Backend Processing (`backend/src/fertilizer_service.py`)
- `recommend_fertilizer(crop, N, P, K)` compares input vs `CROP_NPK_REQUIREMENTS`
- `CROP_NPK_REQUIREMENTS` values (e.g., rice N=120) from ICAR/FAO — in kg/ha
- Training data (`Crop_recommendation.csv`) soil NPK values — also in kg/ha
- Deficit = max(0, optimal - current) — valid when same unit
- Returns dict with `fertilizer`, `reason`, `npk_deficit`, `crop_optimal`

### 3. Frontend Result Display
- `FertilizerResponse` interface declares `npk_deficit?: NpkDeficit[]`
- `NpkDeficit` = `{nutrient, current, optimal, deficit}` array
- Table rendered with `.map()` over `npk_deficit`

---

## Bug 1: Format Mismatch — `npk_deficit` dict vs array

### Before (Backend Response Shape)
```json
{
  "fertilizer": "Urea",
  "reason": "low N — N is 40 kg/ha below optimal",
  "npk_deficit": {
    "N": 40.0,
    "P": 0.0,
    "K": 0.0
  },
  "crop_optimal": {"N": 120, "P": 60, "K": 40}
}
```

### After (Backend Response Shape)
```json
{
  "fertilizer": "Urea",
  "reason": "low N — N is 40 kg/ha below optimal",
  "npk_deficit": [
    {"nutrient": "N", "current": 80.0, "optimal": 120, "deficit": 40.0},
    {"nutrient": "P", "current": 60.0, "optimal": 60, "deficit": 0.0},
    {"nutrient": "K", "current": 40.0, "optimal": 40, "deficit": 0.0}
  ],
  "crop_optimal": {"N": 120, "P": 60, "K": 40}
}
```

### Root Cause
The frontend `FertilizerResponse` interface at line ~30 defined `npk_deficit?: NpkDeficit[]` (array of objects), but `recommend_fertilizer()` returned a flat dict `{"N": val, "P": val, "K": val}`.

The frontend checked `result.npk_deficit.length > 0` to decide whether to render the deficit table. On a dict, `.length` returns `undefined`, so the table **never rendered**.

### Fix Applied
Changed ALL return paths in `fertilizer_service.py` to return array format:
- Unknown crop path (line 74)
- "No fertilizer needed" path (line 96-100)
- "No suitable fertilizer found" path (line 151-155)
- Main success path (line 159-178)

Also removed the now-unused `deficits` dict variable.

---

## Bug 2: Unit Label Mismatch — "ppm" vs "kg/ha"

### Evidence
| Source | Unit | Values |
|--------|------|--------|
| Training data `Crop_recommendation.csv` | kg/ha (Indian agri convention) | N: 0-140, P: 5-145, K: 5-205 |
| `CROP_NPK_REQUIREMENTS` docstring | "kg/ha" | N ranges 20-200 |
| Frontend section header (**before fix**) | "Current NPK Levels (ppm)" | N/A |
| Frontend input `unit` prop (**before fix**) | "ppm" | N/A |
| Frontend table header (**before fix**) | "Current (ppm)" / "Optimal (ppm)" | N/A |

"ppm" (parts per million) is a concentration unit for soil solution testing. The values 0-200 for NPK represent kg/ha as reported by standard soil test laboratories in India. The UI was displaying the wrong unit label.

### Fix Applied
Changed all "ppm" references in `fertilizer/page.tsx` to "kg/ha":
- Section header: "Current NPK Levels (ppm)" → "Current NPK Levels (kg/ha)"
- Input `unit` prop: `unit="ppm"` → `unit="kg/ha"`
- Table header: "Current (ppm)" → "Current (kg/ha)"
- Table header: "Optimal (ppm)" → "Optimal (kg/ha)"
- Crop optimal display: `{current} / {optimalVal} ppm` → `{current} / {optimalVal} kg/ha`

---

## Verification

- [x] Backend compiles: `fertilizer_service.py` passes `py_compile`
- [x] All 4 code paths return uniform array format
- [x] Frontend TypeScript interface `FertilizerResponse` already matched array format — no frontend interface changes needed
- [x] No "ppm" references remain in `fertilizer/page.tsx`