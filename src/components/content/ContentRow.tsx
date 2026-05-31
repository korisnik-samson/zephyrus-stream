"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Skeleton } from "@/components/ui";
import ContentCard, { ContentCardSkeleton } from "./ContentCard";
import type { ContentRow as ContentRowType } from "@/types/content";

interface ContentRowProps {
  row: ContentRowType;
  /** Optional href for "See All" link */
  seeAllHref?: string;
}

export default function ContentRow({ row, seeAllHref }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!row.titles || row.titles.length === 0) return null;

  return (
    <section className="group/row relative py-4">
      {/* ─── Row Header ──────────────────────────────────────── */}
      <div className="mb-3 flex items-baseline justify-between px-4 md:px-8 lg:px-12">
        <h2 className="text-lg font-bold text-text-primary md:text-xl">
          {row.label}
        </h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-xs font-medium text-text-muted transition-colors hover:text-accent-purple-light"
          >
            See All &rsaquo;
          </Link>
        )}
      </div>

      {/* ─── Scroll Container ────────────────────────────────── */}
      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1 top-1/2 z-20 -translate-y-1/2 h-24 w-10 rounded-md bg-black/60 text-white opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-black/80"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 z-20 -translate-y-1/2 h-24 w-10 rounded-md bg-black/60 text-white opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-black/80"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide px-4 md:px-8 lg:px-12 snap-x snap-mandatory pb-2"
        >
          {row.titles.map((title, i) => (
            <div key={title.id} className="snap-start">
              <ContentCard title={title} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Skeleton loading row */
export function ContentRowSkeleton() {
  return (
    <section className="py-4">
      <div className="mb-3 px-4 md:px-8 lg:px-12">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="flex gap-3 overflow-hidden px-4 md:px-8 lg:px-12">
        {Array.from({ length: 7 }).map((_, i) => (
          <ContentCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
