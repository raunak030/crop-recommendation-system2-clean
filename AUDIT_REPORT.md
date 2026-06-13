# PRODUCTION LOCKDOWN AUDIT REPORT

**Project**: Smart Crop Engine  
**Audit Date**: 2025  
**Auditor**: Automated Production Lockdown Audit  
**Codebase**: `/Users/raunakpatel/crop-recommendation-system2-clean`

---

## PART 1 — Visual QA (Code Review)

### Navbar Structure

| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Component | `Navbar.tsx` | `Navbar.tsx` |
| Type | `sticky top-0 z-50 glass border-b...` | `fixed bottom-0 left-0 right-0 z-50 glass border-t...` |
| z-index | `z-50` (line 36) | `z-50` (line 72) |
| Styling | `border-slate-200/50 dark:border-slate-700/50` | `safe-area-bottom` class present |

**Layout.tsx**: `<main className="flex-1 pt-20">` — correct padding (64px navbar + 16px breathing room). ✅

**Z-index scan** (grep results):
```
frontend/src/app/ndvi/page.tsx:379: z-10          — MapPin icon
frontend/src/app/page.tsx:123:     z-10          — Hero content section  
frontend/src/components/Navbar.tsx:36:  z-50      — Desktop navbar
frontend/src/components/Navbar.tsx:72:  z-50      — Mobile navbar
```
No z-index conflicts or stacking issues.

### Per-Page Findings

| Page | Navbar Clear | z-index | Responsive Classes | Issues |
|------|-------------|---------|-------------------|--------|
| **Home** (`page.tsx`) | ✅ `pt-20` via layout | ✅ `z-10` on hero | ✅ `sm:`, `md:`, `lg:` grids, `max-w-6xl` container | Clean. Stats bar removed. Beta badge present. Hero gradient, feature cards, how-it-works, infrastructure grid. No visual noise. |
| **Recommend** (`recommend/page.tsx`) | ✅ `pt-20` | ✅ None custom | ✅ `md:grid-cols-2`, responsive flex | Honest dual confidence display. Form grid responsive. Empty/error states handled. No clipping. |
| **NDVI** (`ndvi/page.tsx`) | ✅ `pt-20` | ✅ `z-10` on MapPin | ✅ `md:grid-cols-2`, `md:h-[600px]` | "Map" area is CSS gradient with grid overlay + crosshair (intentional). No actual tiles. Not clipping — designed decorative element. |
| **Fertilizer** (`fertilizer/page.tsx`) | ✅ `pt-20` | ✅ None custom | ✅ Grid layout, `overflow-x-auto` for table | Clean. Only real API fields. Empty state present. |
| **About** (`about/page.tsx`) | ✅ `pt-20` | ✅ None custom | ✅ `md:grid-cols-2`, `md:grid-cols-4` | Mission-focused. Tech stack grid. No portfolio language. |
| **FAQ** (`faq/page.tsx`) | ✅ `pt-20` | ✅ None custom | ✅ `max-w-3xl`, single column | Accordion pattern. Smooth transitions. No overflow. |
| **Contact** (`contact/page.tsx`) | ✅ `pt-20` | ✅ None custom | ✅ `md:grid-cols-3` | Three contact cards. Mailto section. Clean layout. |
| **Admin** (`admin/page.tsx`) | ✅ `pt-20` | ✅ None custom | ✅ Single column | "Coming Soon" placeholder centered. Minimal. |

### Responsiveness Summary
- All pages use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) for breakpoints
- Navbar switches between sticky (desktop) and fixed-bottom (mobile) at `md:` breakpoint
- Grid layouts stack vertically on mobile and expand columns on desktop
- Tables use `overflow-x-auto` for horizontal scrolling on small screens

### Verdict
✅ **PASS**. All pages have correct navbar clearance, no z-index conflicts, proper responsive breakpoints, no opacity clipping, no background-image visual noise.

---

## PART 2 — NDVI Trust Audit

### Source File: `frontend/src/app/ndvi/page.tsx` (418 lines)

### What the "Map" Actually Is

The map area is a `<div>` with the following characteristics:

1. **No Leaflet, Mapbox, or Google Maps API** — Zero map library imports anywhere in the file or codebase.

