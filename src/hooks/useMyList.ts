"use client";

import { useEffect } from "react";
import { useMyListStore } from "@/stores/myListStore";

/** Provides per-title My List state with optimistic toggle. */
export function useMyList(titleId?: string) {
  const { load, loaded, isInList, toggle } = useMyListStore();

  useEffect(() => {
    load();
  }, [load]);

  return {
    inList: titleId ? isInList(titleId) : false,
    loaded,
    toggle: (id: string) => toggle(id),
  };
}