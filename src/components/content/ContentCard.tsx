"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Plus, ThumbsUp } from "lucide-react";
import {
  Badge,
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Skeleton,
} from "@/components/ui";
import { TMDB_IMAGE, HOVER_DELAY } from "@/lib/constants";
import {
  cn,
  getYear,
  getMaturityColor,
  calculateMatchPercentage,
  getBlurDataUrl,
} from "@/lib/utils";
import type { Title } from "@/types/content";

interface ContentCardProps {
  title: Title;
  /** Index for staggered animation */
  index?: number;
}

export default function ContentCard({ title, index = 0 }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const matchPct = calculateMatchPercentage(title.id);

  const handleMouseEnter = () => {
    hoverTimerRef.current = setTimeout(() => setIsHovered(true), HOVER_DELAY);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* ─── Poster Image ─────────────────────────────────────── */}
      <Link href={`/title/${title.id}`} className="block">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-card-hover">
          {title.posterPath ? (
            <Image
              src={`${TMDB_IMAGE.poster.md}${title.posterPath}`}
              alt={title.title}
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL={getBlurDataUrl()}
              sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, 220px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bg-card">
              <span className="text-sm text-text-muted">No Image</span>
            </div>
          )}

          {/* Play button overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
            <div className="scale-0 transition-transform group-hover:scale-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
                <Play className="h-5 w-5 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* ─── Expanded Hover Card ──────────────────────────────── */}
      {isHovered && (
        <div className="absolute -left-4 -right-4 top-0 z-30 animate-scale-in rounded-xl bg-bg-card shadow-card-hover border border-border overflow-hidden">
          {/* Backdrop image */}
          <div className="relative aspect-video w-full">
            {title.backdropPath ? (
              <Image
                src={`${TMDB_IMAGE.backdrop.sm}${title.backdropPath}`}
                alt={title.title}
                fill
                className="object-cover"
                sizes="320px"
              />
            ) : title.posterPath ? (
              <Image
                src={`${TMDB_IMAGE.poster.md}${title.posterPath}`}
                alt={title.title}
                fill
                className="object-cover"
                sizes="320px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-bg-elevated">
                <span className="text-xs text-text-muted">No Preview</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-card" />
          </div>

          {/* Info content */}
          <div className="p-3 space-y-2">
            {/* Mini action buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger>
                    <Link
                      href={`/title/${title.id}`}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-white/20 bg-white text-black hover:bg-white/90"
                    >
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Play</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full border-border hover:border-white/40 bg-transparent text-text-primary"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add to My List</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full border-border hover:border-white/40 bg-transparent text-text-primary"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rate</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Title */}
            <Link href={`/title/${title.id}`}>
              <h3 className="text-sm font-semibold text-text-primary line-clamp-1 hover:underline">
                {title.title}
              </h3>
            </Link>

            {/* Meta line */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-accent-green">
                {matchPct}% Match
              </span>
              <Badge
                className={cn(
                  "px-1.5 py-0 text-[10px] font-bold leading-tight",
                  getMaturityColor(title.maturityRating)
                )}
              >
                {title.maturityRating}
              </Badge>
              <span className="text-text-muted">
                {getYear(title.releaseDate)}
              </span>
              {title.mediaType === "SERIES" && (
                <Badge
                  variant="outline"
                  className="border-border text-text-muted text-[10px] px-1.5 py-0"
                >
                  Series
                </Badge>
              )}
            </div>

            {/* Genre tags */}
            {title.genres && title.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {title.genres.slice(0, 3).map((genre, i) => (
                  <span key={genre.id} className="text-[11px] text-text-secondary">
                    {i > 0 && <span className="mr-1 text-text-muted">•</span>}
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Loading skeleton matching ContentCard dimensions */
export function ContentCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
    </div>
  );
}
