# Suitability Score Transparency Audit

**Date:** June 2025  
**Scope:** Review all UI text related to suitability scores in `frontend/src/app/recommend/page.tsx`  
**Task:** Check if any wording implies scientific certainty rather than "composite ranking score"

---

## Files Reviewed

- `frontend/src/app/recommend/page.tsx` (929 lines) — sole frontend display for crop recommendation results

---

## Wording Assessment

### 1. "Suitability" Score Label
**Location:** Line 628 (`{cropItem.suitability_score.toFixed(0)}`)  
**Context:** Displayed as a large number next to an `Award` icon, inside each crop result card.  
**Assessment:** NEUTRAL — The label "Suitability" alone does not imply scientific certainty. It is a single-word heading for a numeric score. The surrounding context (explanation sections, uncertainty badges, component breakdown) clarifies it as a composite ranking measure.

### 2. Supported Crops Description
**Location:** Line 862  
**Wording:** `"These are the {22} crops the model can predict. Results are ranked by a composite suitability score combining ML probability, soil compatibility, and environmental factors."`  
**Assessment:** ✅ GOOD — This explicitly uses "composite suitability score" and enumerates the components. This is exactly the right language — transparent, non-certainty-implying, and informative.

### 3. Confidence Labels
**Location:** Lines 323-326  
**Wording:** `"High Confidence"` (≥70), `"Moderate Confidence"` (40-69), `"Low Confidence"` (<40)  
**Assessment:** ✅ ACCEPTABLE — These are industry-standard ML confidence descriptors applied to the model's probability output. They refer specifically to "Model Confidence" (line 640) — not to agronomic certainty.

### 4. Uncertainty Badges
**Location:** Lines 329-336 (`getUncertaintyBadge`)  
**Wording:** `"Low Uncertainty"`, `"Medium Uncertainty"`, `"High Uncertainty"`  
**Assessment:** ✅ GOOD — Uncertainty is explicitly labeled as such, derived from entropy-based classification. This transparently communicates that the model's confidence varies.

### 5. "Top Prediction Confidence"
**Location:** Line 566-567  
**Wording:** `"Top Prediction Confidence"` displayed next to the `ConfidenceGauge` component  
**Assessment:** ✅ GOOD — The phrase specifically qualifies this as "prediction confidence" (not scientific certainty). The gauge shows the highest ML probability among the top 5 crops.

### 6. Page Subtitle
**Location:** Line 374  
**Wording:** `"AI-powered crop prediction based on soil and weather parameters"`  
**Assessment:** ✅ ACCEPTABLE — Accurately describes the tool. "AI-powered" is a factual description of the ML model used.

---

## Verdict

**No wording changes required.** All suitability-related UI text already uses appropriate language:

| Text | Verdict | Rationale |
|------|---------|-----------|
| "Suitability" label | ✅ Pass | Single-word heading, not certainty-implying |
| "Composite suitability score" description | ✅ Pass | Explicitly describes ranking methodology |
| "High/Moderate/Low Confidence" | ✅ Pass | Standard ML terminology for model probability |
| "Low/Medium/High Uncertainty" | ✅ Pass | Transparency about model confidence variation |
| "Top Prediction Confidence" | ✅ Pass | Qualifies as "prediction confidence" |
| "AI-powered crop prediction" | ✅ Pass | Factual description |

The UI does not contain any wording that implies scientific certainty such as:
- "scientifically proven"
- "guaranteed yield"
- "100% accurate"
- "optimal crop" (without qualification)
- "definitive recommendation"

The existing language consistently frames results as **model predictions ranked by a composite score** — not as absolute agronomic truths.

---

## No Fixes Applied

Since all wording was found appropriate, no UI label changes were made. Scoring logic was not touched per task requirements.