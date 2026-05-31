"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerOverlayProps {
  isPlaying: boolean;
  title: string;
  subtitle?: string;
  showInfo: boolean;
  onTogglePlay: () => void;
}

export default function PlayerOverlay({
  isPlaying,
  title,
  subtitle,
  showInfo,
  onTogglePlay,
}: PlayerOverlayProps) {
  // Flash the play/pause icon briefly on each toggle
  const [flashIcon, setFlashIcon] = useState(false);

  useEffect(() => {
    setFlashIcon(true);
    const t = setTimeout(() => setFlashIcon(false), 600);
    return () => clearTimeout(t);
  }, [isPlaying]);

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer select-none"
      onClick={onTogglePlay}
    >
      {/* Gradient scrim — only when paused or info visible */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300 pointer-events-none",
          showInfo
            ? "opacity-100 bg-gradient-to-t from-black/80 via-black/30 to-black/20"
            : "opacity-0"
        )}
      />

      {/* Centre flash icon */}
      <div
        className={cn(
          "liquid-glass h-20 w-20 rounded-full flex items-center justify-center pointer-events-none transition-all duration-300",
          flashIcon ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}
      >
        {isPlaying ? (
          <Pause className="h-8 w-8 text-white fill-white" />
        ) : (
          <Play className="h-8 w-8 text-white fill-white ml-1" />
        )}
      </div>

      {/* Title info — bottom-left, shown when paused */}
      {showInfo && (
        <div className="absolute bottom-28 left-8 max-w-lg pointer-events-none animate-fade-in">
          <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">{title}</h2>
          {subtitle && (
            <p className="text-white/60 text-sm line-clamp-2 drop-shadow">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}