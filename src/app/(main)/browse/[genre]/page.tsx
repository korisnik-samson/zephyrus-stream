"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
} from "@/components/ui";
import ContentCard, {
  ContentCardSkeleton,
} from "@/components/content/ContentCard";
import api from "@/lib/api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Title } from "@/types/content";

type SortOption = "popularity" | "newest" | "rating";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
];

function getGenreLabel(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function GenreBrowsePage() {
  const params = useParams<{ genre: string }>();
  const genre = params.genre;

  const [titles, setTitles] = useState<Title[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("popularity");
  const observerRef = useRef<HTMLDivElement>(null);

  // ─── Fetch page of content ────────────────────────────────
  const fetchPage = useCallback(
    async (pageNum: number, reset = false) => {
      setIsLoading(true);
      try {
        const res = await api.getPaged<Title>(
          `/api/content/browse/${genre}?page=${pageNum}&size=${DEFAULT_PAGE_SIZE}&sort=${sort}`
        );
        const newTitles = res.data ?? [];
        setTitles((prev) => (reset ? newTitles : [...prev, ...newTitles]));
        setHasMore(pageNum < (res.totalPages ?? 1) - 1);
        setPage(pageNum);
      } catch {
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [genre, sort]
  );

  // Reset when sort or genre changes
  useEffect(() => {
    setTitles([]);
    setPage(0);
    setHasMore(true);
    fetchPage(0, true);
  }, [fetchPage]);

  // ─── Infinite scroll via IntersectionObserver ─────────────
  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          fetchPage(page + 1);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoading, page, fetchPage]);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        {/* ─── Header ────────────────────────────────────────── */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            {getGenreLabel(genre)}
          </h1>

          <DropdownMenu>
            <DropdownMenuTrigger
                className="inline-flex items-center gap-2 h-8 px-2.5 rounded-lg border border-border bg-transparent text-text-secondary hover:text-text-primary text-sm font-medium cursor-pointer transition-all"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {currentSortLabel}
              </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-bg-secondary border-border"
            >
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSort(option.value)}
                  className={cn(
                    "cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
                    sort === option.value && "text-accent-purple-light font-medium"
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ─── Content Grid ──────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {titles.map((title, i) => (
            <ContentCard key={title.id} title={title} index={i} />
          ))}

          {/* Loading skeletons */}
          {isLoading &&
            Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => (
              <ContentCardSkeleton key={`skel-${i}`} />
            ))}
        </div>

        {/* ─── Empty state ───────────────────────────────────── */}
        {!isLoading && titles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-lg text-text-secondary">
              No titles found in this category.
            </p>
            <p className="text-sm text-text-muted mt-1">
              Try a different genre or check back later.
            </p>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={observerRef} className="h-4" />
      </div>
    </div>
  );
}
