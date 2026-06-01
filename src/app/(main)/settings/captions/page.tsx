"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw, Subtitles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  usePreferencesStore,
  type CaptionFontSize, type CaptionColor,
  type CaptionBackground, type CaptionFont,
} from "@/stores/preferencesStore";

const FONT_SIZES: { value: CaptionFontSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
];

const COLORS: { value: CaptionColor; label: string; hex: string }[] = [
  { value: "white",  label: "White",  hex: "#ffffff" },
  { value: "yellow", label: "Yellow", hex: "#fde047" },
  { value: "cyan",   label: "Cyan",   hex: "#67e8f9" },
  { value: "green",  label: "Green",  hex: "#86efac" },
];

const BACKGROUNDS: { value: CaptionBackground; label: string }[] = [
  { value: "none",  label: "None" },
  { value: "semi",  label: "Semi-transparent" },
  { value: "solid", label: "Solid" },
];

const FONTS: { value: CaptionFont; label: string }[] = [
  { value: "sans",  label: "Sans-serif" },
  { value: "serif", label: "Serif" },
  { value: "mono",  label: "Monospace" },
];

const PREVIEW_SIZES: Record<CaptionFontSize, string> = {
  sm: "text-base", md: "text-xl", lg: "text-2xl", xl: "text-3xl",
};
const PREVIEW_FONTS: Record<CaptionFont, string> = {
  sans: "font-sans", serif: "font-serif", mono: "font-mono",
};

export default function CaptionsSettingsPage() {
  const { captionStyle, setCaptionStyle, resetCaptionStyle } = usePreferencesStore();

  const colorHex = COLORS.find((c) => c.value === captionStyle.color)?.hex ?? "#ffffff";
  const bgStyle =
    captionStyle.background === "none" ? "transparent"
      : captionStyle.background === "solid" ? "rgba(0,0,0,0.95)"
      : "rgba(0,0,0,0.55)";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-text-muted hover:text-text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Subtitles className="h-5 w-5 text-accent-gold" />
              <h1 className="text-2xl font-bold text-text-primary">Caption Styling</h1>
            </div>
          </div>
          <button
            onClick={resetCaptionStyle}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        {/* Live preview */}
        <div className="relative h-44 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-end justify-center pb-6">
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "radial-gradient(circle at 30% 40%, #c2410c33, transparent 60%)" }}
          />
          <span
            className={cn(
              "relative px-3 py-1 rounded font-medium leading-snug text-center",
              PREVIEW_SIZES[captionStyle.fontSize],
              PREVIEW_FONTS[captionStyle.font]
            )}
            style={{
              color: colorHex,
              backgroundColor: bgStyle,
              textShadow: captionStyle.background === "none" ? "0 1px 3px rgba(0,0,0,0.9)" : "none",
            }}
          >
            The quick brown fox jumps
          </span>
        </div>

        {/* Font size */}
        <Section title="Text Size">
          <div className="grid grid-cols-4 gap-2">
            {FONT_SIZES.map((opt) => (
              <OptionButton
                key={opt.value}
                active={captionStyle.fontSize === opt.value}
                onClick={() => setCaptionStyle({ fontSize: opt.value })}
              >
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </Section>

        {/* Color */}
        <Section title="Text Color">
          <div className="grid grid-cols-4 gap-2">
            {COLORS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCaptionStyle({ color: opt.value })}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                  captionStyle.color === opt.value
                    ? "border-accent-purple bg-accent-purple/10"
                    : "border-border bg-bg-card hover:border-border-hover"
                )}
              >
                <span className="h-6 w-6 rounded-full border border-white/20" style={{ background: opt.hex }} />
                <span className="text-xs text-text-secondary">{opt.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Background */}
        <Section title="Background">
          <div className="grid grid-cols-3 gap-2">
            {BACKGROUNDS.map((opt) => (
              <OptionButton
                key={opt.value}
                active={captionStyle.background === opt.value}
                onClick={() => setCaptionStyle({ background: opt.value })}
              >
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </Section>

        {/* Font family */}
        <Section title="Font">
          <div className="grid grid-cols-3 gap-2">
            {FONTS.map((opt) => (
              <OptionButton
                key={opt.value}
                active={captionStyle.font === opt.value}
                onClick={() => setCaptionStyle({ font: opt.value })}
              >
                <span className={PREVIEW_FONTS[opt.value]}>{opt.label}</span>
              </OptionButton>
            ))}
          </div>
        </Section>

        <p className="text-center text-xs text-text-muted mt-6">
          Your caption preferences are saved automatically and applied across all your devices.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  );
}

function OptionButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
        active
          ? "border-accent-purple bg-accent-purple/10 text-text-primary"
          : "border-border bg-bg-card text-text-secondary hover:border-border-hover hover:text-text-primary"
      )}
    >
      {children}
    </button>
  );
}