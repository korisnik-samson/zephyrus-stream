import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge CSS class names using clsx + tailwind-merge.
 * Handles conditional classes and resolves Tailwind conflicts.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format runtime in minutes to human-readable string.
 * @example formatRuntime(135) → "2h 15m"
 * @example formatRuntime(45) → "45m"
 */
export function formatRuntime(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format an ISO date string to locale-aware display.
 * @example formatDate("2024-03-15") → "Mar 15, 2024"
 */
export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/**
 * Extract the year from an ISO date string.
 * @example getYear("2024-03-15") → "2024"
 */
export function getYear(date: string): string {
    return new Date(date).getFullYear().toString();
}

/**
 * Truncate a string to the given length with ellipsis.
 * @example truncate("Hello World", 5) → "Hello…"
 */
export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length).trimEnd() + "…";
}

/**
 * Get initials from a display name (for avatar fallbacks).
 * @example getInitials("John Doe") → "JD"
 * @example getInitials("Alice") → "A"
 */
export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

/**
 * Format a large number to compact notation.
 * @example formatNumber(1234) → "1.2K"
 * @example formatNumber(1500000) → "1.5M"
 */
export function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

/**
 * Format seconds to mm:ss or hh:mm:ss display.
 * @example formatTime(125) → "2:05"
 * @example formatTime(3661) → "1:01:01"
 */
export function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Create a debounced version of a function.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Get the appropriate Tailwind color class for a maturity rating badge.
 */
export function getMaturityColor(rating: string): string {
    switch (rating) {
        case "G":
        case "TV-Y":
        case "TV-G":
            return "bg-accent-green text-white";
        case "PG":
        case "TV-Y7":
        case "TV-PG":
            return "bg-accent-blue text-white";
        case "PG-13":
        case "TV-14":
            return "bg-accent-gold text-black";
        case "R":
        case "TV-MA":
            return "bg-accent-red text-white";
        case "NC-17":
            return "bg-red-900 text-white";
        default:
            return "bg-bg-elevated text-text-secondary";
    }
}

/**
 * Generate a consistent "% Match" value seeded by a title ID.
 * Returns a value between 65 and 99.
 */
export function calculateMatchPercentage(titleId: string): number {
    let hash = 0;
    for (let i = 0; i < titleId.length; i++) {
        const char = titleId.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return 65 + Math.abs(hash % 35);
}

/**
 * Generate a placeholder blur data URL for images.
 */
export function getBlurDataUrl(): string {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==";
}

/**
 * Calculate watch progress as a percentage (0-100).
 */
export function getProgressPercentage(
    progressSeconds: number,
    durationSeconds: number
): number {
    if (durationSeconds <= 0) return 0;
    return Math.min(100, Math.round((progressSeconds / durationSeconds) * 100));
}

/**
 * Sleep for a given number of milliseconds (useful in async flows).
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
