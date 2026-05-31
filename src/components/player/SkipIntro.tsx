"use client";

import { SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkipIntroProps {
  visible: boolean;
  onSkip: () => void;
}

export default function SkipIntro({ visible, onSkip }: SkipIntroProps) {
  return (
    <div
      className={cn(
        "absolute bottom-28 right-8 z-30 transition-all duration-300",
        visible ? "opacity-100 translate-y-0 animate-slide-up" : "opacity-0 translate-y-2 pointer-events-none"
      )}
    >
      <button
        onClick={onSkip}
        className="flex items-center gap-2 liquid-glass px-5 py-2.5 rounded-xl text-white font-semibold text-sm hover:border-accent-gold/50 transition-colors"
      >
        <SkipForward className="h-4 w-4" />
        Skip Intro
      </button>
    </div>
  );
}