2. **CSS Gradient Background** (line 178-182):
   ```tsx
   <div className="relative w-full h-[300px] md:h-[600px] rounded-2xl overflow-hidden 
     border border-slate-200 dark:border-slate-700 
     bg-gradient-to-br from-green-800/20 via-amber-800/10 to-green-900/30 
     dark:from-green-900/40 dark:via-amber-900/20 dark:to-green-950/50">
   ```
   The green-to-amber gradient suggests vegetation/dryness visually but is purely decorative CSS.

3. **Grid Overlay** (line 184-191):
   ```tsx
   <div className="absolute inset-0 opacity-20 dark:opacity-10"
     style={{
       backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
       backgroundSize: '60px 60px'
     }}
   />
   ```

4. **Crosshair Lines** (lines 193-194 and 197-198):
   ```tsx
   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
     <div className="w-full h-px bg-slate-400/40 dark:bg-slate-500/40" />
     <div className="absolute inset-0 flex items-center justify-center">
       <div className="h-full w-px bg-slate-400/40 dark:bg-slate-500/40" />
   ```

5. **MapPin Icon** (line 379): `className="text-primary-600 dark:text-primary-400 drop-shadow-lg relative z-10"` — the only z-10 element, with `animate-pulse`.

### Labeling

The bottom overlay reads:
```tsx
<div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 px-3 py-1.5 
  bg-black/50 backdrop-blur-sm rounded-lg text-xs text-white">
  🛰️ Interactive Satellite Map
</div>
```
**This is misleading.** It is NOT an interactive satellite map — it is a static CSS visualization.

### Honest Assessment

| Question | Answer | Evidence |
|----------|--------|----------|
| Real Leaflet/tile imagery? | ❌ No | No map library imports. Pure CSS gradient + grid + crosshair. |
| CSS gradient + crosshair? | ✅ Yes | Lines 178-200 of `ndvi/page.tsx` |
| Labeled "Interactive Satellite Map"? | ✅ Yes | Line bottom overlay reads this text |
| Implies real-time satellite imagery? | ⚠️ Yes | The label plus the `🛰️` emoji imply satellite feed |
| Leaflet/Mapbox/Google Maps integration? | ❌ None | Zero map library imports |
| Any disclaimer (illustrative/placeholder)? | ❌ No | No text labels it as illustrative or placeholder |

### The Data Behind It
The NDVI **data pipeline is real**: The page fetches `GET /ndvi?lat=...&lon=...` which uses Google Earth Engine (`get_ndvi_for`) to compute real NDVI values from Sentinel-2 satellite imagery. The gauge, health status, and metadata cards are all driven by real API data.

### Recommendation
Relabel the map section to `📍 Field Location Viewer` or `📍 Selected Coordinates` and add a small disclaimer: *"Visual representation of selected coordinates. Satellite imagery not displayed."* This preserves the user experience while being honest about what the visualization shows.

### Verdict
⚠️ **MEDIUM CONCERN — MISLABELED**. The underlying data is real (Sentinel-2 via Earth Engine), but the visual component is marketed as an "Interactive Satellite Map" when it is a CSS gradient with a crosshair. No disclaimer is present.

---

## PART 3 — Confidence Audit

### Source Files
- Backend formula: `backend/src/api.py`
- Frontend display: `frontend/src/app/recommend/page.tsx` (575 lines)
- Gauge component: `frontend/src/components/ConfidenceGauge.tsx`

### Exact Calculation Formula (from `backend/src/api.py`)

#### Constants (line ~63-66):
```python
ML_MODEL_WEIGHT = 0.65
NDVI_WEIGHT = 0.20
SOIL_WEIGHT = 0.10
WEATHER_WEIGHT = 0.05
```

#### Step 1 — Base ML Confidence (line ~80):
```python
probabilities = model.predict_proba(input_df)[0]
base_model_confidence = max(probabilities) * 100
```
- Real RandomForest output probability for the winning class
- Range: typically 20-50%, rarely exceeds 60% (except extreme N scenarios)

