"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui";
import { TMDB_IMAGE } from "@/lib/constants";
import { cn, formatRuntime, truncate, getBlurDataUrl } from "@/lib/utils";
import type { Episode } from "@/types/content";

interface EpisodeCardProps {
  episode: Episode;
  titleId: string;
}

export default function EpisodeCard({ episode, titleId }: EpisodeCardProps) {
  return (
    <Link
      href={`/title/${titleId}`}
      className="group flex gap-4 rounded-lg p-3 transition-colors hover:bg-bg-elevated"
    >
      {/* ─── Thumbnail ────────────────────────────────────────── */}
      <div className="relative flex-shrink-0 w-36 sm:w-44 aspect-video overflow-hidden rounded-md bg-bg-card">
        {episode.stillPath ? (
          <Image
            src={`${TMDB_IMAGE.backdrop.sm}${episode.stillPath}`}
            alt={episode.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            placeholder="blur"
            blurDataURL={getBlurDataUrl()}
            sizes="176px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-bg-card">
            <span className="text-xs text-text-muted">No Preview</span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
          <div className="scale-0 transition-transform group-hover:scale-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black shadow-md">
              <Play className="h-4 w-4 fill-current ml-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Info ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-text-primary line-clamp-1">
            <span className="text-text-muted mr-1.5">
              {episode.episodeNumber}.
            </span>
            {episode.name}
          </h4>
          {episode.runtime && (
            <span className="flex-shrink-0 flex items-center gap-1 text-xs text-text-muted">
              <Clock className="h-3 w-3" />
              {formatRuntime(episode.runtime)}
            </span>
          )}
        </div>

        {episode.overview && (
          <p className="mt-1 text-xs leading-relaxed text-text-secondary line-clamp-2">
            {truncate(episode.overview, 150)}
          </p>
        )}
      </div>
    </Link>
  );
}

/** Loading skeleton for episode cards */
export function EpisodeCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-lg p-3">
      <Skeleton className="flex-shrink-0 w-36 sm:w-44 aspect-video rounded-md" />
      <div className="flex flex-1 flex-col justify-center gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}
