# Stream — Frontend Implementation Plan

> **Next.js 15 • TypeScript • TailwindCSS v4 • NextAuth.js v5**
>
> Frontend application for the Zephyrus streaming platform.
> Backend counterpart: [`zephyrus`](../zephyrus/)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    stream (Next.js 15)                      │
│                    Frontend @ :3000                          │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  App Router  │  │   NextAuth   │  │   Zustand Stores   │ │
│  │  (Pages)     │  │   (Auth)     │  │ (Player, UI, Auth) │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────────┘ │
│         │                 │                    │             │
│  ┌──────▼─────────────────▼────────────────────▼───────────┐│
│  │              API Client (lib/api.ts)                     ││
│  │         Fetch wrapper → Authorization: Bearer            ││
│  └──────────────────────────┬──────────────────────────────┘│
└─────────────────────────────┼───────────────────────────────┘
                              │ HTTP
┌─────────────────────────────▼───────────────────────────────┐
│               zephyrus (Spring Boot) @ :8080                │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | TypeScript, React Server Components |
| Styling | **TailwindCSS v4** | CSS-first config (`@import "tailwindcss"`), `@theme` for design tokens |
| State | Zustand | Lightweight client stores for player, UI, auth |
| Auth | NextAuth.js v5 (Auth.js) | Bridges to Spring Boot JWT endpoints |
| Video | Video.js | HLS/DASH support, custom branded skin |
| Validation | Zod | Runtime schema validation for forms + API responses |
| Icons | Lucide React | Consistent, tree-shakeable icon set |
| Testing | Vitest + Playwright | Unit/component + E2E |
| Container | Docker (multi-stage) | Node 22 slim runtime |

---

## TailwindCSS v4 — Design System

TailwindCSS v4 uses a CSS-first configuration with `@theme` blocks instead of `tailwind.config.js`.

### `src/styles/globals.css`

```css
@import "tailwindcss";

@theme {
  /* ── Colors ── */
  --color-bg-primary: #0a0a0f;
  --color-bg-secondary: #141420;
  --color-bg-tertiary: #1a1a2e;
  --color-bg-card: #1e1e30;
  --color-bg-elevated: #252540;
  --color-bg-glass: rgba(255, 255, 255, 0.05);

  --color-text-primary: #f1f1f7;
  --color-text-secondary: #a0a0b8;
  --color-text-muted: #6b6b80;

  --color-accent-purple: #7c3aed;
  --color-accent-purple-light: #a855f7;
  --color-accent-blue: #3b82f6;
  --color-accent-gold: #f59e0b;
  --color-accent-red: #ef4444;
  --color-accent-green: #22c55e;

  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-hover: rgba(255, 255, 255, 0.15);

  /* ── Typography ── */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Plus Jakarta Sans', 'Inter', sans-serif;

  /* ── Spacing (extends default) ── */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;
  --spacing-128: 32rem;

  /* ── Border Radius ── */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;

  /* ── Shadows (Elevation) ── */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-card-hover: 0 8px 40px rgba(0, 0, 0, 0.6);
  --shadow-modal: 0 16px 64px rgba(0, 0, 0, 0.7);
  --shadow-glow-purple: 0 0 20px rgba(124, 58, 237, 0.3);
  --shadow-glow-blue: 0 0 20px rgba(59, 130, 246, 0.3);

  /* ── Animations ── */
  --animate-fade-in: fade-in 0.3s ease-out;
  --animate-fade-out: fade-out 0.2s ease-in;
  --animate-slide-up: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  --animate-slide-down: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  --animate-scale-in: scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  --animate-shimmer: shimmer 1.5s infinite;
}

/* ── Keyframes ── */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ── Global Base Styles ── */
body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }

/* Selection */
::selection { background: var(--color-accent-purple); color: white; }
```

---

## Project Structure

