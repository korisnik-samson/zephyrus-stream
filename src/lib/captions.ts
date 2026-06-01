import type { CSSProperties } from "react";
import type { CaptionStyle } from "@/stores/preferencesStore";

const SIZE_MAP = { sm: "0.95rem", md: "1.25rem", lg: "1.6rem", xl: "2rem" };
const COLOR_MAP = { white: "#ffffff", yellow: "#fde047", cyan: "#67e8f9", green: "#86efac" };
const BG_MAP = { none: "transparent", semi: "rgba(0,0,0,0.55)", solid: "rgba(0,0,0,0.95)" };
const FONT_MAP = {
  sans: "var(--font-sans), sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', monospace",
};

/** Maps caption preferences to the CSS variables consumed by `video::cue`. */
export function captionStyleVars(style: CaptionStyle): CSSProperties {
  return {
    ["--caption-size" as string]: SIZE_MAP[style.fontSize],
    ["--caption-color" as string]: COLOR_MAP[style.color],
    ["--caption-bg" as string]: BG_MAP[style.background],
    ["--caption-font" as string]: FONT_MAP[style.font],
  };
}