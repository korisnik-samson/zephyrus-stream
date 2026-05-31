"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "zephyrus-search-history";
const MAX_ENTRIES = 8;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (items: string[]) => {
    setHistory(items);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  };

  const add = (term: string) =>
    persist([term, ...history.filter((t) => t !== term)].slice(0, MAX_ENTRIES));

  const remove = (term: string) => persist(history.filter((t) => t !== term));

  const clear = () => persist([]);

  return { history, add, remove, clear };
}