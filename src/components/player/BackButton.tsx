"use client";

import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  visible: boolean;
  label: string;
  onBack: () => void;
}

export default function BackButton({ visible, label, onBack }: BackButtonProps) {
  return (
    <div
      className={cn(
        "absolute top-6 left-6 z-30 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 liquid-glass-sm px-4 py-2 rounded-xl text-white text-sm font-medium hover:text-accent-gold-light transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {label}
      </button>
    </div>
  );
}