```
stream/
├── package.json
├── next.config.ts
├── tsconfig.json
├── Dockerfile
├── .env.example
├── .gitignore
├── IMPLEMENTATION_PLAN.md
├── LICENSE
├── public/
│   ├── fonts/
│   │   ├── Inter-Variable.woff2
│   │   └── PlusJakartaSans-Variable.woff2
│   └── icons/
│       ├── logo.svg
│       └── favicon.ico
└── src/
    ├── app/
    │   ├── layout.tsx                     # Root: fonts, metadata, providers
    │   ├── not-found.tsx                  # 404 page
    │   │
    │   ├── (auth)/
    │   │   ├── layout.tsx                 # Auth layout (centered, bg animation)
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   └── forgot-password/page.tsx
    │   │
    │   ├── (main)/
    │   │   ├── layout.tsx                 # Navbar + Footer wrapper
    │   │   ├── page.tsx                   # Home / Browse
    │   │   ├── browse/[genre]/page.tsx    # Genre filtered grid
    │   │   ├── title/[id]/page.tsx        # Title detail
    │   │   ├── search/page.tsx            # Search overlay / page
    │   │   ├── my-list/page.tsx           # User's saved titles
    │   │   ├── history/page.tsx           # Watch history
    │   │   ├── profiles/page.tsx          # Profile selection
    │   │   ├── profiles/manage/page.tsx   # Edit profiles
    │   │   ├── categories/page.tsx        # Genre grid
    │   │   ├── downloads/page.tsx         # Offline downloads (PWA)
    │   │   └── settings/page.tsx          # Account settings
    │   │
    │   ├── (player)/
    │   │   ├── layout.tsx                 # No Navbar/Footer
    │   │   └── watch/[id]/page.tsx        # Fullscreen player
    │   │
    │   ├── (admin)/
    │   │   ├── layout.tsx                 # Admin sidebar layout
    │   │   ├── dashboard/page.tsx         # Analytics overview
    │   │   ├── content/page.tsx           # Content CMS
    │   │   └── users/page.tsx             # User management
    │   │
    │   └── api/
    │       └── auth/[...nextauth]/route.ts
    │
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Dropdown.tsx
    │   │   ├── Tooltip.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Skeleton.tsx
    │   │   ├── Toast.tsx
    │   │   ├── Avatar.tsx
    │   │   ├── ProgressBar.tsx
    │   │   └── Tabs.tsx
    │   │
    │   ├── content/
    │   │   ├── HeroBillboard.tsx
    │   │   ├── ContentRow.tsx
    │   │   ├── ContentCard.tsx
    │   │   ├── ContentCardExpanded.tsx
    │   │   ├── TitleHero.tsx
    │   │   ├── EpisodePicker.tsx
    │   │   ├── EpisodeCard.tsx
    │   │   ├── CastCarousel.tsx
    │   │   ├── GenreTag.tsx
    │   │   ├── MaturityBadge.tsx
    │   │   ├── Top10Badge.tsx
    │   │   └── MatchPercentage.tsx
    │   │
    │   ├── player/
    │   │   ├── VideoPlayer.tsx
    │   │   ├── PlayerControls.tsx
    │   │   ├── SubtitleSelector.tsx
    │   │   ├── SkipIntro.tsx
    │   │   ├── NextEpisode.tsx
    │   │   ├── EpisodeDrawer.tsx
    │   │   ├── PlayerOverlay.tsx
    │   │   └── BackButton.tsx
    │   │
    │   └── layout/
    │       ├── Navbar.tsx
    │       ├── Footer.tsx
    │       ├── ProfileSwitcher.tsx
    │       └── MobileNav.tsx
    │
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useDebounce.ts
    │   ├── useInfiniteScroll.ts
    │   ├── useMediaQuery.ts
    │   ├── useScrollPosition.ts
    │   └── useLocalStorage.ts
    │
    ├── lib/
    │   ├── auth.ts                        # NextAuth.js v5 config
    │   ├── api.ts                         # Fetch wrapper for Spring Boot
    │   ├── constants.ts                   # TMDB image base URLs, etc.
    │   ├── utils.ts                       # cn(), formatRuntime(), etc.
    │   └── validators.ts                  # Zod schemas
    │
    ├── stores/
    │   ├── authStore.ts                   # Active profile, session
    │   ├── playerStore.ts                 # Playing state, volume, progress
    │   └── uiStore.ts                     # Modals, toasts, search open
    │
    ├── types/
    │   ├── content.ts                     # Title, Episode, Genre, etc.
    │   ├── auth.ts                        # User, Session, etc.
    │   └── api.ts                         # ApiResponse<T>, PagedResponse<T>
    │
    └── styles/
        └── globals.css                    # TailwindCSS v4 + @theme tokens
```

