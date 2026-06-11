# Smart Crop Engine — Frontend Rebuild Plan

## Goal
Transform the existing single-page Next.js frontend ("Crop Recommendation System") into a full 9-screen AgriTech SaaS platform called **Smart Crop Engine** — featuring multi-page routing, dark/light mode, responsive design (mobile/tablet/desktop), interactive map, admin dashboard, and a professional design system comparable to Vercel/Stripe/Notion.

## Research Summary
- **Current state**: Single Next.js 16 + Tailwind v4 page at `/` with a form, prediction results, and NDVI display. Uses Geist fonts, `"use client"` with useState for state management. No routing, no dark mode, no admin.
- **Backend API available**: `GET /predict` (POST), `GET /ndvi` (GET lat/lon query params), `POST /api/v1/fertilizer`, versioned endpoints. CORS allows `localhost:3000` and production Render/vercel origins.
- **No additional packages needed for core UI** — Tailwind v4, Next.js 16, React 19 are all present. Will need `lucide-react` for icons (accurate, Tree-shakeable icons matching the spec).
- **Tailwind v4** uses `@theme` directive for custom colors — no `tailwind.config.ts` needed.

## Approach

### Architecture
- **Next.js App Router** — each screen is a page in `src/app/<slug>/page.tsx`
- **Client Components** (`"use client"`) for interactive pages (forms, maps, interactivity)
- **Server Components** where possible (static pages: About, FAQ, Landing sections)
- **Dark Mode**: CSS custom properties + Tailwind `dark:` variants + a React `ThemeProvider` context
- **Icons**: `lucide-react` (Leaf, Satellite, FlaskConical, MapPin, Droplets, etc.)
- **State Management**: React `useState` + `useEffect` per page (no Redux needed for this app)
- **API calls**: `fetch()` to `NEXT_PUBLIC_API_URL` env var
- **No map library for MVP** — use a visual lat/lon input panel with a stylized placeholder map area (avoid Leaflet/Mapbox dependency complexity for initial build; can be swapped later)

### Design System (Tailwind v4)
```
Primary Green:    #166534, #22c55e, #dcfce7
Earth Accent:     #92400e, #f59e0b
Neutral:          #0f172a, #475569, #e2e8f0, #f8fafc
Success:          #16a34a
Warning:          #d97706
Danger:           #dc2626
```
Text: `text-green-800`, `text-amber-700`, etc. Bg: `bg-green-50`, `bg-green-600`, etc.

## Subtasks
### Phase 1 — Foundation & Shared Components
1. **Install `lucide-react`** — add to dependencies, run npm install
2. **Replace `globals.css`** — full Tailwind v4 design system: custom theme variables, dark mode (`dark:` variants), smooth transitions, glassmorphism utilities, custom animations, NDVI gauge gradients, confidence gauge gradients
3. **Create root `layout.tsx`** — metadata (title: "Smart Crop Engine", description), ThemeProvider wrapper, Navbar (desktop top nav + mobile bottom tab nav), Footer
4. **Create shared components** — ThemeProvider (dark/light context with localStorage persistence), Navbar (desktop: top bar with logo+links+theme toggle; mobile: bottom tab bar with 5 icons), Footer, ThemeToggle, ConfidenceGauge, NdviGauge (circular speedometer), Skeleton loader variants, Toast notification, StatCard

