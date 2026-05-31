// ─── API Configuration ──────────────────────────────────────
export const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ─── TMDB Image URLs ────────────────────────────────────────
const TMDB_IMAGE_BASE =
    process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE || "https://image.tmdb.org/t/p";

export const TMDB_IMAGE = {
    poster: {
        sm: `${TMDB_IMAGE_BASE}/w185`,
        md: `${TMDB_IMAGE_BASE}/w342`,
        lg: `${TMDB_IMAGE_BASE}/w500`,
        original: `${TMDB_IMAGE_BASE}/original`,
    },
    backdrop: {
        sm: `${TMDB_IMAGE_BASE}/w780`,
        lg: `${TMDB_IMAGE_BASE}/w1280`,
        original: `${TMDB_IMAGE_BASE}/original`,
    },
    profile: {
        sm: `${TMDB_IMAGE_BASE}/w185`,
        lg: `${TMDB_IMAGE_BASE}/w300`,
    },
} as const;

// ─── Timing Constants ───────────────────────────────────────
/** Interval in ms for saving playback progress to server */
export const PLAYER_PROGRESS_INTERVAL = 10_000;

/** Interval in ms for hero billboard auto-rotation */
export const HERO_ROTATE_INTERVAL = 8_000;

/** Delay in ms before showing hover cards */
export const HOVER_DELAY = 300;

/** Duration in ms for toast notifications */
export const TOAST_DURATION = 5_000;

/** Countdown in seconds before auto-playing next episode */
export const NEXT_EPISODE_COUNTDOWN = 10;

// ─── Limits ─────────────────────────────────────────────────
/** Maximum profiles per account */
export const MAX_PROFILES = 5;

/** Default page size for paginated content */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum search suggestion results */
export const MAX_SUGGESTIONS = 5;

// ─── Maturity Ratings ───────────────────────────────────────
export const MATURITY_RATINGS = [
    "G",
    "PG",
    "PG-13",
    "R",
    "NC-17",
    "TV-Y",
    "TV-Y7",
    "TV-G",
    "TV-PG",
    "TV-14",
    "TV-MA",
    "NR",
] as const;

// ─── Navigation Links ───────────────────────────────────────
export const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Series", href: "/browse/series" },
    { label: "Films", href: "/browse/films" },
    { label: "My List", href: "/my-list" },
    { label: "New & Popular", href: "/browse/new" },
] as const;

// ─── Playback Speeds ───────────────────────────────────────
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

// ─── Avatar Presets ─────────────────────────────────────────
export const AVATAR_COLORS = [
    "#7c3aed",
    "#3b82f6",
    "#ef4444",
    "#22c55e",
    "#f59e0b",
    "#ec4899",
    "#06b6d4",
    "#f97316",
] as const;

// ─── Breakpoints (matches Tailwind defaults) ────────────────
export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
} as const;
