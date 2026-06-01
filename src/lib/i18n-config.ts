export const LOCALES = [
  { code: "en", label: "English",   flag: "🇬🇧" },
  { code: "es", label: "Español",   flag: "🇪🇸" },
  { code: "fr", label: "Français",  flag: "🇫🇷" },
  { code: "de", label: "Deutsch",   flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "ja", label: "日本語",     flag: "🇯🇵" },
] as const;

export const LOCALE_CODES = LOCALES.map((l) => l.code);
export const DEFAULT_LOCALE = "en";
export const LOCALE_COOKIE = "zephyrus-locale";

export function isValidLocale(code: string): boolean {
  return LOCALE_CODES.includes(code as (typeof LOCALE_CODES)[number]);
}

/** Persist locale choice in a cookie read by the server on next render. */
export function setLocaleCookie(code: string) {
  document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}