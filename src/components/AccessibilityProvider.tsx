"use client";

import { useEffect } from "react";
import { usePreferencesStore } from "@/stores/preferencesStore";

/**
 * Applies accessibility preferences to the root <html> element
 * so global CSS can react via `.high-contrast` and `.reduce-motion`.
 */
export default function AccessibilityProvider() {
  const { highContrast, reduceMotion } = usePreferencesStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("high-contrast", highContrast);
    root.classList.toggle("reduce-motion", reduceMotion);
  }, [highContrast, reduceMotion]);

  return null;
}