"use client";

import { Subtitles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubtitleTrack } from "@/types/player";

interface SubtitleSelectorProps {
  tracks: SubtitleTrack[];
  activeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string | null) => void;
}

export default function SubtitleSelector({
  tracks,
  activeId,
  open,
  onOpenChange,
  onSelect,
}: SubtitleSelectorProps) {
  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!open)}
        title="Subtitles & Captions (C)"
        className={cn(
          "flex items-center justify-center h-8 w-8 rounded-lg transition-colors",
          open || activeId
            ? "text-accent-gold-light"
            : "text-white/70 hover:text-white"
        )}
      >
        <Subtitles className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute bottom-10 right-0 z-50 animate-scale-in liquid-glass rounded-xl w-52 py-2 overflow-hidden">
          <div className="flex items-center justify-between px-3 pb-2 border-b border-white/10">
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">Subtitles</span>
            <button onClick={() => onOpenChange(false)} className="text-white/40 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Off option */}
          <button
            onClick={() => { onSelect(null); onOpenChange(false); }}
            className={cn(
              "w-full text-left px-3 py-2 text-sm transition-colors hover:bg-white/8",
              activeId === null ? "text-accent-gold-light font-medium" : "text-white/70"
            )}
          >
            Off
          </button>

          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => { onSelect(track.id); onOpenChange(false); }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm transition-colors hover:bg-white/8",
                activeId === track.id ? "text-accent-gold-light font-medium" : "text-white/70"
              )}
            >
              {track.label}
            </button>
          ))}

          {tracks.length === 0 && (
            <p className="px-3 py-2 text-xs text-white/40">No subtitles available</p>
          )}
        </div>
      )}
    </div>
  );
}