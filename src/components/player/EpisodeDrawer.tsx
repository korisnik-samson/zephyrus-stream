"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Play } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { TMDB_IMAGE } from "@/lib/constants";
import { getBlurDataUrl } from "@/lib/utils";
import type { Season } from "@/types/content";

interface EpisodeDrawerProps {
  open: boolean;
  onClose: () => void;
  seasons: Season[];
  currentEpisodeId?: string;
  onEpisodeSelect: (episodeId: string) => void;
}

export default function EpisodeDrawer({
  open,
  onClose,
  seasons,
  currentEpisodeId,
  onEpisodeSelect,
}: EpisodeDrawerProps) {
  const [activeSeasonId, setActiveSeasonId] = useState(seasons[0]?.id ?? "");

  const activeSeason = seasons.find((s) => s.id === activeSeasonId);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "absolute top-0 right-0 bottom-0 z-40 w-96 liquid-glass-dark transition-transform duration-300 flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-bold text-base">Episodes</h3>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Season tabs */}
        {seasons.length > 1 && (
          <div className="flex gap-1 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-white/10">
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => setActiveSeasonId(season.id)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  activeSeasonId === season.id
                    ? "bg-accent-purple text-white"
                    : "text-white/50 hover:text-white hover:bg-white/8"
                )}
              >
                {season.name}
              </button>
            ))}
          </div>
        )}

        {/* Episode list */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
          {activeSeason?.episodes?.map((episode) => {
            const isCurrent = episode.id === currentEpisodeId;
            return (
              <button
                key={episode.id}
                onClick={() => { onEpisodeSelect(episode.id); onClose(); }}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5",
                  isCurrent && "bg-white/8"
                )}
              >
                {/* Thumbnail */}
                <div className="relative flex-shrink-0 w-28 aspect-video rounded-lg overflow-hidden bg-bg-elevated">
                  {episode.stillPath ? (
                    <Image
                      src={`${TMDB_IMAGE.backdrop.sm}${episode.stillPath}`}
                      alt={episode.name}
                      fill
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL={getBlurDataUrl()}
                      sizes="112px"
                    />
                  ) : null}
                  {isCurrent && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Play className="h-5 w-5 text-white fill-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs font-medium mb-0.5",
                    isCurrent ? "text-accent-gold-light" : "text-white/50"
                  )}>
                    E{episode.episodeNumber}
                    {episode.runtime ? ` · ${formatTime(episode.runtime * 60)}` : ""}
                  </p>
                  <p className={cn(
                    "text-sm font-semibold line-clamp-1",
                    isCurrent ? "text-white" : "text-white/80"
                  )}>
                    {episode.name}
                  </p>
                  {episode.overview && (
                    <p className="text-xs text-white/40 mt-1 line-clamp-2">{episode.overview}</p>
                  )}
                </div>
              </button>
            );
          })}

          {(!activeSeason?.episodes || activeSeason.episodes.length === 0) && (
            <p className="py-8 text-center text-sm text-white/30">No episodes available</p>
          )}
        </div>
      </div>
    </>
  );
}