#### Step 2 — NDVI Adjustment (line ~110-120):
- If coordinates provided, fetch NDVI from Earth Engine
- NDVI > 0.65 (Healthy): `ndvi_adjust = +15.0`
- NDVI 0.45–0.65 (Moderate): `ndvi_adjust = +5.0`
- NDVI 0.25–0.45 (Poor): `ndvi_adjust = -5.0`
- NDVI < 0.25 (Very poor): `ndvi_adjust = -15.0`
- **Note**: This is a heuristic rule-of-thumb, not derived from agronomic field trials

#### Step 3 — Soil Score (line ~130-150):
```python
SOIL_COMPATIBILITY = {
    "rice": ["clay", "loamy"],
    "coffee": ["loamy", "sandy"],
    "coconut": ["sandy", "alluvial"],
    "mango": ["loamy", "sandy"],
    "apple": ["loamy", "clay"],
    "banana": ["loamy", "clay"]
}
```
- If user soil type matches crop: `soil_score = 100`
- If no match: `soil_score = 40`
- For unmapped crops (not in dict): `soil_score = 50`
- **Critical**: Only 6 of 22 crops (27%) have soil compatibility data. The remaining 16 crops always get `soil_score = 50`.

#### Step 4 — Weather Score (line ~160-175):
```python
temp_score = 100 if 15 <= temp <= 35 else max(0, 100 - abs(temp - 25) * 4)
rain_score = 100 if 100 <= rain <= 3000 else max(0, 100 - abs(rain - 500) / 50)
weather_score = temp_score * 0.5 + rain_score * 0.5
```
- Reasonable heuristics but not crop-specific (same formula for all crops)
- Doesn't account for crop-specific optimal temperature/rainfall ranges

#### Step 5 — Adjusted Confidence (line ~180-195):
```python
comp_model = base_confidence * ML_MODEL_WEIGHT
comp_ndvi = (ndvi_score * 100 if available else base_confidence) * NDVI_WEIGHT
comp_soil = soil_score * SOIL_WEIGHT
comp_weather = weather_score * WEATHER_WEIGHT
adjusted_confidence = comp_model + comp_ndvi + comp_soil + comp_weather
adjusted_confidence += ndvi_adjust * NDVI_WEIGHT   # additive delta
adjusted_confidence = max(0, min(100, adjusted_confidence))
```

### Typical Real-World Values

For a moderate scenario (N=50, P=50, K=50, temp=25, rain=500, no NDVI):
- `base_model_confidence` ≈ 37% (real model probability)
- NO NDVI → `comp_ndvi` = 37% * 0.20 = 7.4%
- No soil match → `comp_soil` = 40 * 0.10 = 4%
- `comp_weather` = 100 * 0.05 = 5%
- `adjusted_confidence` = 0.37*0.65 + 0.37*0.20 + 4 + 5 = 24.05 + 7.4 + 4 + 5 = **~40.5%**

With Healthy NDVI (adds 15 * 0.20 = 3%):
- `adjusted_confidence` ≈ **~43.5%**

### Frontend Display

**Current state** (post-rebuild): Both values are shown honestly:
- `base_model_confidence` — labeled "Raw ML model output score"
- `adjusted_confidence` — labeled "Composite score (model + weather + soil)"
- Overall gauge uses `Math.min(base_model_confidence, adjusted_confidence)` — conservative/truthful

**ConfidenceGauge component** (`frontend/src/components/ConfidenceGauge.tsx`):
- SVG arc (half-circle) with stroke-dasharray animation
- Color thresholds: green ≥70%, amber ≥40%, red <40%
- Displays clamped percentage value

### Is the Calculation Scientifically Justifiable?

| Component | Scientific Basis | Verdict |
|-----------|-----------------|---------|
| Base ML confidence | Real RandomForest probability | ✅ **Valid** |
| NDVI adjustment (±15% heuristic) | Reasonable but not field-validated | ⚠️ **Weak** — Not derived from agronomic trials |
| Soil score (100/40/50 for 6/22 crops) | Covers only 27% of crops. Hardcoded. | ❌ **Poor** — 16 crops always get neutral score |
| Weather score (generic formula) | Same formula for ALL crops | ❌ **Poor** — Doesn't differentiate heat-tolerant vs cold-loving crops |
| Weight combination (65/20/10/5) | Arbitrary weights, not optimized | ⚠️ **Arbitrary** — No cross-validation to determine optimal weighting |