---

## Phase 1: Foundation & Core MVP

### 1.1 Project Scaffolding

- [ ] Initialize Next.js 15 (App Router, TypeScript, ESLint, TailwindCSS v4)
- [ ] Configure path aliases in `tsconfig.json`
- [ ] Install dependencies: next-auth@5, zustand, zod, video.js, lucide-react
- [ ] Create `Dockerfile` (multi-stage Node 22 build)
- [ ] Create `.env.example`
- [ ] Configure `next.config.ts` (image domains for TMDB)

### 1.2 Design System (TailwindCSS v4)

- [ ] `globals.css` with `@theme` block (colors, fonts, shadows, animations)
- [ ] Google Fonts: Inter + Plus Jakarta Sans (self-hosted or next/font)
- [ ] Keyframe animations: fade-in, slide-up, scale-in, shimmer
- [ ] Scrollbar and selection styling
- [ ] Dark mode as default (no toggle for MVP)

### 1.3 UI Component Library

All components built with TailwindCSS v4 utility classes + theme tokens.

- [ ] `Button` — Variants: primary (gradient purple), secondary (glass bg), ghost, danger. Sizes: sm/md/lg. Loading spinner. Icon left/right slots.
- [ ] `Input` — Floating label via peer selectors. Error/success border states. Password visibility toggle.
- [ ] `Modal` — Portal render, backdrop blur (`backdrop-blur-sm`), scale-in animation, focus trap, Escape close.
- [ ] `Dropdown` — `animate-slide-down`, keyboard navigation, auto-flip positioning.
- [ ] `Tooltip` — `animate-fade-in`, arrow via CSS pseudo-element, position variants.
- [ ] `Badge` — Color variants (genre colors, status), pill-shaped (`rounded-full`).
- [ ] `Skeleton` — `animate-shimmer` with gradient background, shape variants (text, card, avatar).
- [ ] `Toast` — Slide-in from top-right, auto-dismiss 5s, icons per type (success/error/info/warning).
- [ ] `Avatar` — Rounded image with initials fallback, status ring.
- [ ] `ProgressBar` — Animated width transition, color gradient by percentage.
- [ ] `Tabs` — Animated underline indicator (`transition-all`), keyboard accessible.

### 1.4 Authentication UI

- [ ] `lib/auth.ts` — NextAuth.js v5:
  - `CredentialsProvider` → Spring `POST /api/auth/login`
  - JWT callback: store Spring access + refresh tokens
  - Session callback: expose `user.id`, `user.role`, `user.displayName`
  - Auto-refresh: detect expired access token → call `/api/auth/refresh`
- [ ] `lib/api.ts` — typed fetch wrapper:
  - Base URL from `NEXT_PUBLIC_API_URL`
  - Auto-inject `Authorization: Bearer` from NextAuth session
  - Response typing with generics: `api.get<TitleResponse>('/content/123')`
  - 401 interceptor: trigger token refresh or redirect to login

#### Pages
- [ ] **Login** (`/login`):
  - Full-viewport height, animated gradient mesh background
  - Glass-morphism card (backdrop-blur, semi-transparent bg)
  - Zephyrus logo at top
  - Email + password inputs with floating labels
  - "Sign In" button (purple gradient, loading state with spinner)
  - Divider: `— or continue with —`
  - Google + GitHub OAuth buttons (outlined, icon + label)
  - "New to Zephyrus?" link → `/register`
  - "Forgot password?" link
  - Zod validation, toast errors

- [ ] **Register** (`/register`):
  - 3-step animated flow (slide transitions between steps):
    1. **Account**: email, password, confirm password
    2. **Profile**: display name, avatar grid (8 preset options)
    3. **Preferences**: genre selection (interactive tag grid, multi-select)
  - Progress bar at top
  - Back / Continue / Create Account buttons
  - Redirect to `/profiles` on success

