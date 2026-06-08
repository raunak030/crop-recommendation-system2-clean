# Frontend Redesign Strategy — Google Stitch

> **Project:** Crop Recommendation System 2 Clean  
> **Current Frontend:** Single-page Next.js (Tailwind CSS)  
> **Target Platform:** Google Stitch AI-generated UI  
> **Status:** Strategy Document v1.0

---

## Table of Contents

1. [Information Architecture](#1-information-architecture)
2. [Component Architecture](#2-component-architecture)
3. [Dashboard Design](#3-dashboard-design)
4. [Mobile Design](#4-mobile-design)
5. [Google Stitch Prompt](#5-google-stitch-prompt)
6. [Screens Required](#6-screens-required)
7. [Frontend Completion Estimate](#7-frontend-completion-estimate)
8. [Appendix: Current API Reference](#8-appendix-current-api-reference)

---

## 1. Information Architecture

### 1.1 Site Map

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CROP RECOMMENDATION SYSTEM                     │
│                          AgriTech SaaS Platform                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   LANDING    │  │    CROP      │  │    NDVI      │  │ FERTILIZER│ │
│  │    PAGE      │──│RECOMMENDATION│──│  ANALYSIS    │──│  ADVISOR  │ │
│  │  (Home/Landing)│ │  (Core)     │  │  (Satellite) │  │ (Future)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘ │
│        │                                                              │
│        └────────────────────────┬─────────────────────────────────────┤
│                                 │                                     │
│                        ┌───────┴───────┐                             │
│                        │    ABOUT      │                             │
│                        │   PROJECT     │                             │
│                        │  (Info/Team)  │                             │
│                        └───────────────┘                             │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                    GLOBAL COMPONENTS                              │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│ │
│  │  │  NAVBAR  │ │  FOOTER  │ │  SEARCH  │ │  THEME   │ │ USER   ││ │
│  │  │          │ │          │ │  /FILTER │ │ TOGGLE   │ │ AUTH   ││ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘│ │
│  └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.2 Page Inventory

| # | Page | Slug | Priority | Status | API Dependencies |
|---|------|------|----------|--------|-----------------|
| 1 | Landing Page | `/` | **P0** | New | None (static) |
| 2 | Crop Recommendation | `/recommend` | **P0** | Redesign | `POST /predict` |
| 3 | NDVI Analysis | `/ndvi` | **P0** | Redesign | `GET /ndvi` |
| 4 | Fertilizer Advisor | `/fertilizer` | **P1** | New (Future) | `POST /api/v1/fertilizer` |
| 5 | About Project | `/about` | **P2** | New | None (static) |

**Priority Definitions:**
- **P0:** Required for MVP portfolio launch
- **P1:** High-value addition, planned next iteration
- **P2:** Nice-to-have, low effort

---

## 2. Component Architecture

### 2.1 Page: Landing Page (`/`)

**Purpose:** First impression — showcase product value, guide users to core features.

```
┌─────────────────────────────────────────────────────────────────┐
│  LANDING PAGE                                                    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  HeroSection                                                 │ │
│  │  ├── ProductLogo + Tagline                                   │ │
│  │  ├── Headline: "AI-Powered Crop Intelligence for Modern      │ │
│  │  │            Farming"                                       │ │
│  │  ├── Subtitle: "Leverage satellite imagery and ML models     │ │
│  │  │            to make data-driven farming decisions"         │ │
│  │  ├── CTA Button: "Get Started →" (links to /recommend)      │ │
│  │  └── Background: Animated hero graphic (NDVI heatmap or     │ │
│  │                   farmland illustration)                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  FeatureCards                                                │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │ │
│  │  │ 🌾 Crop      │ │ 🛰️ NDVI     │ │ 🧪 Fertilizer   │   │ │
│  │  │ Recommendation│ │ Satellite    │ │ Recommendation  │   │ │
│  │  │ ML-powered    │ │ Health       │ │ NPK deficit     │   │ │
│  │  │ predictions   │ │ Analysis     │ │ analysis        │   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  HowItWorks (3-step visual)                                 │ │
│  │  Step 1: Enter soil parameters                               │ │
│  │  Step 2: AI predicts best crop                               │ │
│  │  Step 3: Get fertilizer recommendations                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  StatsBar                                                     │ │
│  │  22 Crops Supported | 99.86% Model Accuracy | Real-time NDVI │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Footer (global)                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**
| Component | Inputs | Outputs | API |
|-----------|--------|---------|-----|
| `HeroSection` | None | Navigation to `/recommend` | None |
| `FeatureCard` | Icon, Title, Description | Click → route | None |
| `HowItWorks` | Step data array | Visual timeline | None |
| `StatsBar` | Stat data array | Animated counters | None |

---

### 2.2 Page: Crop Recommendation (`/recommend`)

**Purpose:** Core functionality — input soil/weather parameters, get ML-powered crop prediction with NDVI fusion.

```
┌─────────────────────────────────────────────────────────────────┐
│  CROP RECOMMENDATION PAGE                                       │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────────────────────┐ │
│  │  INPUT PANEL       │  │  RESULTS PANEL                     │ │
│  │                    │  │                                     │ │
│  │  ┌──────────────┐  │  │  ┌──────────────────────────────┐ │ │
│  │  │ LocationBar  │  │  │  │  RecommendedCropCard         │ │ │
│  │  │ GPS Button   │  │  │  │  ├── Crop name (large)       │ │ │
│  │  │ Auto-fill    │  │  │  │  ├── Confidence meter        │ │ │
│  │  └──────────────┘  │  │  │  ├── Adjusted vs Base bar    │ │ │
│  │                    │  │  │  └── Status badge             │ │ │
│  │  ┌──────────────┐  │  │  └──────────────────────────────┘ │ │
│  │  │ SoilForm     │  │  │                                     │ │
│  │  │ N / P / K    │  │  │  ┌──────────────────────────────┐ │ │
│  │  │ (sliders+inp)│  │  │  │  ConfidenceBreakdown        │ │ │
│  │  └──────────────┘  │  │  │  ├── ML Weight (65%) bar    │ │ │
│  │                    │  │  │  ├── NDVI Weight (20%) bar  │ │ │
│  │  ┌──────────────┐  │  │  │  ├── Soil (10%) bar         │ │ │
│  │  │ WeatherForm  │  │  │  │  └── Weather (5%) bar       │ │ │
│  │  │ Temperature  │  │  │  └──────────────────────────────┘ │ │
│  │  │ Humidity     │  │  │                                     │ │
│  │  │ pH / Rainfall│  │  │  ┌──────────────────────────────┐ │ │
│  │  └──────────────┘  │  │  │  InputParametersTable       │ │ │
│  │                    │  │  │  Key-value display of all    │ │ │
│  │  ┌──────────────┐  │  │  │  submitted parameters       │ │ │
│  │  │ SoilType     │  │  │  └──────────────────────────────┘ │ │
│  │  │ Dropdown     │  │  │                                     │ │
│  │  └──────────────┘  │  │  ┌──────────────────────────────┐ │ │
│  │                    │  │  │  ExplanationBox              │ │ │
│  │  ┌──────────────┐  │  │  │  Natural language "why"     │ │ │
│  │  │ PredictBtn   │  │  │  │  from backend response      │ │ │
│  │  │ (Full width) │  │  │  └──────────────────────────────┘ │ │
│  │  └──────────────┘  │  │                                     │ │
│  └────────────────────┘  └────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  NDVI SATELLITE SNIPPET (collapsible)                       │ │
│  │  Shows NDVI score + health status from current location      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**

| Component | Inputs | Outputs | API |
|-----------|--------|---------|-----|
| `LocationBar` | Click → GPS permission | lat, lon, location name, soil type auto-detect | Nominatim reverse geocode + Open-Meteo weather |
| `SoilForm` | N, P, K values (slider + number input) | Form state | None |
| `WeatherForm` | Temperature, Humidity, pH, Rainfall | Form state | Open-Meteo (auto-populated via GPS) |
| `SoilTypeDropdown` | Soil type selection | Selected soil type | None |
| `PredictButton` | All form fields validated | POST request | `POST /predict` |
| `RecommendedCropCard` | API response | Crop name, confidence, visual bar | Part of /predict response |
| `ConfidenceBreakdown` | ML/NDVI/Soil/Weather components | Stacked bar chart | /predict response components |
| `InputParametersTable` | submitted_params dict | Key-value table | part of /predict response |
| `ExplanationBox` | explanation string | Formatted insight text | part of /predict response |
| `NDVISnippet` | lat, lon | NDVI score + health status | `GET /ndvi` |

---

### 2.3 Page: NDVI Analysis (`/ndvi`)

**Purpose:** Dedicated satellite vegetation health analysis page — map-first experience.

```
┌─────────────────────────────────────────────────────────────────┐
│  NDVI ANALYSIS PAGE                                             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  MapPanel (60% width)                                       │ │
│  │  ├── Map component with selectable pin                      │ │
│  │  ├── Click/drag to set location                             │ │
│  │  ├── NDVI heatmap overlay (future)                          │ │
│  │  └── Current location marker                                │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  NDVI Results Panel (40% width / side drawer)               │ │
│  │                                                               │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │  LocationInfo                                          │ │ │
│  │  │  ├── Coordinates display                               │ │ │
│  │  │  ├── Google Maps-style location name                   │ │ │
│  │  │  └── "Analyze This Location" button                    │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                                                               │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │  NDVIScoreGauge                                        │ │ │
│  │  │  ├── Large circular gauge / speedometer (0.0 – 1.0)   │ │ │
│  │  │  ├── Color scale: red → yellow → green                │ │ │
│  │  │  ├── Current value: 0.188                              │ │ │
│  │  │  └── Health badge: Healthy / Moderate / Poor / V.Poor │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                                                               │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │  NDVIDetails                                           │ │ │
│  │  │  ├── Imagery Acquisition Date                          │ │ │
│  │  │  ├── Satellite Source (Sentinel-2)                     │ │ │
│  │  │  ├── NDVI Formula: (B8 - B4) / (B8 + B4)              │ │ │
│  │  │  └── Data freshness indicator                         │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                                                               │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │  HistoricalTrend (Future)                              │ │ │
│  │  │  ├── Line chart of NDVI over past 12 months           │ │ │
│  │  │  └── Compare with optimal crop growth curve           │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**

| Component | Inputs | Outputs | API |
|-----------|--------|---------|-----|
| `MapPanel` | Click/drag coordinates | lat, lon | None (interactive) |
| `NDVIScoreGauge` | ndvi_score (0.0-1.0) | Visual gauge + color + badge | `GET /ndvi` |
| `LocationInfo` | lat, lon | Reverse geocoded name | Nominatim |
| `NDVIDetails` | acq_date, source | Info panel | part of /ndvi response |
| `HistoricalTrend` | (future) NDVI time series | Line chart | Future endpoint |

---

### 2.4 Page: Fertilizer Advisor (`/fertilizer`) — Future

**Purpose:** Recommend specific fertilizers based on crop + NPK deficit analysis.

```
┌─────────────────────────────────────────────────────────────────┐
│  FERTILIZER ADVISOR PAGE (Future)                                │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────────────────────┐ │
│  │  INPUT PANEL       │  │  RESULTS PANEL                     │ │
│  │                    │  │                                     │ │
│  │  ┌──────────────┐  │  │  ┌──────────────────────────────┐ │ │
│  │  │ CropSelector │  │  │  │  FertilizerCard             │ │ │
│  │  │ 24 crops     │  │  │  │  ├── Fertilizer name        │ │ │
│  │  └──────────────┘  │  │  │  ├── NPK composition        │ │ │
│  │                    │  │  │  └── Application rate       │ │ │
│  │  ┌──────────────┐  │  │  └──────────────────────────────┘ │ │
│  │  │ NPKInputs    │  │  │                                     │ │
│  │  │ N / P / K    │  │  │  ┌──────────────────────────────┐ │ │
│  │  │ (sliders)    │  │  │  │  NPKDeficitChart            │ │ │
│  │  └──────────────┘  │  │  │  ├── Current vs Optimal bar │ │ │
│  │                    │  │  │  ├── N deficit: -70 kg/ha   │ │ │
│  │  ┌──────────────┐  │  │  │  ├── P deficit: -30 kg/ha  │ │ │
│  │  │ GetBtn       │  │  │  │  └── K deficit: -20 kg/ha  │ │ │
│  │  └──────────────┘  │  │  └──────────────────────────────┘ │ │
│  └────────────────────┘  │                                     │ │
│                           │  ┌──────────────────────────────┐ │ │
│                           │  │  CropOptimalTable            │ │ │
│                           │  │  Shows ICAR/FAO optimal NPK  │ │ │
│                           │  └──────────────────────────────┘ │ │
│                           └────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**

| Component | Inputs | Outputs | API |
|-----------|--------|---------|-----|
| `CropSelector` | 24-crop dropdown | Selected crop | None |
| `NPKInputs` | N, P, K slider/input | Form state | None |
| `FertilizerCard` | API response | Fertilizer name + composition | `POST /api/v1/fertilizer` |
| `NPKDeficitChart` | Optimal vs current NPK | Horizontal bar chart | part of /fertilizer response |
| `CropOptimalTable` | crop | ICAR/FAO NPK table | Static data |

---

### 2.5 Page: About Project (`/about`)

**Purpose:** Portfolio context — explain the tech stack, methodology, and data sources.

```
┌─────────────────────────────────────────────────────────────────┐
│  ABOUT PROJECT                                                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  TechStackGrid                                              │ │
│  │  ├── FastAPI (Python backend)                               │ │
│  │  ├── Next.js (Current frontend)                             │ │
│  │  ├── scikit-learn (Random Forest model)                     │ │
│  │  ├── Google Earth Engine (Sentinel-2 NDVI)                 │ │
│  │  ├── Render (Deployment)                                    │ │
│  │  └── Google Stitch (Redesigned UI)                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  MethodologySection                                         │ │
│  │  ├── ML Pipeline: RandomForestClassifier on 2200 samples    │ │
│  │  ├── Weighted Fusion: ML(65%) + NDVI(20%) + Soil(10%)      │ │
│  │  │                 + Weather(5%)                            │ │
│  │  ├── NDVI Pipeline: Sentinel-2 → (B8-B4)/(B8+B4) → score   │ │
│  │  └── Fertilizer Engine: Rule-based NPK deficit analysis    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  ModelPerformanceCard                                       │ │
│  │  ├── Accuracy: 99.86% (22 crops)                           │ │
│  │  ├── Feature Importances bar chart                          │ │
│  │  └── Confusion matrix (simplified)                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  DataSourcesSection                                         │ │
│  │  ├── Crop recommendation: Kaggle dataset (2200 samples)     │ │
│  │  ├── NDVI: Sentinel-2 Level-2A (10m resolution)            │ │
│  │  ├── Weather: Open-Meteo API                                │ │
│  │  ├── Fertilizer: ICAR/FAO agronomy standards               │ │
│  │  └── NPK requirements: NRCS fertilizer guide                │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Dashboard Design

### 3.1 Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  TOP NAVBAR                                                    │ │
│  │  [Logo] [Recommend] [NDVI] [Fertilizer] [About]  [🌙 Theme]   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌──────┬─────────────────────────────────────────────────────────┐ │
│  │      │                                                         │ │
│  │ SIDE │                    MAIN CONTENT                         │ │
│  │ NAV  │                                                         │ │
│  │ (opt)│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │ │
│  │      │  │   Card   │ │   Card   │ │   Card   │               │ │
│  │      │  └──────────┘ └──────────┘ └──────────┘               │ │
│  │      │                                                         │ │
│  │      │  ┌──────────────────────────────────────────────────┐   │ │
│  │      │  │            CHART / VISUALIZATION                 │   │ │
│  │      │  └──────────────────────────────────────────────────┘   │ │
│  │      │                                                         │ │
│  │      │  ┌──────────────────────────────────────────────────┐   │ │
│  │      │  │            DATA TABLE                             │   │ │
│  │      │  └──────────────────────────────────────────────────┘   │ │
│  └──────┴─────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  FOOTER [GitHub] [Docs] [Terms] © 2026                         │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 Design System

| Element | Specification |
|---------|---------------|
| **Color Palette** | Green-primary (#166534 → #22c55e gradient), Earth-tones (amber, slate), White/gray backgrounds |
| **Typography** | Inter or Geist (clean, modern sans-serif) — headings bold, body regular |
| **Card Design** | White bg, subtle border (`border-slate-200`), rounded-xl, soft shadow |
| **Spacing** | 8px grid, 16px/24px gutters, generous whitespace |
| **Charts** | Recharts or Chart.js — bar charts for confidence breakdown, gauge for NDVI, line for historical |
| **Buttons** | Filled primary (green), outlined secondary, ghost for tertiary |
| **Inputs** | Sliders for NPK (with number display), text inputs with clear labels, dropdown for soil |
| **Icons** | Lucide icons (open-source, React-native compatible) — leaf, satellite, flask, map-pin, etc. |

### 3.3 Key UI Patterns

**Confidence Meter (Crop Recommendation Result):**
```
Recommended Crop:  🌾 Maize
Adjusted Confidence:  ████████████████░░░░  73.22%
Base Confidence:      ████████████████████  99.00%
                     ─────────────────────
                     ↓ NDVI -15% adjustment applied
```

**NDVI Gauge (NDVI Analysis Page):**
```
           ╭──────────╮
     Poor  │  0.188   │  Healthy
    ◄──────│  GAUGE   │──────►
   0.0     │          │     1.0
           ╰──────────╯
     Status: Poor  🟠
```

**NPK Deficit Bar (Fertilizer Advisor — Future):**
```
N: ████████████████░░░░░░░░  80/150  (-70 deficit)
P: ██████░░░░░░░░░░░░░░░░░  20/50   (-30 deficit)
K: ████████░░░░░░░░░░░░░░░  10/30   (-20 deficit)
```

### 3.4 Navigation Structure

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| **Top Nav** | Full horizontal menu | Condensed with hamburger | Hamburger only |
| **Side Nav** | Optional (for dashboard views) | Hidden (use top nav) | Hidden |
| **Breadcrumbs** | Show on interior pages | Show | Hide |
| **Active State** | Underline + bold | Underline | Bold text |

---

## 4. Mobile Design

### 4.1 Mobile UX (< 768px)

**Strategy:** Single-column stack, bottom navigation bar, full-width inputs.

```
┌────────────────────┐
│  [Logo]  [≡ Menu]  │  ← Minimal top bar
├────────────────────┤
│                    │
│  ┌──────────────┐  │
│  │  Input Field │  │  ← Full-width, stacked
│  └──────────────┘  │
│  ┌──────────────┐  │
│  │  Input Field │  │
│  └──────────────┘  │
│  ┌──────────────┐  │
│  │  Predict Btn │  │  ← Full-width CTA
│  └──────────────┘  │
│                    │
│  ┌──────────────┐  │
│  │  Result Card │  │  ← Cards stack vertically
│  └──────────────┘  │
│                    │
├────────────────────┤
│  [🏠] [🌾] [🛰️]   │  ← Bottom nav bar (3-4 icons)
└────────────────────┘
```

**Mobile-specific behaviors:**
- **GPS button** prominently placed at top — single tap to auto-fill all fields
- **Sliders** switch to number inputs on mobile (easier to tap precise values)
- **NDVI gauge** simplifies to a colored badge + score text (no circular gauge on small screens)
- **Predict button** is sticky at the bottom of the input area as user scrolls
- **Results** expand as a full-screen overlay rather than side panel
- **Bottom navigation** with 4 icons: Home, Recommend, NDVI, More

### 4.2 Tablet UX (768px — 1024px)

**Strategy:** 2-column split, side-by-side inputs, persistent nav.

```
┌──────────────────────────────────┐
│  [Logo]  [Nav Links]  [Theme]    │
├────────────────┬─────────────────┤
│   INPUT PANEL  │  RESULTS PANEL  │  ← 50/50 or 40/60 split
│                │                 │
│  ┌──────────┐  │  ┌───────────┐  │
│  │ GPS /    │  │  │ Crop Card │  │
│  │ Weather  │  │  └───────────┘  │
│  └──────────┘  │  ┌───────────┐  │
│  ┌──────────┐  │  │Confidence │  │
│  │ NPK Form │  │  │ Breakdown │  │
│  └──────────┘  │  └───────────┘  │
│  ┌──────────┐  │  ┌───────────┐  │
│  │ Predict  │  │  │ NDVI      │  │
│  └──────────┘  │  │ Snippet   │  │
│                │  └───────────┘  │
└────────────────┴─────────────────┘
```

**Tablet-specific behaviors:**
- **Side-by-side** layout: inputs left, results right
- **Top navigation** stays horizontal (no hamburger needed)
- **Map on NDVI page** takes full height on left, results panel on right

### 4.3 Desktop UX (> 1024px)

**Strategy:** Full 3-column or asymmetrical layout, maximum information density.

```
┌──────────────────────────────────────────────────────────────────┐
│  [Logo]  [Recommend]  [NDVI]  [Fertilizer]  [About]  [🌙 Theme] │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┬────────────────────────┬────────────────────────┐ │
│  │  INPUT   │      MAIN RESULT       │     SATELLITE INFO     │ │
│  │  PANEL   │                        │                        │ │
│  │          │  ┌──────────────────┐  │  ┌──────────────────┐  │ │
│  │  GPS     │  │  Crop Card       │  │  │ NDVI Score       │  │ │
│  │  ─────── │  │  Conf. bar       │  │  │ Gauge + Badge    │  │ │
│  │  N, P, K │  └──────────────────┘  │  └──────────────────┘  │ │
│  │  ─────── │                        │                        │ │
│  │  Temp    │  ┌──────────────────┐  │  ┌──────────────────┐  │ │
│  │  Humidity│  │  Explanation     │  │  │ Soil Match       │  │ │
│  │  pH      │  │  "why" text      │  │  │ Weather Score    │  │ │
│  │  Rain    │  └──────────────────┘  │  └──────────────────┘  │ │
│  │  ─────── │                        │                        │ │
│  │  Soil    │  ┌──────────────────┐  │  ┌──────────────────┐  │ │
│  │  ─────── │  │  Param Table     │  │  │ Recommendations │  │ │
│  │  Predict │  └──────────────────┘  │  │  (fertilizer)    │  │ │
│  └──────────┘                        │  └──────────────────┘  │ │
│                                      └────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Desktop-specific behaviors:**
- **3-column layout** for maximum data density on the /recommend page
- **Keyboard shortcuts** for power users (Enter to predict)
- **Hover tooltips** on every data point (confidence breakdown bars, NDVI gauge)
- **Print-friendly** result view for farmers who want paper reports
- **Map integration** on NDVI page takes full center column

---

## 5. Google Stitch Prompt

### 5.1 Primary Prompt (Full Suite — 5 Screens)

> **Copy and paste this into Google Stitch:**

```
DESIGN BRIEF: AgriTech SaaS Platform — Crop Recommendation System

PROJECT: AI-powered crop recommendation platform with satellite NDVI analysis.
TARGET USERS: Farmers, agronomists, agricultural extension officers.
BRAND VIBE: Professional, trustworthy, data-driven, modern. Green and earth tones.
PLATFORM: Responsive web — Desktop (1200px+), Tablet (768px), Mobile (375px).

COLOR PALETTE:
- Primary: Forest Green (#166534, #22c55e, #dcfce7)
- Secondary: Earth Amber (#92400e, #f59e0b)
- Neutral: Slate (#0f172a, #475569, #e2e8f0, #f8fafc)
- Semantic: Red (#dc2626) for "Very Poor", Amber (#d97706) for "Poor/Monitor", Green (#16a34a) for "Healthy/Good"
- Background: White (#ffffff) and Slate-50 (#f8fafc)

TYPOGRAPHY: Inter or Geist font. Headings: 700 weight, Body: 400 weight.
ICON SET: Lucide icons (Leaf, Satellite, FlaskConical, MapPin, Droplets, Thermometer, Gauge).

---

SCREEN 1: LANDING PAGE (Home)
- Hero section with headline: "AI-Powered Crop Intelligence for Modern Farming"
- Subhead: "Leverage satellite imagery and ML models to make data-driven farming decisions"
- Large green CTA button: "Get Started →" linking to /recommend
- Three feature cards in a row below hero:
  - 🌾 Crop Recommendation: "ML-powered predictions for 22 crops with 99.86% accuracy"
  - 🛰️ NDVI Satellite Analysis: "Real-time vegetation health from Sentinel-2 satellite imagery"
  - 🧪 Fertilizer Advisor: "Smart NPK deficit analysis and fertilizer recommendations"
- Three-step "How It Works" section with numbered steps and icons
- Stats bar: "22 Crops Supported | 99.86% Model Accuracy | Live NDVI Data"
- Clean footer with GitHub link, copyright 2026
- Background: Subtle farm/field pattern or gradient overlay

SCREEN 2: CROP RECOMMENDATION PAGE
Two-column layout:
LEFT PANEL (inputs, 35% width):
- Location bar at top with "📍 Detect My Location" button (green GPS icon)
- Auto-detected location name displayed below button
- Form fields (grouped with section headers):
  "Soil Nutrients": N, P, K — use range sliders with number display (0-200, step 1)
  "Weather Conditions": Temperature slider (-10 to 50°C), Humidity slider (0-100%), pH slider (0-14), Rainfall slider (0-5000mm)
  "Soil Type": Dropdown with options: Alluvial, Black, Red, Laterite, Clay, Sandy, Loamy
- Full-width green "Predict Crop" button at bottom of form

RIGHT PANEL (results, 65% width):
TOP SECTION — Recommended Crop Card:
- Large crop name display (e.g., "🌾 Maize") with pill badge showing "Adjusted" or "Base"
- Confidence meter: horizontal bar with gradient fill (red→yellow→green) showing adjusted_confidence %
- Below bar: "Base Model: 99.00%" in smaller text
- Color-coded status: green if ≥70%, amber if 40-70%, red if <40%

MIDDLE SECTION — Confidence Breakdown (horizontal bar chart):
- ML Model: ████████████████░░ 65% weight
- NDVI Score: ██████░░░░░░░░░░ 20% weight
- Soil Match: ███░░░░░░░░░░░░░ 10% weight
- Weather Score: █░░░░░░░░░░░░░ 5% weight

BOTTOM SECTION — Two-column split:
Left: Input Parameters Table showing all submitted values in clean key-value pairs
Right: Explanation Box with highlight background showing the "why" text from the API

SCREEN 3: NDVI ANALYSIS PAGE
Left panel (55%): Interactive map component with draggable pin/center marker
  - Click on map to set lat/lon coordinates
  - Shows coordinates below map
  - "Analyze Location" green button

Right panel (45%): NDVI Results
- Large NDVI score gauge (circular/speedometer style): 0.0 (red) → 0.5 (amber) → 1.0 (green)
- Current score displayed in center of gauge in large bold number
- Health status badge below: "Healthy" (green), "Moderate" (amber), "Poor" (orange), "Very Poor" (red)
- Details card: Imagery Date, Satellite Source (Sentinel-2 Level-2A), Spatial Resolution (10m)
- Formula display: "NDVI = (B8 - B4) / (B8 + B4)"
- Small info text: "Values closer to 1 indicate dense, healthy vegetation"

SCREEN 4: FERTILIZER ADVISOR PAGE (Future/Coming Soon state)
Two-column layout:
LEFT: Input form
- Crop name dropdown (searchable, all 24 crops)
- NPK sliders: N (0-200), P (0-200), K (0-200) with number display
- "Get Recommendation" green button

RIGHT: Results area
- Fertilizer recommendation card showing product name and NPK composition
- NPK deficit comparison bars: Current vs Optimal for each nutrient
- "Coming Soon" overlay if backend not yet connected for fertilizer

SCREEN 5: ABOUT PROJECT PAGE
- Tech stack cards in grid: FastAPI, scikit-learn, Google Earth Engine, Next.js, Render, Google Stitch
- Methodology section explaining ML pipeline and weighted fusion approach
- Model performance card: "99.86% Accuracy across 22 crops", feature importance bar chart
- Data sources section listing: Crop dataset (Kaggle), Sentinel-2 imagery, Open-Meteo weather, ICAR/FAO standards
- Professional, clean layout with good typography hierarchy

---

GLOBAL COMPONENTS (all screens):
- Top navigation bar: Logo left, nav links center (Recommend, NDVI, Fertilizer, About), theme toggle (light/dark) right
- Active nav link: green underline indicator
- Mobile: hamburger menu (left) + bottom tab bar with 4 icons
- Footer: GitHub icon link, "Built with FastAPI + Google Earth Engine", copyright
- Empty states: Each page should show a friendly empty state before the user interacts (e.g., "Enter your soil data to get started")
- Loading states: Skeleton loaders for API calls — pulsing cards/bars
- Error states: Red-bordered error cards with dismiss button and retry CTA
- Transitions: Smooth page transitions, micro-animations on hover
```

### 5.2 Prompt Strategy & Iteration Tips

| Phase | Action | Expected Outcome |
|-------|--------|-----------------|
| **1. Generate** | Paste the full prompt above into Stitch | First draft of all 5 screens |
| **2. Refine** | Use Stitch voice commands: *"Make the confidence gauge more prominent on the crop recommendation page"* | Refined per-screen layouts |
| **3. Brand** | *"Add a subtle gradient to the hero section, green to dark green"* | Polished brand consistency |
| **4. Mobile** | *"Show me the mobile version — stack all inputs vertically and add bottom navigation"* | Mobile-responsive variants |
| **5. Prototype** | Use Stitch's instant prototyping feature to link screens | Clickable prototype |
| **6. Export** | Export as HTML/CSS or Figma for handoff | Developer-ready assets |

---

## 6. Screens Required

### All screens to generate in Stitch:

| # | Screen | Variant | Notes |
|---|--------|---------|-------|
| 1 | **Landing Page** | Desktop | Hero, Features, HowItWorks, Stats, Footer |
| 2 | **Landing Page** | Mobile | Stacked, hamburger nav |
| 3 | **Crop Recommendation** | Desktop | 2-column: Input form + Results panel |
| 4 | **Crop Recommendation** | Tablet | 2-column: narrower inputs, side-by-side |
| 5 | **Crop Recommendation** | Mobile | Single column, bottom nav, full-width inputs |
| 6 | **Crop Recommendation** | Desktop — Loading State | Skeleton cards in results panel |
| 7 | **Crop Recommendation** | Desktop — Error State | Red error card with retry button |
| 8 | **Crop Recommendation** | Desktop — Empty State | Prompt text: "Enter your soil data" |
| 9 | **NDVI Analysis** | Desktop | Map (left) + Results (right) |
| 10 | **NDVI Analysis** | Mobile | Map (top) + Results (bottom), stacked |
| 11 | **NDVI Analysis** | Desktop — Empty State | "Click on the map to analyze" |
| 12 | **NDVI Analysis** | Desktop — Loading State | Pulsing gauge skeleton |
| 13 | **Fertilizer Advisor** | Desktop | 2-column: Form + Results |
| 14 | **Fertilizer Advisor** | Mobile | Single column stacked |
| 15 | **Fertilizer Advisor** | Desktop — "Coming Soon" | Overlay with feature teaser |
| 16 | **About Project** | Desktop | Full page with cards, grid layout |
| 17 | **About Project** | Mobile | Single column stacked |
| 18 | **Navigation System** | Desktop | Top nav with all links + theme toggle |
| 19 | **Navigation System** | Mobile | Hamburger menu open state + bottom tab bar |
| 20 | **Navigation System** | Tablet | Condensed top nav with partial hamburger |

**Total screens for Stitch generation: 20**

---

## 7. Frontend Completion Estimate

### Current State Assessment

| Dimension | Current | Target | Gap |
|-----------|---------|--------|-----|
| **Pages** | 1 (all-in-one) | 5 (structured) | 4 new pages + 1 redesign |
| **Components** | ~15 inline | ~30+ organized | Modular architecture |
| **Responsive Design** | Basic Tailwind | 3 breakpoints (M/T/D) | Tablet + polished mobile |
| **Visual Polish** | Functional, minimal | Professional SaaS | Major upgrade needed |
| **API Coverage** | /predict only | /predict, /ndvi, /fertilizer | NDVI UI + Fertilizer UI |
| **Design System** | None | Theme, tokens, patterns | Full system to build |

### Completion Estimates

| Metric | Value |
|--------|-------|
| Current Frontend Completion | **25%** (1/5 pages, minimal UI, no design system) |
| After Stitch Redesign | **90%** (5/5 screens designed, responsive, product-ready) |
| Remaining after Stitch | **10%** (API integration code, edge cases, deployment config) |
| **Expected Portfolio Impact** | **High** — transforms from "functional prototype" to "professional SaaS portfolio piece" |

### Portfolio Impact Matrix

| Factor | Before Redesign | After Redesign |
|--------|----------------|----------------|
| Visual First Impression | 3/10 | 9/10 |
| Mobile Responsiveness | 4/10 | 9/10 |
| Information Architecture | 3/10 | 9/10 |
| UX / User Flow | 5/10 | 9/10 |
| Design System Cohesion | 2/10 | 9/10 |
| Feature Visibility | 4/10 | 10/10 |
| Interview Talking Points | 2 (ML model) | 5 (ML + satellite + UI + deployment) |

---

## 8. Appendix: Current API Reference

### 8.1 Production Backend

| Attribute | Value |
|-----------|-------|
| Base URL | `https://crop-recommendation-system2-clean.onrender.com` |
| API Docs | `https://crop-recommendation-system2-clean.onrender.com/docs` |
| Framework | FastAPI (Python) |
| ML Model | RandomForestClassifier (scikit-learn 1.8.0) |

### 8.2 Working Endpoints

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/` | Health check | None | `{"message": "Crop Recommendation API Running"}` |
| `POST` | `/predict` | Crop recommendation | `{ N, P, K, temperature, humidity, ph, rainfall, soil_type, lat?, lon? }` | `{ recommended_crop, base_model_confidence, adjusted_confidence, ndvi_score, ndvi_health, soil_match, weather_score, input_parameters, explanation }` |
| `GET` | `/ndvi` | NDVI from coordinates | `lat`, `lon` (query params) | `{ ndvi_score, health_status, imagery_date, source }` |
| `POST` | `/api/v1/fertilizer` | Fertilizer recommendation | `{ crop, N, P, K }` | `{ fertilizer, reason, npk_deficit, crop_optimal }` |
| `GET` | `/api/v1/ndvi` | Versioned NDVI | `lat`, `lon` | Same as `/ndvi` |
| `POST` | `/api/v1/predict` | Versioned predict | Same as `/predict` | Same as `/predict` |

### 8.3 Validation Rules (CropInput)

| Field | Type | Range | Notes |
|-------|------|-------|-------|
| N | float | 0–200 | kg/ha |
| P | float | 0–200 | kg/ha |
| K | float | 0–200 | kg/ha |
| temperature | float | -10 to 50 | °C |
| humidity | float | 0–100 | % |
| ph | float | 0–14 | pH scale |
| rainfall | float | 0–5000 | mm |
| soil_type | string | Enum(7) | Alluvial, Black, Red, Laterite, Clay, Sandy, Loamy |
| lat | float (optional) | -90 to 90 | Enables NDVI fusion |
| lon | float (optional) | -180 to 180 | Enables NDVI fusion |

---

> **Document Version:** 1.0  
> **Generated:** 2026-06-08  
> **Next Steps:** Export as Google Stitch prompt → Generate 20 screens → Export to code → Integrate with existing FastAPI backend → Deploy