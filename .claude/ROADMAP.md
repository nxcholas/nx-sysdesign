# NX-Design — Product Roadmap & Implementation Plan

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| 0 | Prerequisites | ✅ Complete |
| 1 | Auth + DB | ✅ Complete |
| 1.5 | localStorage Scoping | ✅ Complete |
| 2 | Stripe + Paid Tier | ✅ Complete |
| 2.5 | Landing Page Redesign | ✅ Complete |
| 3 | Hardening (Auth Security) | 🔲 Branch 9 below |
| 4 | 7→10 Polish Sprint | 🔲 Branches 1–8 below |
| 5 | Team Plan | 🔲 Only after paying Pro users |

---

## Completed Phases

### Phase 0 — Prerequisites ✅
- Save-failure toasts, `.env` story, basic server-side logging strategy
- Undo/redo shipped
- Public `/` landing page built
- Canvas moved from `/` to `/app`

### Phase 1 — Auth + DB ✅
- Postgres (Neon) + Prisma
- Auth.js + credential sign-in + GitHub OAuth
- Diagram CRUD API
- localStorage → server migration
- Free cap enforced server-side (1 diagram)

### Phase 1.5 — localStorage Scoping ✅
- localStorage keys user-scoped (`nx-design:user_<id>` auth'd, `nx-design:anon` anonymous)
- Session-based namespace reset on sign-in/sign-out
- Anonymous diagrams optionally migrated to user namespace on first login

### Phase 2 — Stripe + Paid Tier ✅
- Stripe Checkout (hosted) for upgrades
- Stripe webhook — source of truth for subscription status
- `tier` field on User (`'free' | 'pro'`) updated by webhook
- Paid gating: unlimited diagrams for Pro users
- Downgrade policy: all readable, only oldest writable when lapsed
- Stripe Customer Portal for billing/cancellations

### Phase 2.5 — Landing Page Redesign ✅
- Animated hero with live SVG diagram preview
- Stats Bar, How It Works, CTA sections added
- All sections enhanced with Framer Motion scroll animations
- Mobile nav with hamburger menu
- FAQ updated with accurate billing/account content
- Favicon generated from brand lockup icon
- globals.css overflow fix for landing scroll

---

## Implementation Plan: 7 → 10

Each branch is self-contained and merges to main independently. Order is by ROI and dependency.

---

### Branch 1: `feat/seo-and-404` — SEO + 404 (~30 min) ✅

**Files to create:**
- `app/not-found.tsx` — 404 page matching dark app style, back-to-home button, consistent with `app/error.tsx`
- `app/robots.txt` — allow all crawlers, point to sitemap
- `app/sitemap.ts` — dynamic sitemap returning `/`, `/sign-in`, `/register`, `/app`

**Verification:** Visit `/nonexistent` → 404 page renders. Check `/robots.txt` and `/sitemap.xml` return correct content.

---

### Branch 2: `feat/mobile-canvas-guard` — Mobile Degradation (~20 min) ✅

**Files to modify:**
- `app/app/page.tsx` — add `useEffect` + `useState` checking `window.innerWidth < 768` on mount. If true, render full-screen message: "NX-Design requires a desktop browser" with link back to `/`. Gate entire canvas render behind this check.

**Verification:** Open `/app` at 375px viewport → degradation message renders instead of broken canvas.

---

### Branch 3: `feat/keyboard-shortcuts-overlay` — Shortcuts Help (~45 min) 🔲

**Files to create:**
- `components/features/canvas/shortcuts-overlay.tsx` — dark modal listing all shortcuts, grouped by category

**Files to modify:**
- `components/features/canvas/canvas-root.tsx` — add `?` key handler to existing keyboard listener, `showShortcuts` state, render overlay conditionally

**Shortcuts to document:**

| Key | Action |
|-----|--------|
| `V` | Select tool |
| `H` / Space+drag | Pan tool |
| `F` | Frame tool |
| `T` | Text block tool |
| `S` | Shape tool |
| `Ctrl+Z` | Undo |
| `Ctrl+C` / `Ctrl+V` | Copy / Paste |
| `Delete` / `Backspace` | Delete selected |
| `Scroll` | Zoom in/out |
| `Ctrl+0` | Reset zoom |
| `?` | Show this overlay |
| `Esc` | Deselect / close |

**Verification:** Press `?` on canvas → overlay appears. Press `Esc` → closes.

---

### Branch 4: `feat/starter-templates` — Templates (~2 hrs) 🔲

**Files to create:**
- `lib/templates/index.ts` — exports `DiagramTemplate[]` with `id`, `name`, `description`, `thumbnail` (SVG string), `state` (full `DiagramState` JSON)
- `lib/templates/microservices.ts` — User → API Gateway → 3 Microservices → DB/Cache/Queue
- `lib/templates/web-app.ts` — Browser → Load Balancer → Web Server → SQL DB + Redis
- `lib/templates/event-driven.ts` — Producer → Message Queue → Consumers → DB
- `components/features/canvas/new-diagram-modal.tsx` — modal with Blank card + template cards, shown on new diagram creation

**Files to modify:**
- `app/app/page.tsx` / `hooks/use-diagrams.ts` — show `NewDiagramModal` instead of immediately creating blank; load template state if selected

**Verification:** Click `+` new diagram → modal shows blank + 3 templates. Select Microservices → diagram loads with pre-built components.

---

### Branch 5: `feat/png-export` — PNG Export (~1.5 hrs) 🔲

**New dependency:** `html-to-image` (prod)

**Files to create:**
- `components/features/canvas/export-button.tsx` — button in canvas header; calls `htmlToImage.toPng()` clipped to bounding box of all placed components + 32px padding; downloads as `nx-design-<name>-<date>.png`

**Files to modify:**
- `components/features/header/header.tsx` — add `<ExportButton>`, pass ref to canvas viewport element
- `components/features/canvas/canvas-root.tsx` — forward ref for viewport element

**Verification:** Open any diagram → click Export → PNG downloads, clipped to diagram bounds.

---

### Branch 6: `feat/connection-labels` — Connection Labels (~2 hrs) 🔲

**Files to modify:**
- `lib/types.ts` — add `label?: string` to `Connection` interface
- `hooks/use-placed-components.ts` — add `UPDATE_CONNECTION_LABEL` action + reducer case + `updateConnectionLabel(id, label)` callback
- `components/features/canvas/canvas-root.tsx` — add `labelEditingId` state; double-click connection line → `<foreignObject><input>` at midpoint; on blur/Enter → save label; render `<text>` SVG at midpoint for labeled connections
- `components/features/canvas/connection-inspector.tsx` — add label text input field

**Verification:** Double-click a connection → input appears at midpoint. Type label → renders on line. Persists after save.

---

### Branch 7: `feat/snap-alignment` — Snap UI + Alignment Tools (~1.5 hrs) 🔲

**Files to modify:**
- `components/features/canvas/canvas-toolbar.tsx` — snap toggle button (grid icon); alignment toolbar when 2+ components selected (align left, center-H, right, top, center-V, bottom)
- `app/app/page.tsx` — add `snapEnabled` state; pass selected component IDs to alignment handlers
- `hooks/use-placed-components.ts` — add `ALIGN_COMPONENTS` action + reducer (computes new positions from alignment direction + IDs)
- `lib/canvas-utils.ts` — wire existing `snapToGrid()` into drag/drop when `snapEnabled` is true

**Verification:** Enable snap → drag component → snaps to grid. Select 2+ → alignment toolbar appears and works.

---

### Branch 8: `feat/shareable-links` — Share Links (~3 hrs) 🔲

**DB change:**
- `prisma/schema.prisma` — add `isPublic Boolean @default(false)` to `Diagram` model

**Files to create:**
- `app/api/diagrams/[id]/share/route.ts` — `PATCH` toggles `isPublic`, auth-gated to diagram owner
- `app/share/[id]/page.tsx` — server component; fetches diagram if `isPublic = true`; renders read-only canvas; 404 if private/missing
- `components/features/canvas/share-button.tsx` — header button; popover with public/private toggle + copy link

**Files to modify:**
- `components/features/canvas/canvas-root.tsx` — accept `readOnly?: boolean`; when true: disable all pointer interactions, hide ports and toolbar
- `app/app/page.tsx` — add share button to header

**Verification:** Toggle diagram public → copy link → open in incognito → read-only canvas renders correctly.

---

### Branch 9: `feat/auth-hardening` — Phase 3 Security (~3 hrs) 🔲

**New dependency:** `resend` (transactional email, free tier 3k/mo)

**Password Reset:**
- `app/forgot-password/page.tsx` — email input form → `POST /api/auth/forgot-password`
- `app/reset-password/page.tsx` — new password form, reads `?token=` from URL → `POST /api/auth/reset-password`
- `app/api/auth/forgot-password/route.ts` — generate secure token, store with 1hr expiry in DB, send email via Resend
- `app/api/auth/reset-password/route.ts` — validate token, update bcrypt hash, mark token used
- `prisma/schema.prisma` — add `PasswordResetToken` model: `token`, `userId`, `expiresAt`, `usedAt`

**Rate Limiting:**
- `middleware.ts` — in-memory rate limiting on `/api/auth/` routes; max 10 req/IP/min; return 429 with `Retry-After`; no new dep needed

**Email Verification *(can defer)*:**
- `prisma/schema.prisma` — `emailVerified DateTime?` on User (already in NextAuth schema)
- Send verification email on registration via Resend
- Show banner prompt until verified

**Verification:** "Forgot password" on sign-in → email arrives with link → reset works. Brute-force 11 auth requests → 429.

---

## Critical Files Summary

| File | Branch | Action |
|------|--------|--------|
| `app/not-found.tsx` | 1 | Create |
| `app/robots.txt` | 1 | Create |
| `app/sitemap.ts` | 1 | Create |
| `app/app/page.tsx` | 2, 4, 7, 8 | Modify |
| `components/features/canvas/shortcuts-overlay.tsx` | 3 | Create |
| `components/features/canvas/canvas-root.tsx` | 3, 6, 7, 8 | Modify |
| `lib/templates/index.ts` + 3 template files | 4 | Create |
| `components/features/canvas/new-diagram-modal.tsx` | 4 | Create |
| `hooks/use-diagrams.ts` | 4 | Modify |
| `components/features/canvas/export-button.tsx` | 5 | Create |
| `components/features/header/header.tsx` | 5, 8 | Modify |
| `lib/types.ts` | 6 | Modify |
| `hooks/use-placed-components.ts` | 6, 7 | Modify |
| `components/features/canvas/canvas-toolbar.tsx` | 7 | Modify |
| `prisma/schema.prisma` | 8, 9 | Modify |
| `app/share/[id]/page.tsx` | 8 | Create |
| `app/api/diagrams/[id]/share/route.ts` | 8 | Create |
| `app/forgot-password/page.tsx` | 9 | Create |
| `app/reset-password/page.tsx` | 9 | Create |
| `app/api/auth/forgot-password/route.ts` | 9 | Create |
| `app/api/auth/reset-password/route.ts` | 9 | Create |
| `middleware.ts` | 9 | Modify |

---

## New Dependencies

| Package | Branch | Purpose |
|---------|--------|---------|
| `html-to-image` | 5 | PNG export from DOM elements |
| `resend` | 9 | Transactional email for password reset |

---

## Score Projection

| After branch(es) | Score |
|-----------------|-------|
| Current | 7 / 10 |
| 1–3 merged | 7.5 / 10 |
| 1–5 merged | 8.5 / 10 |
| 1–8 merged | 9.5 / 10 |
| All 9 merged | 10 / 10 |

---

## Confirmed Architectural Decisions

- Free tier: 1 diagram max, auto-save enabled
- Downgrade = read-only all / write first diagram only
- `localStorage` is a cache, not source of truth
- No Team tier until paying Pro users exist
- Stripe-hosted Checkout only (no embedded Elements)
- Postgres on Neon, Auth.js self-hosted (no per-MAU cost)
- Stack: Next.js 15 App Router, TypeScript strict, Tailwind CSS, Framer Motion

---

## Phase 5 — Team Plan 🔲

*Only build once Phase 2 has real paying Pro users.*

- Shared workspaces / collaborative diagrams
- Seat-based billing
- Membership / invite system
- Real-time collaboration (cursors)
