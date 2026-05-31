"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Skeleton } from "@/components/ui";
import { TMDB_IMAGE } from "@/lib/constants";
import { cn, formatTime, getBlurDataUrl, getYear } from "@/lib/utils";
import type { WatchProgress } from "@/types/content";
import api from "@/lib/api";
import { toast } from "sonner";

interface ContinueWatchingRowProps {
  items: WatchProgress[];
}

function ContinueWatchingCard({
  item,
  onRemove,
}: {
  item: WatchProgress;
  onRemove: (id: string) => void;
}) {
  const title = item.title;
  if (!title) return null;

  const pct = item.durationSeconds > 0
    ? Math.min(100, (item.progressSeconds / item.durationSeconds) * 100)
    : 0;
  const remaining = item.durationSeconds - item.progressSeconds;

  const watchHref = item.episodeId
    ? `/watch/${title.id}?episode=${item.episodeId}`
    : `/watch/${title.id}`;

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(item.id);
    try {
      await api.delete(`/api/progress/${item.id}`);
    } catch {
      toast.error("Couldn't remove from history");
    }
  };

  return (
    <div className="group relative flex-shrink-0 w-[260px] sm:w-[300px] cursor-pointer">
      {/* Remove button */}
      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full liquid-glass-sm flex items-center justify-center text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove from Continue Watching"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <Link href={watchHref} className="block">
        {/* Backdrop thumbnail */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-bg-elevated">
          {title.backdropPath ? (
            <Image
              src={`${TMDB_IMAGE.backdrop.sm}${title.backdropPath}`}
              alt={title.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              placeholder="blur"
              blurDataURL={getBlurDataUrl()}
              sizes="(max-width: 640px) 260px, 300px"
            />
          ) : title.posterPath ? (
            <Image
              src={`${TMDB_IMAGE.poster.md}${title.posterPath}`}
              alt={title.title}
              fill
              className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
              placeholder="blur"
              blurDataURL={getBlurDataUrl()}
              sizes="300px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bg-card">
              <span className="text-xs text-text-muted">No Preview</span>
            </div>
          )}

          {/* Dark overlay + play icon on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="liquid-glass h-12 w-12 rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform">
              <Play className="h-5 w-5 text-white fill-white ml-0.5" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full rounded-r-full transition-all"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(to right, #c2410c, #fb923c)",
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-2.5 px-0.5">
          <h3 className="text-sm font-semibold text-text-primary line-clamp-1">
            {title.title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {item.episode && (
              <span className="text-xs text-text-muted">
                S{item.episode.seasonId && "?"} E{item.episode.episodeNumber}
                {" · "}
                {item.episode.name}
              </span>
            )}
            {!item.episode && (
              <span className="text-xs text-text-muted">
                {getYear(title.releaseDate)}
              </span>
            )}
            {remaining > 60 && (
              <span className="text-xs text-text-muted">
                · {formatTime(remaining)} left
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function ContinueWatchingRow({ items: initialItems }: ContinueWatchingRowProps) {
  const [items, setItems] = useState(initialItems);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });
  };

  const handleRemove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  if (items.length === 0) return null;

  return (
    <section className="group/row relative py-4">
      <div className="mb-3 flex items-baseline justify-between px-4 md:px-8 lg:px-12">
        <h2 className="text-lg font-bold text-text-primary md:text-xl">
          Continue Watching
        </h2>
        <Link
          href="/history"
          className="text-xs font-medium text-text-muted hover:text-accent-purple-light transition-colors"
        >
          View History &rsaquo;
        </Link>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1 top-1/2 z-20 -translate-y-1/2 h-24 w-10 rounded-md liquid-glass-sm text-white opacity-0 transition-opacity group-hover/row:opacity-100"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 z-20 -translate-y-1/2 h-24 w-10 rounded-md liquid-glass-sm text-white opacity-0 transition-opacity group-hover/row:opacity-100"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateButtons}
          className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide px-4 md:px-8 lg:px-12 pb-2"
        >
          {items.map((item) => (
            <ContinueWatchingCard
              key={item.id}
              item={item}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContinueWatchingRowSkeleton() {
  return (
    <section className="py-4">
      <div className="mb-3 px-4 md:px-8 lg:px-12">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="flex gap-4 overflow-hidden px-4 md:px-8 lg:px-12">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[300px]">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
        ))}
      </div>
    </section>
  );
}