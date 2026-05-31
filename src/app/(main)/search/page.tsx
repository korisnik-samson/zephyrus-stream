"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon, X, Film } from "lucide-react";
import { Input, Skeleton } from "@/components/ui";
import ContentCard, { ContentCardSkeleton } from "@/components/content/ContentCard";
import api from "@/lib/api";
import type { Title } from "@/types/content";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Title[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  // ─── Debounced search ─────────────────────────────────────
  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await api.get<Title[]>(
        `/api/search?q=${encodeURIComponent(q.trim())}`
      );
      setResults(res.data ?? []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
      // Update the URL search param without navigation
      if (query.trim()) {
        router.replace(`/search?q=${encodeURIComponent(query.trim())}`, {
          scroll: false,
        });
      } else {
        router.replace("/search", { scroll: false });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, search, router]);

  // On mount, search if there's an initial query
  useEffect(() => {
    if (initialQuery) search(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        {/* ─── Search Input ──────────────────────────────────── */}
        <div className="relative mb-8 max-w-2xl mx-auto">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies, TV shows, and more…"
            autoFocus
            className="h-12 pl-12 pr-10 text-base bg-bg-secondary border-border text-text-primary placeholder:text-text-muted focus:border-accent-purple"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ─── Loading State ─────────────────────────────────── */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <ContentCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ─── Results Grid ──────────────────────────────────── */}
        {!isLoading && results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-text-muted">
              {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
              <span className="text-text-primary font-medium">&ldquo;{query}&rdquo;</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((title, i) => (
                <ContentCard key={title.id} title={title} index={i} />
              ))}
            </div>
          </>
        )}

        {/* ─── Empty State ───────────────────────────────────── */}
        {!isLoading && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <SearchIcon className="h-16 w-16 text-text-muted/30 mb-4" />
            <p className="text-lg text-text-secondary">
              No results found for &ldquo;{query}&rdquo;
            </p>
            <p className="text-sm text-text-muted mt-1">
              Try a different search term or browse by genre.
            </p>
          </div>
        )}

        {/* ─── Initial State (no search yet) ─────────────────── */}
        {!isLoading && !hasSearched && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Film className="h-16 w-16 text-text-muted/30 mb-4" />
            <p className="text-lg text-text-secondary">
              Search for movies, TV shows, and more
            </p>
            <p className="text-sm text-text-muted mt-1">
              Start typing to discover your next favorite title.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
