# Phase 5A — Model Upgrade: Top-3 + Suitability + Explainability

## Goal
Upgrade the crop recommendation pipeline from single-crop output with opaque confidence to a **top-3 ranked list** with per-crop **suitability scores**, **structured breakdowns**, and **human-readable explanations** — without modifying the existing `/predict` or `/api/v1/predict` endpoints.

## Research Summary
- Current backend: `/predict` returns 1 crop + 1 confidence + 1 flat explanation string
- Current frontend: Shows ConfidenceGauge (half-arc), 2 confidence numbers, one explanation block
- Model: `RandomForestClassifier` — `.predict_proba()` returns probabilities for all 22 classes
- ML audit report (580 lines) confirms mean confidence 36.7%, 14/22 classes silent
- No LLM available — all explanations will be **rule-based** from feature analysis and soil/weather heuristics

## Approach
1. **Backend**: Add `/api/v2/predict` — returns top-3 crops with per-crop suitability scores, breakdowns, selected-reason text, supported crop list, and model limitations. Reuses existing fusion logic (`get_ndvi_for`, soil compatibility, weather scoring) but applies it per-crop for the top-3. Existing endpoints are untouched.
2. **Frontend**: Update `recommend/page.tsx` to call `/api/v2/predict`. Replace single-crop display with 3 ranked crop cards. Replace single ConfidenceGauge with per-crop suitability display. Add suitability breakdown bars, "why this crop" explanations, model limitations section, and supported crop list. Maintain all input form, GPS, skeleton loading, error handling, and disclaimer.

## Affected Files

| File | Action | Description |
|------|--------|-------------|
| `backend/src/api.py` | **Modify** | Add `/api/v2/predict` endpoint (280+ lines added) |
| `frontend/src/app/recommend/page.tsx` | **Modify** | Rewrite results section for top-3 display (300+ lines changed) |
| `backend/src/requirements.txt` | **Check** | No new dependencies needed |

## Estimation
- Backend: ~2 hours
- Frontend: ~3 hours
- Testing & Build: ~30 min
- **Total: ~5-6 hours**

## Subtasks

### Subtask 1 — Backend: Add `/api/v2/predict` endpoint
**What**: Add a new endpoint that returns:
- `top_crops`: Array of 3 objects, each with:
  - `rank` (1-3)
  - `crop` (name)
  - `base_probability` (raw model prob %)
  - `suitability_score` (composite 0-100%)
  - `suitability_breakdown` (model_probability, ndvi_impact, soil_compatibility, weather_fitness)
  - `explanation` (detailed human-readable text explaining why this crop fits)
  - `why_selected` (the key reason this crop ranks where it does)
- `all_supported_crops`: Full list of 22 crops the model can predict
- `model_limitations`: Array of limitation strings (from ML audit findings)

**Logic**:
- Run `model.predict_proba()` once
- Get top-3 by raw probability
- For each, compute NDVI impact, soil score, weather score (same fusion as existing, but per-crop)
- Generate rule-based explanation: combine feature importance context, soil compatibility, climate match, and NDVI context
- Generate why_selected: highlight the strongest factor for each crop's rank

**Verify**: `curl -X POST http://localhost:8000/api/v2/predict -H "Content-Type: application/json" -d '{"N":90,"P":42,"K":43,"temperature":25,"humidity":65,"ph":6.5,"rainfall":150,"soil_type":"Loamy"}'` returns valid JSON with top_crops array of 3, all_supported_crops list of 22, model_limitations array.

### Subtask 2 — Frontend: Update recommend/page.tsx
**What**: Rewrite the results section (`state === "success"`) to display:
- Headline: "Top 3 Crop Recommendations"
- 3 ranked crop cards, each showing:
  - Rank badge (#1, #2, #3)
  - Crop name (large text)
  - Suitability score gauge (reuse ConfidenceGauge component)
  - Suitability breakdown: 4 horizontal ProgressBar components (Model Probability, NDVI Impact, Soil Compatibility, Weather Fitness)
  - Explanation paragraph
  - Why this crop was selected (highlighted text box)
- Below the cards:
  - **Model Limitations** section (collapsible card with bullet list)
  - **Supported Crops** section (compact grid of all 22 crops)

**Keep intact**:
- All input form fields, GPS button, soil type selector
- Loading skeleton, skeleton messages
- Error handling (both backend-waking-up and generic error)
- Disclaimer at bottom
- ResponseTime component
- The `handleChange`, `handleGetLocation`, `handleSubmit` functions

**Verify**: `npm run build` exits 0, UI renders top-3 cards correctly with sample data.

### Subtask 3 — Build Verification & Testing
- Run `cd frontend && npm run build`
- Verify all 11 routes compile (no TypeScript errors)
- Do a quick test with the backend (if running locally) or with mock data

## Deliverables

| File | Description |
|------|-------------|
| `backend/src/api.py` | Updated with `/api/v2/predict` endpoint |
| `frontend/src/app/recommend/page.tsx` | Updated with top-3 + suitability + explainability UI |

## Evaluation Criteria
1. `/api/v2/predict` returns valid JSON with top_crops (3 items), all_supported_crops (22 items), model_limitations (≥3 items)
2. Each top_crop has: rank, crop, base_probability, suitability_score, suitability_breakdown, explanation, why_selected
3. Frontend shows 3 crop cards with rank badges, suitability gauges, breakdown bars, explanations
4. Frontend shows model limitations section and supported crops list
5. `npm run build` exits 0 with no TS errors
6. Existing `/predict` and `/api/v1/predict` endpoints remain unchanged and functional

## Notes
- No new Python/JS dependencies required
- No database changes
- No deployment changes
- Existing endpoints preserved exactly for backward compatibility