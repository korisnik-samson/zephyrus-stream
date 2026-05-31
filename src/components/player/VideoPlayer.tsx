"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import Hls from "hls.js";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAYER_PROGRESS_INTERVAL } from "@/lib/constants";
import { usePlayerStore } from "@/stores/playerStore";
import api from "@/lib/api";

import BackButton from "./BackButton";
import PlayerOverlay from "./PlayerOverlay";
import PlayerControls from "./PlayerControls";
import SkipIntro from "./SkipIntro";
import NextEpisode from "./NextEpisode";
import EpisodeDrawer from "./EpisodeDrawer";

import type { WatchSession } from "@/types/player";
import type { Season } from "@/types/content";

interface VideoPlayerProps {
  session: WatchSession;
  seasons?: Season[];
}

const CONTROLS_HIDE_DELAY = 3500;
const NEXT_EPISODE_TRIGGER = 30; // show next-ep card when this many seconds remain

export default function VideoPlayer({ session, seasons = [] }: VideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const progressTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const isDragging = useRef(false);

  // ── Playback state ────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── UI state ─────────────────────────────────────────────
  const [showControls, setShowControls] = useState(true);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [activeSubtitleId, setActiveSubtitleId] = useState<string | null>(null);
  const [showNextEpisode, setShowNextEpisode] = useState(false);

  // ── Seek indicator (Netflix-style flash) ─────────────────
  const [seekIndicator, setSeekIndicator] = useState<"back" | "forward" | null>(null);

  // ── Preferences (persisted via Zustand) ──────────────────
  const { volume, isMuted, playbackRate, setVolume, setMuted, setPlaybackRate } =
    usePlayerStore();

  // ────────────────────────────────────────────────────────
  // HLS / Native source setup
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !session.streamUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHLS = session.streamUrl.includes(".m3u8");

    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, backBufferLength: 90 });
      hlsRef.current = hls;
      hls.loadSource(session.streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) console.error("[HLS]", data);
      });
    } else {
      // Safari native HLS or direct MP4/WebM
      video.src = session.streamUrl;
      video.play().catch(() => {});
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [session.streamUrl]);

  // ────────────────────────────────────────────────────────
  // Sync preferences → video element
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = playbackRate;
  }, [volume, isMuted, playbackRate]);

  // ────────────────────────────────────────────────────────
  // Resume from saved progress
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !session.savedProgress) return;
    const onLoaded = () => {
      if (session.savedProgress && session.savedProgress > 10) {
        video.currentTime = session.savedProgress;
      }
    };
    video.addEventListener("loadedmetadata", onLoaded, { once: true });
  }, [session.savedProgress]);

  // ────────────────────────────────────────────────────────
  // Subtitle track management
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    Array.from(video.textTracks).forEach((track) => {
      track.mode = track.id === activeSubtitleId ? "showing" : "hidden";
    });
  }, [activeSubtitleId]);

  // ────────────────────────────────────────────────────────
  // Video event listeners
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => { setIsPlaying(false); setShowNextEpisode(true); };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onCanPlay = () => setIsBuffering(false);

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBufferedEnd(video.buffered.end(video.buffered.length - 1));
      }
      // Trigger next-episode card
      if (
        session.nextEpisodeId &&
        video.duration > 0 &&
        video.duration - video.currentTime <= NEXT_EPISODE_TRIGGER &&
        !showNextEpisode
      ) {
        setShowNextEpisode(true);
      }
    };

    const onLoadedMetadata = () => setDuration(video.duration);
    const onFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [session.nextEpisodeId, showNextEpisode]);

  // ────────────────────────────────────────────────────────
  // Progress saving (every PLAYER_PROGRESS_INTERVAL ms)
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    progressTimer.current = setInterval(() => {
      if (!isPlaying || currentTime < 10) return;
      api
        .post("/api/progress", {
          titleId: session.titleId,
          episodeId: session.episodeId,
          progressSeconds: Math.floor(currentTime),
          durationSeconds: Math.floor(duration),
        })
        .catch(() => {});
    }, PLAYER_PROGRESS_INTERVAL);

    return () => clearInterval(progressTimer.current);
  }, [isPlaying, currentTime, duration, session]);

  // ────────────────────────────────────────────────────────
  // Controls auto-hide
  // ────────────────────────────────────────────────────────
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    // Only auto-hide when playing and no drawer open
    if (isPlaying && !showEpisodeDrawer) {
      controlsTimer.current = setTimeout(
        () => setShowControls(false),
        CONTROLS_HIDE_DELAY
      );
    }
  }, [isPlaying, showEpisodeDrawer]);

  useEffect(() => {
    // Always show controls when paused
    if (!isPlaying) {
      setShowControls(true);
      clearTimeout(controlsTimer.current);
    } else {
      resetControlsTimer();
    }
  }, [isPlaying, resetControlsTimer]);

  // ────────────────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, time));
  }, []);

  const flashSeekIndicator = useCallback((dir: "back" | "forward") => {
    setSeekIndicator(dir);
    setTimeout(() => setSeekIndicator(null), 700);
  }, []);

  const handleVolumeChange = useCallback(
    (v: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.volume = v;
      video.muted = v === 0;
      setVolume(v);
      setMuted(v === 0);
    },
    [setVolume, setMuted]
  );

  const handleMuteToggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, [setMuted]);

  const handlePlaybackRate = useCallback(
    (r: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.playbackRate = r;
      setPlaybackRate(r);
    },
    [setPlaybackRate]
  );

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const togglePiP = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else {
      video.requestPictureInPicture().catch(() => {});
    }
  }, []);

  const handleNextEpisode = useCallback(() => {
    if (session.nextEpisodeId) {
      router.push(`/watch/${session.titleId}?episode=${session.nextEpisodeId}`);
    }
  }, [router, session.titleId, session.nextEpisodeId]);

  const handleEpisodeSelect = useCallback(
    (episodeId: string) => {
      router.push(`/watch/${session.titleId}?episode=${episodeId}`);
    },
    [router, session.titleId]
  );

  const cycleSubtitle = useCallback(() => {
    const tracks = session.subtitleTracks;
    if (tracks.length === 0) return;
    if (activeSubtitleId === null) {
      setActiveSubtitleId(tracks[0]?.id ?? null);
    } else {
      const idx = tracks.findIndex((t) => t.id === activeSubtitleId);
      const next = tracks[idx + 1];
      setActiveSubtitleId(next ? next.id : null);
    }
  }, [session.subtitleTracks, activeSubtitleId]);

  // ────────────────────────────────────────────────────────
  // Keyboard shortcuts
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const video = videoRef.current;
      if (!video) return;

      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault();
          togglePlay();
          resetControlsTimer();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekTo(video.currentTime - 10);
          flashSeekIndicator("back");
          resetControlsTimer();
          break;
        case "ArrowRight":
          e.preventDefault();
          seekTo(video.currentTime + 10);
          flashSeekIndicator("forward");
          resetControlsTimer();
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case "KeyM":
          handleMuteToggle();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyC":
          cycleSubtitle();
          break;
        case "KeyN":
          if (session.nextEpisodeId) handleNextEpisode();
          break;
        case "Escape":
          if (!document.fullscreenElement) router.back();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    togglePlay,
    seekTo,
    flashSeekIndicator,
    handleVolumeChange,
    handleMuteToggle,
    toggleFullscreen,
    cycleSubtitle,
    handleNextEpisode,
    resetControlsTimer,
    volume,
    session.nextEpisodeId,
    router,
  ]);

  // ────────────────────────────────────────────────────────
  // Derived
  // ────────────────────────────────────────────────────────
  const isInIntro =
    session.introStart !== undefined &&
    session.introEnd !== undefined &&
    currentTime >= session.introStart &&
    currentTime < session.introEnd;

  const displayTitle = session.episodeName
    ? `${session.titleName} — S${session.seasonNumber} E${session.episodeNumber}: ${session.episodeName}`
    : session.titleName;

  // ────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-black overflow-hidden select-none"
      onMouseMove={resetControlsTimer}
      style={{ cursor: showControls ? "default" : "none" }}
    >
      {/* ── Video element ─────────────────────────────────── */}
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        playsInline
        onClick={togglePlay}
        onDoubleClick={(e) => {
          // Double-click left = back 10s, right = forward 10s
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          if (e.clientX < rect.left + rect.width / 2) {
            seekTo(currentTime - 10);
            flashSeekIndicator("back");
          } else {
            seekTo(currentTime + 10);
            flashSeekIndicator("forward");
          }
        }}
      >
        {/* Native subtitle tracks */}
        {session.subtitleTracks.map((track) => (
          <track
            key={track.id}
            id={track.id}
            kind={track.kind}
            src={track.src}
            srcLang={track.language}
            label={track.label}
          />
        ))}
      </video>

      {/* ── Buffering spinner ─────────────────────────────── */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Loader2 className="h-12 w-12 text-accent-gold-light animate-spin opacity-80" />
        </div>
      )}

      {/* ── Seek flash indicators ─────────────────────────── */}
      <div className={cn(
        "absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 transition-all duration-300",
        seekIndicator === "back" ? "opacity-100 scale-100" : "opacity-0 scale-90"
      )}>
        <div className="liquid-glass rounded-full px-5 py-3 text-white font-bold text-sm">
          −10s
        </div>
      </div>
      <div className={cn(
        "absolute left-3/4 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 transition-all duration-300",
        seekIndicator === "forward" ? "opacity-100 scale-100" : "opacity-0 scale-90"
      )}>
        <div className="liquid-glass rounded-full px-5 py-3 text-white font-bold text-sm">
          +10s
        </div>
      </div>

      {/* ── Play/Pause overlay ────────────────────────────── */}
      <PlayerOverlay
        isPlaying={isPlaying}
        title={displayTitle}
        subtitle={!isPlaying ? session.overview : undefined}
        showInfo={!isPlaying}
        onTogglePlay={togglePlay}
      />

      {/* ── Back button ───────────────────────────────────── */}
      <BackButton
        visible={showControls}
        label={session.titleName}
        onBack={() => router.back()}
      />

      {/* ── Skip intro ────────────────────────────────────── */}
      <SkipIntro
        visible={isInIntro && showControls}
        onSkip={() => {
          if (session.introEnd) seekTo(session.introEnd);
        }}
      />

      {/* ── Next episode ──────────────────────────────────── */}
      {session.nextEpisodeId && session.nextEpisodeName && (
        <NextEpisode
          visible={showNextEpisode}
          episodeName={session.nextEpisodeName}
          onPlay={handleNextEpisode}
          onCancel={() => setShowNextEpisode(false)}
        />
      )}

      {/* ── Episode drawer (series) ───────────────────────── */}
      {session.mediaType === "SERIES" && (
        <EpisodeDrawer
          open={showEpisodeDrawer}
          onClose={() => setShowEpisodeDrawer(false)}
          seasons={seasons}
          currentEpisodeId={session.episodeId}
          onEpisodeSelect={handleEpisodeSelect}
        />
      )}

      {/* ── Player controls ───────────────────────────────── */}
      <PlayerControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        bufferedEnd={bufferedEnd}
        volume={volume}
        isMuted={isMuted}
        playbackRate={playbackRate}
        isFullscreen={isFullscreen}
        isSeries={session.mediaType === "SERIES"}
        subtitleTracks={session.subtitleTracks}
        activeSubtitleId={activeSubtitleId}
        onPlayPause={togglePlay}
        onSeek={seekTo}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
        onPlaybackRateChange={handlePlaybackRate}
        onFullscreenToggle={toggleFullscreen}
        onPiPToggle={togglePiP}
        onEpisodesOpen={() => setShowEpisodeDrawer(true)}
        onSubtitleChange={setActiveSubtitleId}
        visible={showControls}
      />
    </div>
  );
}