### Recommendation

The label **"Adjusted Confidence"** is misleading because the 65/20/10/5 weighting system is not scientifically validated. Recommend relabeling to **"Suitability Score"** with an honest explanation: *"A composite score combining ML model probability (65%), vegetation health via satellite NDVI (20%), soil type compatibility (10%), and weather conditions (5%). Not a statistically validated prediction."*

### Verdict
⚠️ **MODERATE CONCERN**. Frontend display is now honest (shows both values, uses lower for gauge). The backend formula is a reasonable heuristic but lacks scientific validation. Soil compatibility covers only 27% of crops. Recommend relabeling to "Suitability Score".

---

## PART 4 — Agronomic Validation

### Model Details
- **Algorithm**: RandomForestClassifier (loaded via joblib)
- **Classes**: 22 crops
- **Location**: `backend/models/crop_model.pkl`

### Crop Classes Available

| Present in Model | NOT in Model |
|-----------------|--------------|
| apple, banana, blackgram, chickpea, coconut, coffee, cotton, grapes, jute, kidneybeans, lentil, maize, mango, mothbeans, mungbean, muskmelon, orange, papaya, pigeonpeas, pomegranate, rice, watermelon | **wheat, barley, sugarcane, groundnut**, sorghum, millet, tea, rubber, sunflower, sesame |

### 25 Scenario Results

