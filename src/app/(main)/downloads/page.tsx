"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Download, Trash2, Play, HardDrive, Wifi, WifiOff,
  CheckCircle2, Loader2, AlertCircle, Settings2,
} from "lucide-react";
import { Skeleton } from "@/components/ui";
import { cn, formatTime, getBlurDataUrl } from "@/lib/utils";
import { TMDB_IMAGE } from "@/lib/constants";
import api from "@/lib/api";
import { toast } from "sonner";

type DownloadQuality = "SD" | "HD" | "FHD";
type DownloadStatus  = "complete" | "downloading" | "expired" | "error";

interface DownloadItem {
  id: string;
  titleId: string;
  episodeId?: string;
  titleName: string;
  episodeName?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  backdropPath: string | null;
  sizeBytes: number;
  quality: DownloadQuality;
  downloadedAt: string;
  expiresAt: string;
  status: DownloadStatus;
  progress?: number; // 0–100 for in-progress
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

function StatusBadge({ status, progress }: { status: DownloadStatus; progress?: number }) {
  if (status === "downloading") {
    return (
      <span className="flex items-center gap-1 text-accent-blue-light text-xs">
        <Loader2 className="h-3 w-3 animate-spin" />
        {progress != null ? `${progress}%` : "Downloading…"}
      </span>
    );
  }
  if (status === "complete")
    return <span className="flex items-center gap-1 text-accent-green text-xs"><CheckCircle2 className="h-3 w-3" />Downloaded</span>;
  if (status === "expired")
    return <span className="flex items-center gap-1 text-accent-red text-xs"><AlertCircle className="h-3 w-3" />Expired</span>;
  return <span className="flex items-center gap-1 text-text-muted text-xs"><AlertCircle className="h-3 w-3" />Error</span>;
}

const QUALITY_LABELS: Record<DownloadQuality, string> = {
  SD: "480p · SD",
  HD: "720p · HD",
  FHD: "1080p · Full HD",
};

export default function DownloadsPage() {
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [qualityPref, setQualityPref] = useState<DownloadQuality>("HD");
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const up = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);

  useEffect(() => {
    api.get<DownloadItem[]>("/api/downloads")
      .then((r) => setItems(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setItems((p) => p.filter((i) => i.id !== id));
    try {
      await api.delete(`/api/downloads/${id}`);
    } catch {
      toast.error("Couldn't delete download");
    }
  };

  const handleDeleteAll = async () => {
    setItems([]);
    try { await api.delete("/api/downloads"); toast.success("All downloads deleted"); }
    catch { toast.error("Couldn't delete all downloads"); }
  };

  const totalBytes = items.reduce((s, i) => s + i.sizeBytes, 0);
  // Assume 5 GB device allocation for the app
  const deviceLimitBytes = 5 * 1024 ** 3;
  const usedPct = Math.min(100, (totalBytes / deviceLimitBytes) * 100);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text-primary">Downloads</h1>
            <span className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
              isOnline ? "bg-accent-green/15 text-accent-green" : "bg-accent-red/15 text-accent-red"
            )}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="text-sm text-text-muted hover:text-accent-red transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Delete all
              </button>
            )}
            {/* Quality settings */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu((o) => !o)}
                className="flex items-center gap-1.5 liquid-glass-sm px-3 py-2 rounded-xl text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                <Settings2 className="h-3.5 w-3.5" />
                {QUALITY_LABELS[qualityPref].split("·")[0].trim()}
              </button>
              {showQualityMenu && (
                <div className="absolute right-0 top-10 z-20 liquid-glass rounded-xl py-1.5 w-40 animate-scale-in">
                  {(["SD", "HD", "FHD"] as DownloadQuality[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => { setQualityPref(q); setShowQualityMenu(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm transition-colors hover:bg-white/8",
                        qualityPref === q ? "text-accent-gold-light font-medium" : "text-text-secondary"
                      )}
                    >
                      {QUALITY_LABELS[q]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Storage bar ───────────────────────────────────── */}
        {!loading && items.length > 0 && (
          <div className="liquid-glass rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <HardDrive className="h-4 w-4" />
                <span>Storage used</span>
              </div>
              <span className="text-sm text-text-muted">
                {formatBytes(totalBytes)} / {formatBytes(deviceLimitBytes)}
              </span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${usedPct}%`,
                  background: usedPct > 85
                    ? "linear-gradient(to right, #ef4444, #f87171)"
                    : "linear-gradient(to right, #c2410c, #fb923c)",
                }}
              />
            </div>
          </div>
        )}

        {/* ── Loading ───────────────────────────────────────── */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-bg-card">
                <Skeleton className="w-32 aspect-video rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2 w-20 mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Download list ─────────────────────────────────── */}
        {!loading && items.length > 0 && (
          <div className="space-y-2">
            {items.map((item) => {
              const watchHref = item.episodeId
                ? `/watch/${item.titleId}?episode=${item.episodeId}`
                : `/watch/${item.titleId}`;
              const expiring = item.status === "complete" && daysUntil(item.expiresAt) <= 3;

              return (
                <div
                  key={item.id}
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-bg-card border border-border hover:border-border-hover transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden bg-bg-elevated">
                    {item.backdropPath && (
                      <Image
                        src={`${TMDB_IMAGE.backdrop.sm}${item.backdropPath}`}
                        alt={item.titleName}
                        fill
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL={getBlurDataUrl()}
                        sizes="128px"
                      />
                    )}
                    {item.status === "downloading" && item.progress != null && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{item.progress}%</span>
                      </div>
                    )}
                    {item.status === "downloading" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div
                          className="h-full bg-accent-blue"
                          style={{ width: `${item.progress ?? 0}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary line-clamp-1">
                      {item.titleName}
                    </h3>
                    {item.episodeName && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                        S{item.seasonNumber} E{item.episodeNumber}: {item.episodeName}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                      <StatusBadge status={item.status} progress={item.progress} />
                      <span className="text-xs text-text-muted">{QUALITY_LABELS[item.quality]}</span>
                      <span className="text-xs text-text-muted">{formatBytes(item.sizeBytes)}</span>
                    </div>
                    {item.status === "complete" && (
                      <p className={cn(
                        "text-xs mt-1",
                        expiring ? "text-accent-gold" : "text-text-muted"
                      )}>
                        {expiring
                          ? `⚠ Expires in ${daysUntil(item.expiresAt)} day${daysUntil(item.expiresAt) !== 1 ? "s" : ""}`
                          : `Expires in ${daysUntil(item.expiresAt)} days`}
                      </p>
                    )}
                    {item.status === "complete" && (
                      <Link
                        href={watchHref}
                        className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-accent-purple-light hover:text-accent-purple transition-colors"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        Watch Offline
                      </Link>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red transition-all flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────── */}
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
            <div className="liquid-glass h-20 w-20 rounded-2xl flex items-center justify-center">
              <Download className="h-9 w-9 text-text-muted/50" />
            </div>
            <p className="text-lg text-text-secondary">No downloads yet</p>
            <p className="text-sm text-text-muted max-w-xs">
              Download movies and episodes to watch offline. Look for the download icon on any title.
            </p>
            <Link
              href="/"
              className="mt-2 liquid-glass-sm px-5 py-2.5 rounded-xl text-sm font-medium text-text-primary hover:text-accent-gold-light transition-colors"
            >
              Browse Content
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}