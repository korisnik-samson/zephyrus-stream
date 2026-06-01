import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CaptionFontSize = "sm" | "md" | "lg" | "xl";
export type CaptionColor = "white" | "yellow" | "cyan" | "green";
export type CaptionBackground = "none" | "semi" | "solid";
export type CaptionFont = "sans" | "serif" | "mono";

export interface CaptionStyle {
  fontSize: CaptionFontSize;
  color: CaptionColor;
  background: CaptionBackground;
  font: CaptionFont;
}

interface PreferencesStore {
  // Accessibility
  highContrast: boolean;
  reduceMotion: boolean;
  setHighContrast: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;

  // Localization
  locale: string;
  setLocale: (l: string) => void;

  // Caption styling
  captionStyle: CaptionStyle;
  setCaptionStyle: (patch: Partial<CaptionStyle>) => void;
  resetCaptionStyle: () => void;
}

const DEFAULT_CAPTIONS: CaptionStyle = {
  fontSize: "md",
  color: "white",
  background: "semi",
  font: "sans",
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      highContrast: false,
      reduceMotion: false,
      setHighContrast: (highContrast) => set({ highContrast }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),

      locale: "en",
      setLocale: (locale) => set({ locale }),

      captionStyle: DEFAULT_CAPTIONS,
      setCaptionStyle: (patch) =>
        set((s) => ({ captionStyle: { ...s.captionStyle, ...patch } })),
      resetCaptionStyle: () => set({ captionStyle: DEFAULT_CAPTIONS }),
    }),
    { name: "zephyrus-preferences" }
  )
);