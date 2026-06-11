# Frontend Implementation Plan — Smart Crop Engine

> **Scope**: Portfolio-ready frontend showcasing existing backend capabilities
> **Target**: Recruiters + Hiring Managers evaluating full-stack ability
> **Backend**: ✅ Complete, deployed on Render — DO NOT TOUCH

---

## Deliverables

| # | Item | Type | Status |
|---|------|------|--------|
| 1 | Landing Page (SaaS repositioned + Infrastructure section) | Refactor | ⬜ |
| 2 | Crop Recommendation Page (+ response time) | Refactor | ⬜ |
| 3 | NDVI Intelligence Page (+ response time) | Refactor | ⬜ |
| 4 | Fertilizer Advisor Page (+ response time) | Refactor | ⬜ |
| 5 | About Page | New | ⬜ |
| 6 | FAQ Page | New | ⬜ |
| 7 | Contact Page | New | ⬜ |
| 8 | Navbar (extended) | Refactor | ⬜ |
| 9 | Footer (extended) | Refactor | ⬜ |
| 10 | Shared Component Library | New | ⬜ |
| 11 | API Integration Layer | New | ⬜ |
| 12 | Mobile + Tablet + Desktop Responsive | Verify | ⬜ |
| 13 | Dark/Light Theme (already exists) | Verify | ⬜ |
| 14 | Deployment Readiness (Vercel) | Verify | ⬜ |

---

## Implementation Order

```
Phase 1: Design System Tokens        → globals.css
Phase 2: Shared Components           → Button, Input, Card, Badge, PageHeader,
                                       ProgressBar, EmptyState, ErrorState, ResponseTime
Phase 3: Landing Page + Infrastructure → page.tsx
Phase 4: Crop Recommendation         → recommend/page.tsx
Phase 5: NDVI Intelligence           → ndvi/page.tsx
Phase 6: Fertilizer Advisor          → fertilizer/page.tsx
Phase 7: About + FAQ + Contact       → 3 new pages
Phase 8: Navbar + Footer             → Navbar.tsx, Footer.tsx
Phase 9: API Integration Layer       → lib/api.ts, types/api.ts
Phase 10: Deployment Verification    → build, type-check, responsive, API test
```

---

## Backend API Contract (Immutable)

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/predict` | POST | `{N,P,K,temperature,humidity,ph,rainfall,soil_type,lat?,lon?}` | `{recommended_crop, base_model_confidence, adjusted_confidence, ndvi_score?, ndvi_health?, soil_match, weather_score, input_parameters, explanation}` |
| `/ndvi` | GET | `?lat=&lon=` | `{ndvi_score, health_status, imagery_date, source}` |
| `/api/v1/fertilizer` | POST | `{crop, N, P, K}` | `{fertilizer_name, composition, amount_kg_per_ha, reason, npk_deficits}` |
| `/` | GET | — | `{message: "Crop Recommendation API Running"}` |

---

## File Manifest

### 🆕 Create
```
src/app/about/page.tsx
src/app/faq/page.tsx
src/app/contact/page.tsx
src/app/loading.tsx
src/app/error.tsx
src/app/not-found.tsx
src/components/Button.tsx
src/components/Input.tsx
src/components/Card.tsx
src/components/Badge.tsx
src/components/PageHeader.tsx
src/components/ProgressBar.tsx
src/components/EmptyState.tsx
src/components/ErrorState.tsx
src/components/ResponseTime.tsx
src/lib/api.ts
src/types/api.ts
```

### 🔄 Modify
```
src/app/globals.css         — enterprise tokens
src/app/page.tsx            — SaaS landing + Infrastructure section
src/app/recommend/page.tsx  — refactor + response time
src/app/ndvi/page.tsx       — refactor + response time
src/app/fertilizer/page.tsx — refactor + response time
src/components/Navbar.tsx   — add nav links
src/components/Footer.tsx   — extend
```

### ✅ Keep As-Is
```
layout.tsx, ThemeProvider.tsx, ThemeToggle.tsx, Toast.tsx,
Skeleton.tsx, StatCard.tsx, ConfidenceGauge.tsx, NdviGauge.tsx,
next.config.ts, tsconfig.json, postcss.config.mjs, next-env.d.ts
```