- [ ] **Forgot Password** (`/forgot-password`):
  - Email input → success state with checkmark animation

- [ ] `hooks/useAuth.ts` — wraps `useSession`, provides `isAuthenticated`, `user`, `signIn`, `signOut`

### 1.5 Content Browsing

#### Home Page (`/`)
- [ ] **Hero Billboard** (`HeroBillboard.tsx`):
  - Full viewport width, ~80vh height
  - TMDB backdrop image as `background-image` (CSS `object-cover`)
  - Bottom gradient: `bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent`
  - Title in `font-display text-5xl font-bold` with text shadow
  - Synopsis: `line-clamp-2 text-text-secondary text-lg max-w-xl`
  - Buttons: "▶ Play" (white filled), "ℹ More Info" (glass, `bg-white/10 backdrop-blur`)
  - Auto-rotate every 8s with crossfade (`transition-opacity duration-700`)
  - Dot indicators at bottom center

- [ ] **Content Rows** (`ContentRow.tsx`):
  - Row header: title (`text-xl font-display font-semibold`) + "See All >" link
  - Horizontal scroll container: `overflow-x-auto scroll-smooth snap-x snap-mandatory`
  - Custom scrollbar hidden (`scrollbar-hide`)
  - Left/right arrow buttons appear on row `:hover` (absolute positioned, gradient fade edge)
  - Gap: `gap-3` between cards

- [ ] **Content Cards** (`ContentCard.tsx`):
  - Portrait poster ratio (2:3): `aspect-[2/3] w-44`
  - TMDB poster image with lazy loading
  - Rounded corners: `rounded-lg`
  - Hover: `hover:scale-110 hover:z-20 transition-transform duration-300`
  - On hover → show expanded card below/beside

- [ ] **Content Card Expanded** (`ContentCardExpanded.tsx`):
  - Appears on card hover after 300ms delay
  - Shows: backdrop image, title, year, maturity badge, genre tags
  - Mini action buttons: ▶, ⊕, 👍, ⓘ
  - Drop shadow: `shadow-card-hover`

#### Genre Browse (`/browse/[genre]`)
- [ ] Page title from genre name
- [ ] Infinite scroll grid: `grid grid-cols-5 gap-4` (desktop)
- [ ] Sort dropdown (Popularity / Newest / Highest Rated)
- [ ] Filter panel for year range, rating

#### Title Detail (`/title/[id]`)
- [ ] Hero backdrop (70vh) with parallax-lite effect
- [ ] `bg-gradient-to-t from-bg-primary` overlay
- [ ] Metadata line: `2024 • TV-MA • 2h 15m • HD` in `text-text-secondary`
- [ ] Action buttons: ▶ Play, ⊕ My List, 👍/👎 Rate, ↗ Share
- [ ] Synopsis: expandable with "More" / "Less" toggle
- [ ] Cast carousel: circular avatars with name + character
- [ ] **Series**: Season `Tabs` component → `EpisodeCard` list
- [ ] "More Like This" `ContentRow` at bottom

### 1.6 Video Player

#### Player Page (`/watch/[id]`)
- [ ] Fullscreen layout (no Navbar/Footer via `(player)/layout.tsx`)
- [ ] Auto-resume from saved progress
- [ ] ESC to exit → navigate back

