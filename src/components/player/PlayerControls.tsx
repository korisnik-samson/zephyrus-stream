"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture2,
  ListVideo,
  Gauge,
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { PLAYBACK_SPEEDS } from "@/lib/constants";
import SubtitleSelector from "./SubtitleSelector";
import type { SubtitleTrack } from "@/types/player";

interface PlayerControlsProps {
  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isSeries: boolean;

  // Subtitles
  subtitleTracks: SubtitleTrack[];
  activeSubtitleId: string | null;

  // Handlers
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (v: number) => void;
  onMuteToggle: () => void;
  onPlaybackRateChange: (r: number) => void;
  onFullscreenToggle: () => void;
  onPiPToggle: () => void;
  onEpisodesOpen: () => void;
  onSubtitleChange: (id: string | null) => void;

  visible: boolean;
}

// ─── Seek Bar ────────────────────────────────────────────────
function SeekBar({
  currentTime,
  duration,
  bufferedEnd,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  onSeek: (t: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const [scrubPct, setScrubPct] = useState<number | null>(null);

  const getPct = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setScrubPct(getPct(e.clientX));
    };
    const onUp = (e: MouseEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const pct = getPct(e.clientX);
      setScrubPct(null);
      onSeek(pct * duration);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [getPct, duration, onSeek]);

  const displayPct = scrubPct !== null ? scrubPct : duration > 0 ? currentTime / duration : 0;
  const bufPct = duration > 0 ? bufferedEnd / duration : 0;
  const hoverTime = hoverPct !== null ? hoverPct * duration : null;

  return (
    <div
      ref={trackRef}
      className="group/seek relative w-full h-5 flex items-center cursor-pointer"
      onMouseMove={(e) => setHoverPct(getPct(e.clientX))}
      onMouseLeave={() => setHoverPct(null)}
      onMouseDown={(e) => {
        isDragging.current = true;
        const pct = getPct(e.clientX);
        setScrubPct(pct);
        onSeek(pct * duration);
      }}
    >
      {/* Hover time tooltip */}
      {hoverTime !== null && (
        <div
          className="absolute bottom-6 -translate-x-1/2 liquid-glass-sm px-2 py-0.5 rounded text-xs text-white pointer-events-none whitespace-nowrap z-10"
          style={{ left: `${(hoverPct ?? 0) * 100}%` }}
        >
          {formatTime(hoverTime)}
        </div>
      )}

      {/* Track */}
      <div className="absolute left-0 right-0 h-1 group-hover/seek:h-[5px] transition-all duration-150 rounded-full bg-white/20">
        {/* Buffered */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white/25"
          style={{ width: `${bufPct * 100}%` }}
        />
        {/* Progress */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${displayPct * 100}%`,
            background: "linear-gradient(to right, #c2410c, #fb923c)",
          }}
        />
      </div>

      {/* Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-accent-gold-light shadow-md opacity-0 group-hover/seek:opacity-100 pointer-events-none transition-opacity"
        style={{ left: `${displayPct * 100}%` }}
      />
    </div>
  );
}

// ─── Volume Control ──────────────────────────────────────────
function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
}: {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onMuteToggle: () => void;
}) {
  const displayVol = isMuted ? 0 : volume;

  const VolumeIcon =
    displayVol === 0 ? VolumeX : displayVol < 0.5 ? Volume1 : Volume2;

  return (
    <div className="group/vol flex items-center gap-1.5">
      <button
        onClick={onMuteToggle}
        title={isMuted ? "Unmute (M)" : "Mute (M)"}
        className="text-white/70 hover:text-white transition-colors"
      >
        <VolumeIcon className="h-5 w-5" />
      </button>

      {/* Slider — expands on hover */}
      <div className="overflow-hidden transition-all duration-200 w-0 group-hover/vol:w-20 flex items-center">
        <input
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={displayVol}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="player-range w-full"
          style={{
            background: `linear-gradient(to right, #fb923c ${displayVol * 100}%, rgba(255,255,255,0.25) ${displayVol * 100}%)`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Speed Menu ──────────────────────────────────────────────
function SpeedMenu({
  playbackRate,
  onSelect,
}: {
  playbackRate: number;
  onSelect: (r: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Playback speed"
        className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition-colors",
          open ? "text-accent-gold-light" : "text-white/70 hover:text-white"
        )}
      >
        <Gauge className="h-4 w-4" />
        {playbackRate === 1 ? "1×" : `${playbackRate}×`}
      </button>

      {open && (
        <div className="absolute bottom-9 right-0 z-50 animate-scale-in liquid-glass rounded-xl w-28 py-1.5 overflow-hidden">
          {[...PLAYBACK_SPEEDS].reverse().map((speed) => (
            <button
              key={speed}
              onClick={() => { onSelect(speed); setOpen(false); }}
              className={cn(
                "w-full text-center py-1.5 text-sm transition-colors hover:bg-white/8",
                playbackRate === speed ? "text-accent-gold-light font-semibold" : "text-white/70"
              )}
            >
              {speed === 1 ? "Normal" : `${speed}×`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main PlayerControls ─────────────────────────────────────
export default function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  bufferedEnd,
  volume,
  isMuted,
  playbackRate,
  isFullscreen,
  isSeries,
  subtitleTracks,
  activeSubtitleId,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onPlaybackRateChange,
  onFullscreenToggle,
  onPiPToggle,
  onEpisodesOpen,
  onSubtitleChange,
  visible,
}: PlayerControlsProps) {
  const [subtitleOpen, setSubtitleOpen] = useState(false);

  const remaining = duration > 0 ? duration - currentTime : 0;

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-8 transition-all duration-300",
        "bg-gradient-to-t from-black/80 via-black/30 to-transparent",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      )}
    >
      {/* ── Seek bar ─────────────────────────────────────────── */}
      <div className="mb-3 px-1">
        <SeekBar
          currentTime={currentTime}
          duration={duration}
          bufferedEnd={bufferedEnd}
          onSeek={onSeek}
        />
      </div>

      {/* ── Controls row ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        {/* Left group */}
        <div className="flex items-center gap-3">
          {/* Play / Pause */}
          <button
            onClick={onPlayPause}
            title={isPlaying ? "Pause (K)" : "Play (K)"}
            className="text-white hover:text-accent-gold-light transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 fill-white" />
            ) : (
              <Play className="h-6 w-6 fill-white" />
            )}
          </button>

          {/* Skip back 10s */}
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 10))}
            title="Back 10s (←)"
            className="text-white/70 hover:text-white transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          {/* Skip forward 10s */}
          <button
            onClick={() => onSeek(Math.min(duration, currentTime + 10))}
            title="Forward 10s (→)"
            className="text-white/70 hover:text-white transition-colors"
          >
            <RotateCw className="h-5 w-5" />
          </button>

          {/* Volume */}
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={onVolumeChange}
            onMuteToggle={onMuteToggle}
          />

          {/* Time display */}
          <span className="text-white/70 text-xs font-medium tabular-nums select-none">
            <span className="text-white">{formatTime(currentTime)}</span>
            <span className="mx-1 text-white/40">/</span>
            {duration > 0 ? formatTime(duration) : "--:--"}
          </span>
        </div>

        {/* Right group */}
        <div className="flex items-center gap-1.5">
          {/* Playback speed */}
          <SpeedMenu playbackRate={playbackRate} onSelect={onPlaybackRateChange} />

          {/* Subtitles */}
          <SubtitleSelector
            tracks={subtitleTracks}
            activeId={activeSubtitleId}
            open={subtitleOpen}
            onOpenChange={setSubtitleOpen}
            onSelect={onSubtitleChange}
          />

          {/* Episode list — series only */}
          {isSeries && (
            <button
              onClick={onEpisodesOpen}
              title="Episodes"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-white/70 hover:text-white transition-colors"
            >
              <ListVideo className="h-5 w-5" />
            </button>
          )}

          {/* Picture-in-Picture */}
          <button
            onClick={onPiPToggle}
            title="Picture in Picture"
            className="hidden sm:flex items-center justify-center h-8 w-8 rounded-lg text-white/70 hover:text-white transition-colors"
          >
            <PictureInPicture2 className="h-5 w-5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={onFullscreenToggle}
            title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-white/70 hover:text-white transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}