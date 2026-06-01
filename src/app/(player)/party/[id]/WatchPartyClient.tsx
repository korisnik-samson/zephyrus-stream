"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Hls from "hls.js";
import { ArrowLeft, Play, Pause, MessageSquare, Loader2 } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useWatchParty } from "@/hooks/useWatchParty";
import WatchPartyChat from "@/components/player/WatchPartyChat";
import type { WatchSession } from "@/types/player";
import type { PartyMember } from "@/types/watchParty";

interface WatchPartyClientProps {
  partyId: string;
  session: WatchSession;
  isHost: boolean;
}

export default function WatchPartyClient({ partyId, session, isHost }: WatchPartyClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const suppressBroadcast = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);

  const self: PartyMember = {
    id: user?.id || "guest",
    name: user?.displayName || "Guest",
    avatarUrl: user?.avatarUrl ?? null,
    isHost,
  };

  // ── Apply remote playback events (guests follow host) ─────
  const handleRemoteEvent = useCallback(
    (event: { type: "play" | "pause" | "seek"; time: number }) => {
      const video = videoRef.current;
      if (!video || isHost) return;
      suppressBroadcast.current = true;
      if (Math.abs(video.currentTime - event.time) > 1.5) video.currentTime = event.time;
      if (event.type === "play") video.play().catch(() => {});
      if (event.type === "pause") video.pause();
      setTimeout(() => { suppressBroadcast.current = false; }, 200);
    },
    [isHost]
  );

  const { connected, members, messages, sendChat, broadcastPlayback } = useWatchParty({
    partyId,
    self,
    onRemoteEvent: handleRemoteEvent,
  });

  // ── Source setup ──────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !session.streamUrl) return;

    if (session.streamUrl.includes(".m3u8") && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(session.streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = session.streamUrl;
    }
    return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
  }, [session.streamUrl]);

  // ── Video events ──────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => { setIsPlaying(true); if (!suppressBroadcast.current) broadcastPlayback("play", video.currentTime); };
    const onPause = () => { setIsPlaying(false); if (!suppressBroadcast.current) broadcastPlayback("pause", video.currentTime); };
    const onTime = () => setCurrentTime(video.currentTime);
    const onMeta = () => setDuration(video.duration);
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);
    const onCanPlay = () => setBuffering(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("canplay", onCanPlay);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [broadcastPlayback]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || !isHost) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video || !isHost) return;
    video.currentTime = time;
    broadcastPlayback("seek", time);
  };

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden">
      {/* Player area */}
      <div className="relative flex-1 min-w-0">
        {/* Back */}
        <button
          onClick={() => router.push(`/title/${session.titleId}`)}
          className="absolute top-5 left-5 z-30 flex items-center gap-2 liquid-glass-sm px-4 py-2 rounded-xl text-white text-sm font-medium hover:text-accent-gold-light transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Leave Party
        </button>

        {/* Chat toggle (mobile) */}
        <button
          onClick={() => setChatOpen((o) => !o)}
          className="lg:hidden absolute top-5 right-5 z-30 h-10 w-10 rounded-xl liquid-glass-sm flex items-center justify-center text-white"
        >
          <MessageSquare className="h-5 w-5" />
        </button>

        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          playsInline
          onClick={togglePlay}
        />

        {/* Buffering */}
        {buffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader2 className="h-12 w-12 text-accent-gold-light animate-spin opacity-80" />
          </div>
        )}

        {/* Guest notice */}
        {!isHost && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 liquid-glass-sm px-4 py-1.5 rounded-full text-xs text-white/80">
            Synced with host
          </div>
        )}

        {/* Controls (host only can scrub/play) */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-5 pt-12 bg-gradient-to-t from-black/80 to-transparent">
          {/* Seek */}
          <div
            className={cn("relative h-1.5 w-full bg-white/20 rounded-full mb-3", isHost ? "cursor-pointer" : "cursor-default")}
            onClick={(e) => {
              if (!isHost || !duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              handleSeek(((e.clientX - rect.left) / rect.width) * duration);
            }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                background: "linear-gradient(to right, #c2410c, #fb923c)",
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              disabled={!isHost}
              className="text-white hover:text-accent-gold-light transition-colors disabled:opacity-50"
              title={isHost ? "" : "Only the host can control playback"}
            >
              {isPlaying ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white" />}
            </button>
            <span className="text-xs text-white/70 tabular-nums">
              {formatTime(currentTime)} / {duration ? formatTime(duration) : "--:--"}
            </span>
            <span className="ml-auto text-sm text-white/90 font-medium truncate">
              {session.titleName}
            </span>
          </div>
        </div>
      </div>

      {/* Chat sidebar */}
      <div className={cn(
        "h-full w-full sm:w-80 flex-shrink-0 transition-all duration-300",
        chatOpen ? "block" : "hidden lg:block",
        "absolute lg:relative inset-y-0 right-0 z-40 lg:z-auto max-w-[85vw] lg:max-w-none"
      )}>
        <WatchPartyChat
          connected={connected}
          members={members}
          messages={messages}
          selfId={self.id}
          onSend={sendChat}
          onClose={() => setChatOpen(false)}
        />
      </div>
    </div>
  );
}