#### Player Components
- [ ] `VideoPlayer` — Video.js wrapper with Zephyrus dark skin
- [ ] `PlayerControls`:
  - Play/pause, seek bar with time tooltip preview
  - Volume slider (hover to expand)
  - Playback speed (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
  - Fullscreen toggle, PiP button
  - Time display: elapsed / remaining
- [ ] `SubtitleSelector` — audio + subtitle language dropdown
- [ ] `SkipIntro` — "Skip Intro ▶" button, appears at configured timestamp, `animate-slide-up`
- [ ] `NextEpisode` — 10s countdown overlay, auto-advances or manual "Play Now" / "Cancel"
- [ ] `EpisodeDrawer` — slide-out right panel, lists all episodes for current series
- [ ] `PlayerOverlay` — title + synopsis, shown on pause/initial hover
- [ ] `BackButton` — `← Back to Browse` floating top-left, fades in on mouse move

#### Keyboard Shortcuts
- [ ] `Space/K` Play/Pause, `F` Fullscreen, `M` Mute, `←/→` ±10s, `↑/↓` Volume, `N` Next Episode, `C` Captions, `Esc` Exit

### 1.7 Navigation & Layout

- [ ] **Navbar** (`Navbar.tsx`):
  - Fixed top, transparent → `bg-bg-primary/90 backdrop-blur-md` on scroll (60px threshold)
  - Logo (left), nav links (Home, Series, Films, My List, New & Popular)
  - Right side: search icon (expands to input), notifications bell (badge count), profile avatar dropdown
  - `transition-all duration-300` for background change
  - Desktop: full horizontal nav. Below 1024px: hamburger → `MobileNav`

- [ ] **Footer** (`Footer.tsx`):
  - 4-column grid: Navigation, Help Center, Account, Legal
  - Social icons row (GitHub, Twitter, Instagram)
  - Language selector dropdown
  - `© 2026 Zephyrus`

- [ ] **Profile Switcher** (`ProfileSwitcher.tsx`):
  - Full-screen overlay: "Who's watching?"
  - Grid of profile avatars (circular, `hover:ring-2 ring-accent-purple`)
  - "Manage Profiles" link
  - Shown on first visit or when user clicks profile avatar → "Switch Profile"

- [ ] **Mobile Nav** (`MobileNav.tsx`):
  - Hamburger icon → full-height slide-out drawer from left
  - Backdrop blur, nav links stacked vertically
  - Close on backdrop click or × button

---

## Phase 2: Personalization & Social

- [ ] Profile management page (create, edit, delete, avatar upload)
- [ ] My List page (grid, drag-to-reorder with `@dnd-kit`)
- [ ] Watch History page (chronological list with progress bars)
- [ ] "Continue Watching" row on home page
- [ ] Recommendations rows ("Because You Watched X")
- [ ] "% Match" component on cards
- [ ] Rating system (thumbs up/down)
- [ ] Notification center (bell dropdown)

## Phase 3: Search & Downloads

- [ ] Full-screen search overlay with live autocomplete
- [ ] Voice search (Web Speech API)
- [ ] Recent + trending searches
- [ ] Categories page (visual genre grid)
- [ ] Curated collections ("Award Winners", "Binge-Worthy")
- [ ] PWA offline downloads with Service Worker
- [ ] Downloads page with storage management

## Phase 4: Admin Dashboard

- [ ] Admin layout (sidebar navigation)
- [ ] Analytics dashboard (charts with Chart.js or Recharts)
- [ ] Content CMS (CRUD table, bulk import)
- [ ] User management table

## Phase 5: Premium Features

- [ ] Stripe subscription flow (plan selection, checkout, portal)
- [ ] Watch Party UI (synced player + chat sidebar)
- [ ] Parental controls UI (PIN entry, maturity settings)
- [ ] Accessibility: full keyboard nav, ARIA labels, high contrast mode
- [ ] i18n with next-intl (multi-language)
- [ ] Caption styling customization

---

## Environment Variables

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:8080

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# TMDB (for image URLs — actual API calls go through backend)
NEXT_PUBLIC_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
```

---

## Key Constants

```typescript
// lib/constants.ts
export const TMDB_IMAGE = {
  poster: {
    sm: `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE}/w185`,
    md: `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE}/w342`,
    lg: `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE}/w500`,
    original: `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE}/original`,
  },
  backdrop: {
    sm: `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE}/w780`,
    lg: `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE}/w1280`,
    original: `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE}/original`,
  },
  profile: {
    sm: `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE}/w185`,
    lg: `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE}/w300`,
  },
} as const;

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  wide: 1536,
} as const;
```

---

## Verification

```bash
# Install deps
npm install

# Dev server
npm run dev           # → http://localhost:3000

# Production build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Unit tests
npm test

# E2E tests
npx playwright test

# Lighthouse (desktop)
# Target: 90+ all categories
```