| # | Scenario | N | P | K | Temp | Rain | pH | Soil | **Predicted** | **Confidence** | Top 3 | Plausible? |
|---|----------|---|---|---|------|------|----|------|-------------|--------------|-------|-----------|
| 1 | Rice — Kerala/Alluvial/High rain | 80 | 40 | 30 | 28 | 2500 | 6.5 | alluvial | **RICE** | **58%** | rice, banana, coffee | ✅ Yes |
| 2 | Rice — Punjab/Alluvial/Moderate | 60 | 30 | 30 | 22 | 500 | 7.0 | alluvial | **RICE** | **48%** | rice, jute, banana | ✅ Yes |
| 3 | Rice — West Bengal/Clay/Wet | 40 | 20 | 20 | 26 | 1800 | 6.0 | clay | **RICE** | **48%** | rice, papaya, jute | ✅ Yes |
| 4 | Wheat — Punjab/Loamy/Cool | 60 | 30 | 30 | 12 | 400 | 7.0 | loamy | **COFFEE** | **32%** | coffee, rice, jute | ❌ Wheat not in model |
| 5 | Wheat — Haryana/Loamy/Mild | 50 | 25 | 25 | 15 | 300 | 7.5 | loamy | **COFFEE** | **31%** | coffee, rice, jute | ❌ Wheat not in model |
| 6 | Arid — Rajasthan/Sandy/Dry | 10 | 10 | 10 | 35 | 200 | 8.0 | sandy | **KIDNEYBEANS** | **47%** | kidneybeans, mothbeans, orange | ⚠️ Unlikely in extreme heat |
| 7 | Arid — Rajasthan/Sandy/Extreme | 5 | 5 | 5 | 40 | 100 | 8.5 | sandy | **MOTHBEANS** | **35%** | mothbeans, kidneybeans, orange | ⚠️ Mothbeans drought-tolerant — plausible |
| 8 | Semi-arid — Gujarat/Black/Low | 20 | 15 | 10 | 30 | 400 | 7.5 | black | **MANGO** | **45%** | mango, coffee, coconut | ⚠️ Mango possible but marginal |
| 9 | NE India/Red/Extreme Wet | 30 | 15 | 15 | 24 | 3500 | 5.5 | red | **COCONUT** | **36%** | coconut, rice, papaya | ✅ Yes |
| 10 | Coastal/Clay/Humid | 40 | 30 | 20 | 28 | 2000 | 6.0 | clay | **RICE** | **37%** | rice, papaya, coconut | ✅ Yes |
| 11 | Coffee — Karnataka/Red | 80 | 40 | 40 | 22 | 1200 | 6.0 | red | **RICE** | **75%** | rice, jute, banana | ❌ Predicts rice for coffee region |
| 12 | High altitude — HP/Cold | 40 | 20 | 20 | 12 | 800 | 6.5 | loamy | **COFFEE** | **28%** | coffee, rice, jute | ❌ Coffee doesn't grow at 12°C |
| 13 | Acidic soil/Laterite | 30 | 20 | 20 | 26 | 1500 | 4.5 | laterite | **COFFEE** | **37%** | coffee, mango, rice | ⚠️ pH 4.5 too low even for acid-loving |
| 14 | Alkaline soil/High pH | 40 | 30 | 30 | 28 | 600 | 8.5 | clay | **MANGO** | **42%** | mango, apple, coconut | ⚠️ Mango tolerates but marginal |
| 15 | Extreme low NPK | 0 | 0 | 0 | 30 | 800 | 6.5 | sandy | **ORANGE** | **32%** | orange, pigeonpeas, mango | ❌ Orange on degraded soil unlikely |
| 16 | Extreme high NPK | 200 | 200 | 200 | 25 | 500 | 7.0 | loamy | **APPLE** | **33%** | apple, grapes, banana | ❌ Apple needs cold climate not reflected |
| 17 | High N only | 160 | 20 | 20 | 28 | 800 | 6.5 | loamy | **COFFEE** | **91%** | coffee, rice, jute | ⚠️ 91% from N alone suggests overfit |
| 18 | High K only | 20 | 20 | 160 | 28 | 800 | 6.5 | loamy | **MANGO** | **20%** | mango, apple, grapes | ⚠️ Very low confidence |
| 19 | High P only | 20 | 160 | 20 | 28 | 800 | 6.5 | loamy | **PIGEONPEAS** | **26%** | pigeonpeas, apple, grapes | ⚠️ Low confidence |
| 20 | Maize — UP/Alluvial | 60 | 30 | 30 | 25 | 700 | 7.0 | alluvial | **COFFEE** | **37%** | coffee, jute, rice | ❌ Predicts coffee for maize region |
| 21 | Cotton — Maharashtra/Black/Dry | 40 | 30 | 30 | 32 | 400 | 7.5 | black | **COFFEE** | **48%** | coffee, rice, jute | ❌ Predicts coffee for cotton region |
| 22 | Moderate all-around | 50 | 50 | 50 | 25 | 800 | 7.0 | loamy | **COFFEE** | **72%** | coffee, rice, mango | ❌ Coffee dominates generic conditions |
| 23 | Moderate #2 | 60 | 40 | 30 | 28 | 900 | 6.5 | loamy | **COFFEE** | **59%** | coffee, rice, jute | ❌ Coffee dominates |
| 24 | Tropical coastal/Sandy | 30 | 20 | 20 | 30 | 2000 | 6.0 | sandy | **COCONUT** | **24%** | coconut, pomegranate, papaya | ✅ Yes |
| 25 | Kerala/Loamy/Wet | 40 | 30 | 30 | 28 | 2500 | 6.5 | loamy | **RICE** | **32%** | rice, banana, papaya | ⚠️ Banana is #2 but rice wins |

### Prediction Distribution

| Crop | Times Predicted | % of Scenarios |
|------|----------------|----------------|
| Coffee | 9 | 36% |
| Rice | 6 | 24% |
| Mango | 3 | 12% |
| Coconut | 2 | 8% |
| Kidneybeans | 1 | 4% |
| Mothbeans | 1 | 4% |
| Orange | 1 | 4% |
| Apple | 1 | 4% |
| Pigeonpeas | 1 | 4% |

### Never Predicted (13 of 22 classes = 59%)

banana, blackgram, chickpea, cotton, grapes, jute, lentil, maize, mungbean, muskmelon, papaya, pomegranate, watermelon

### Key Risks

1. **Coffee dominates (36%)** — Predicted for wheat regions, cotton regions, maize regions, cold high-altitude, and generic conditions. All agronomically implausible. Strong indication of class imbalance in training data.

2. **13 dead classes (59%)** — More than half the model's output space never activates in realistic scenarios. These crops exist in the model but are never the #1 recommendation.

3. **Missing staple crops** — Wheat, barley, sugarcane, and groundnut are NOT in the model. These are major Indian crops — farmers growing these would receive completely wrong recommendations.

