"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PinEntryProps {
  length?: number;
  onComplete: (pin: string) => void;
  error?: boolean;
  /** Reset internal state when this value changes */
  resetKey?: number;
}

export default function PinEntry({ length = 4, onComplete, error, resetKey }: PinEntryProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setDigits(Array(length).fill(""));
    inputs.current[0]?.focus();
  }, [resetKey, length]);

  const setDigit = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    if (char && index < length - 1) inputs.current[index + 1]?.focus();

    const joined = next.join("");
    if (joined.length === length && !joined.includes("")) onComplete(joined);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          aria-label={`PIN digit ${i + 1}`}
          className={cn(
            "h-14 w-12 rounded-xl text-center text-2xl font-bold bg-bg-card border text-text-primary outline-none transition-all",
            error
              ? "border-accent-red animate-[shake_0.3s] focus:border-accent-red"
              : "border-border focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/30"
          )}
        />
      ))}
    </div>
  );
}