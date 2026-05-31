"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

export type RatingValue = "UP" | "DOWN" | null;

/** Manage a user's thumbs-up/down rating for a single title. */
export function useRating(titleId: string, initial: RatingValue = null) {
  const [rating, setRating] = useState<RatingValue>(initial);
  const [loading, setLoading] = useState(false);

  const rate = useCallback(
    async (value: RatingValue) => {
      if (loading) return;
      const prev = rating;
      // Toggle off if same value clicked
      const next = prev === value ? null : value;
      setRating(next);
      setLoading(true);
      try {
        if (next === null) {
          await api.delete(`/api/ratings/${titleId}`);
        } else {
          await api.post(`/api/ratings`, { titleId, rating: next });
        }
      } catch {
        setRating(prev);
        toast.error("Couldn't save your rating");
      } finally {
        setLoading(false);
      }
    },
    [titleId, rating, loading]
  );

  return { rating, rate, loading };
}