4. **Low base confidence** — Only 3/25 scenarios exceeded 60% base confidence. Most predictions are in the 30-48% range.

5. **NPK overfitting** — "High N only" (scenario 17) produces 91% coffee confidence. This suggests the model heavily weights N rather than multi-factor agronomic reasoning.

### Verdict
⚠️ **HIGH CONCERN**. The model is usable for regions where rice or coffee are the target crops, but fails entirely for wheat, sugarcane, maize, and cotton regions. The prediction distribution is highly skewed. **NOT RECOMMENDED for production agriculture without retraining.**

---

## PART 5 — Deployment Audit

### Configuration Files

| Check | Status | Details |
|-------|--------|---------|
| **`frontend/.env.local`** | ✅ PASS | `NEXT_PUBLIC_API_URL=https://crop-recommendation-system2-clean.onrender.com` — production Render URL |
| **`frontend/next.config.ts`** | ✅ PASS | Empty/minimal default config. No broken entries. |
| **`frontend/package.json`** | ✅ PASS | `"build": "next build"` present. Dependencies: lucide-react ^1.17.0, next 16.2.7, react 19.2.4 |
| **Root `.gitignore`** | ✅ PASS | Includes: `.env`, `.env.local`, `venv`, `node_modules`, `.next`, `__pycache__`, `.DS_Store` |
| **Frontend `.gitignore`** | ✅ PASS | Includes: `.env*`, `/node_modules`, `/.next/`, `/out`, `.vercel` |
| **`vercel.json`** | ⚠️ | **File does not exist.** Vercel will auto-detect Next.js, but no explicit deployment config. |
| **Render sleep handling** | ✅ PASS | All 3 API pages (recommend, NDVI, fertilizer) handle Render cold-start correctly |

### API URL Analysis
- `.env.local` URL: `https://crop-recommendation-system2-clean.onrender.com`
- Production Render ✅ (not localhost)
- No fallback to localhost in code — API calls use `process.env.NEXT_PUBLIC_API_URL`

### Deployment Flow
1. Frontend is hosted on **Vercel** (configured via Git integration)
2. Backend API is hosted on **Render** (Render URL in `.env.local`)
3. No `vercel.json` — acceptable since Next.js auto-detection works
4. Build script: `npm run build` → `next build`
5. TypeScript strict mode enabled in `tsconfig.json`

### Verdict
✅ **PASS**. All deployment configs are correct. API URL targets production Render. Build pipeline is standard Next.js. Render sleep detection is implemented.

---

## PART 6 — Full Project Trust Audit

### Trust-Damaging Pattern Search

**Pattern 1**: `fake|mock|sample|dummy|placeholder|TODO|FIXME|hack|temp|portfolio|demo|test data`

**Result**: No trust-damaging patterns found. Only benign matches:
- HTML `placeholder` attribute in `<Input>` components (e.g., `placeholder="e.g. 28.6139"`)
- `temperature` — natural language in form descriptions
- `"sample"` — only as part of natural language text (not code artifacts)

**Pattern 2**: `hello@|your-org|example.com`

**Result**: **Zero matches** (exit code 1). ✅ Clean.

### FAQ Accuracy Check

| FAQ Question | Claim | Reality | Issue |
|-------------|-------|---------|-------|
| Q3: "How accurate is the adjusted confidence score?" | "Adjusted confidence score...typically in the 85-95% range" | Base confidence is ~30-48%; adjusted is ~35-55%. 85-95% is NOT achieved. | ❌ **Fabricated claim** |
| Q6: "What does a fertilizer recommendation include?" | "Application rate in kg/ha...nutrient composition percentages" | API returns only `fertilizer`, `reason`, `npk_deficit`, `crop_optimal`. NO application rate or composition. | ❌ **Fabricated claim** |
| Q8: "Is this a portfolio or demo project?" | "The project demonstrates end-to-end integration..." | Reads as portfolio/demo language despite saying "not a demo" | ⚠️ **Minor** |

### Other Findings

| Issue | Location | Severity |
|-------|----------|----------|
| Footer "Documentation" link points to `/` (homepage) | `Footer.tsx` | **Low** — Dead navigation link |
| Navbar "Admin" link visible in production | `Navbar.tsx` | **Low** — Shows Coming Soon page anyway |