### Phase 2 — Core Dashboard Screens (4 screens)
5. **Crop Recommendation Dashboard** (`/recommend`) — Left panel: form with NPK range sliders (styled range inputs), weather number inputs, soil type dropdown, GPS detect button ("Use My Location"). Right panel: results area with confidence gauge (circular gradient meter), top 3 crop recommendation cards (crop name, confidence %, risk indicator badge), recommendation explanation section, input parameter summary. States: idle (empty prompt to fill form), loading (skeleton), error (toast + error msg), success (results panel). Desktop: 2-column. Tablet: 2-column compressed. Mobile: stacked single column.
6. **NDVI Intelligence Dashboard** (`/ndvi`) — Satellite-style UI: interactive lat/lon input panel with map placeholder (styled grid overlay, no Leaflet dependency), "Analyze" button with loading state, NDVI gauge (circular speedometer: red→amber→green gradients), health status card (color-coded: red/amber/green for Very Poor/Poor/Moderate/Healthy), imagery metadata card (date, source, coordinates), CSS trend chart (mock historical bars). Desktop: 2-column (map left, data right). Tablet: stacked. Mobile: stacked with full-width cards.
7. **Fertilizer Advisor Dashboard** (`/fertilizer`) — Top: crop selector dropdown + NPK current-level inputs (3 number inputs with labels). Middle: deficiency visualization (3 horizontal bars showing current vs optimal per NPK with color coding: red=deficient, green=sufficient). Bottom: recommendation card (fertilizer name, composition %, amount needed, reason explanation). States: idle (select crop → fill NPK → get recommendation), loading, result. Desktop: 3 sections stacked. Mobile: same but compact.
8. **Admin Dashboard** (`/admin`) — Top bar with title. KPI row: 4 stat cards (Total Analyses, NDVI Requests, Fertilizer Recommendations, Active Users) with trend indicators. Chart section: "Weekly Activity" CSS bar chart (7 bars Mon-Sun). Table section: "Recent Activity" table (mock data: timestamp, action, crop, user). Rankings section: "Top Recommended Crops" ranked bar chart (horizontal bars). All mock data for portfolio demo. Desktop: KPI 4-col grid, full chart. Tablet: KPI 2-col grid. Mobile: KPI stacked, chart compact, table scrollable horizontally.

## Deliverables
| File Path | Description |
|-----------|-------------|
| `frontend/package.json` | Updated with `lucide-react` dependency |
| `frontend/src/app/globals.css` | Complete design system with Tailwind v4 custom theme, dark mode, animations |
| `frontend/src/app/layout.tsx` | Root layout with ThemeProvider, Navbar, Footer |
| `frontend/src/components/ThemeProvider.tsx` | Dark/light mode context & provider |
| `frontend/src/components/Navbar.tsx` | Responsive navigation with mobile hamburger/bottom nav |
| `frontend/src/components/Footer.tsx` | Global footer with links |
| `frontend/src/components/ThemeToggle.tsx` | Light/dark toggle button |
| `frontend/src/components/Skeleton.tsx` | Reusable skeleton loader components |
| `frontend/src/components/Toast.tsx` | Toast notification component |
| `frontend/src/components/ConfidenceGauge.tsx` | Confidence meter bar with gradient |
| `frontend/src/components/NdviGauge.tsx` | NDVI circular/speedometer gauge |
| `frontend/src/app/page.tsx` | Landing page (Hero, Features, HowItWorks, Stats, Testimonials, FAQ preview, CTA) |
| `frontend/src/app/recommend/page.tsx` | Crop recommendation engine page |
| `frontend/src/app/ndvi/page.tsx` | NDVI intelligence page |
| `frontend/src/app/fertilizer/page.tsx` | Fertilizer advisor page |
| `frontend/src/app/reports/page.tsx` | Reports & history page |
| `frontend/src/app/about/page.tsx` | About us page |
| `frontend/src/app/faq/page.tsx` | FAQ page |
| `frontend/src/app/contact/page.tsx` | Contact page |
| `frontend/src/app/admin/page.tsx` | Admin dashboard page |

## Evaluation Criteria
- All 9 routes render: `/`, `/recommend`, `/ndvi`, `/fertilizer`, `/reports`, `/about`, `/faq`, `/contact`, `/admin`
- Dark mode toggle works and persists (body class toggle or context)
- Mobile responsive: hamburger menu on small screens, bottom tab nav
- All API calls point to `NEXT_PUBLIC_API_URL` env var (fallback `http://127.0.0.1:8000`)
- `npm run build` exits 0 with no TypeScript errors
- Landing page hero, features, stats all render
- Recommend form submits and displays prediction result
- NDVI page has lat/lon input and gauge display
- Fertilizer page has coming-soon state if API unavailable
- About, FAQ, Contact pages are fully rendered static content
- Admin dashboard renders with mock KPI cards and activity table

## Notes
- Use `"use client"` only on pages that need interactivity (forms, maps, toggle handlers)
- Static pages (About, FAQ, Landing hero) can be server components where possible
- API endpoint: `process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"`
- Current backend CORS allows `localhost:3000` and production domain — no changes needed
- All data for Reports and Admin is localStorage/mock — no backend endpoints exist yet for those
- NDVI map: Use a styled placeholder with lat/lon inputs rather than importing Leaflet (avoids ~200KB dependency and complexity for portfolio demo)
- Fonts: Geist (already configured in existing layout) — keep as-is