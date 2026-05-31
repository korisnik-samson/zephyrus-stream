"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { NEXT_EPISODE_COUNTDOWN } from "@/lib/constants";

interface NextEpisodeProps {
  visible: boolean;
  episodeName: string;
  onPlay: () => void;
  onCancel: () => void;
}

export default function NextEpisode({ visible, episodeName, onPlay, onCancel }: NextEpisodeProps) {
  const [remaining, setRemaining] = useState(NEXT_EPISODE_COUNTDOWN);

  useEffect(() => {
    if (!visible) {
      setRemaining(NEXT_EPISODE_COUNTDOWN);
      return;
    }
    if (remaining <= 0) {
      onPlay();
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [visible, remaining, onPlay]);

  if (!visible) return null;

  const progressPct = ((NEXT_EPISODE_COUNTDOWN - remaining) / NEXT_EPISODE_COUNTDOWN) * 100;

  return (
    <div className="absolute bottom-28 right-8 z-30 animate-slide-up liquid-glass rounded-2xl p-4 w-72">
      <p className="text-text-muted text-xs font-medium mb-1 uppercase tracking-wide">Up Next</p>
      <p className="text-white text-sm font-semibold mb-3 line-clamp-2">{episodeName}</p>

      {/* Countdown bar */}
      <div className="h-0.5 w-full bg-white/10 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-accent-gold rounded-full transition-all duration-1000"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPlay}
          className="flex items-center gap-1.5 bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          Play Now
        </button>
        <button
          onClick={onCancel}
          className="text-white/60 text-xs px-3 py-2 hover:text-white transition-colors"
        >
          Cancel ({remaining}s)
        </button>
      </div>
    </div>
  );
}