### Verdict
✅ **CODE CLEAN**. No fabricated data patterns, no mock/placeholder code, no fake email addresses remain in the codebase. The FAQ has 2 inaccurate claims that should be corrected.

---

## SUMMARY

### 1. Remaining Issues

| # | Issue | Severity | Location | Action Needed |
|---|-------|----------|----------|---------------|
| 1 | NDVI "Interactive Satellite Map" is CSS gradient, not real tiles | **Medium** | `ndvi/page.tsx:178-200` | Relabel or add disclaimer |
| 2 | FAQ claims 85-95% adjusted confidence (not achieved) | **Medium** | `faq/page.tsx` (Q3) | Correct to honest range |
| 3 | FAQ claims fertilizer API provides application rate/composition (it doesn't) | **Medium** | `faq/page.tsx` (Q6) | Correct to actual API fields |
| 4 | Footer "Documentation" link → `/` (homepage) | **Low** | `Footer.tsx` | Remove or route to actual docs |
| 5 | Soil compatibility covers only 6/22 crops (27%) | **Low** | `backend/src/api.py` | Expand compatibility dictionary |
| 6 | No `vercel.json` | **Low** | Missing file | Add explicit Vercel config if needed |

### 2. Critical Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | **Coffee dominance (36%)** — Model over-predicts coffee for wheat, maize, cotton regions | **High** — Farmers receive wrong recommendations | Retrain model with balanced dataset |
| 2 | **13 dead classes (59%)** — Model never recommends banana, cotton, maize, grapes, etc. | **Medium** — Model output space is effectively ~9 crops | Investigate class imbalance, feature engineering |
| 3 | **Wheat/barley/sugarcane absent** — Major Indian crops not in model | **High** — Excludes most Indian farmers | Add these crops to model classes |
| 4 | **Base confidence rarely >50%** — Low signal strength | **Medium** — Recommendations lack confidence | Model retraining or alternative algorithm |
| 5 | **FAQ contains fabricated claims** (85-95% confidence, fertilizer fields) | **Medium** — Trust at risk if users verify | Immediate text correction |

### 3. Production Readiness Score

| Category | Score (0-100) | Rationale |
|----------|---------------|-----------|
| Visual QA | **95/100** | Clean layouts, responsive, no z-index issues, no clipping |
| NDVI Trust | **60/100** | Real data pipeline but mislabeled map visualization, no disclaimer |
| Confidence Audit | **75/100** | Honest frontend display; backend formula is heuristic without validation |
| Agronomic Validation | **40/100** | Coffee dominance, 59% dead classes, missing staple crops |
| Deployment Audit | **90/100** | All configs correct, API points to production, build script present |
| Trust Audit | **85/100** | Code is clean; FAQ has 2 inaccurate claims |

**Overall Score: 74/100**

### 4. Verdict

⚠️ **NOT FULLY PRODUCTION READY**

The frontend codebase is well-structured, recently cleaned of all fabricated features, and visually professional. The deployment configuration is correct and the API pipeline functions correctly.

However, **three blockers** prevent production readiness:

1. **ML Model Quality** — The RandomForest model has serious agronomic validity concerns: coffee dominance (36%), 59% dead classes, and missing staple crops (wheat, barley, sugarcane). The model is not suitable for production Indian agriculture without retraining.

2. **NDVI Map Mislabeling** — The "Interactive Satellite Map" is a CSS gradient with grid overlay. Requires honest relabeling.

3. **FAQ Inaccuracies** — Two FAQ answers contain fabricated claims (85-95% confidence, fertilizer application rate/composition) that contradict actual system behavior.

### Recommended Actions (Priority Order)

1. **Immediate** — Correct FAQ Q3 and Q6 to reflect actual system behavior
2. **Immediate** — Relabel NDVI map or add illustrative disclaimer
3. **Short-term** — Retrain ML model with balanced class distribution and add missing crops
4. **Short-term** — Remove or fix the dead "Documentation" footer link
5. **Medium-term** — Expand soil compatibility database beyond 6 crops
6. **Medium-term** — Conduct field validation study to calibrate confidence formula weights