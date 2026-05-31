"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Trash2, History } from "lucide-react";
import { Skeleton } from "@/components/ui";
import { TMDB_IMAGE } from "@/lib/constants";
import { cn, formatTime, getBlurDataUrl } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import type { WatchProgress } from "@/types/content";

function groupByRecency(items: WatchProgress[]): Record<string, WatchProgress[]> {
  const now = Date.now();
  const DAY = 86_400_000;
  const groups: Record<string, WatchProgress[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Earlier: [],
  };
  for (const item of items) {
    const age = now - new Date(item.lastWatchedAt).getTime();
    if (age < DAY)           groups["Today"]!.push(item);
    else if (age < 2 * DAY)  groups["Yesterday"]!.push(item);
    else if (age < 7 * DAY)  groups["This Week"]!.push(item);
    else                     groups["Earlier"]!.push(item);
  }
  return groups;
}

function HistoryCard({
  item,
  onRemove,
}: {
  item: WatchProgress;
  onRemove: (id: string) => void;
}) {
  const title = item.title;
  if (!title) return null;

  const pct = item.durationSeconds > 0
    ? Math.min(100, (item.progressSeconds / item.durationSeconds) * 100)
    : 0;
  const remaining = item.durationSeconds - item.progressSeconds;

  const watchHref = item.episodeId
    ? `/watch/${title.id}?episode=${item.episodeId}`
    : `/watch/${title.id}`;

  const handleRemove = async () => {
    onRemove(item.id);
    try {
      await api.delete(`/api/progress/${item.id}`);
    } catch {
      toast.error("Couldn't remove item");
    }
  };

  return (
    <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-bg-elevated transition-colors">
      {/* Thumbnail */}
      <Link href={watchHref} className="flex-shrink-0">
        <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-bg-card">
          {title.backdropPath ? (
            <Image
              src={`${TMDB_IMAGE.backdrop.sm}${title.backdropPath}`}
              alt={title.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              placeholder="blur"
              blurDataURL={getBlurDataUrl()}
              sizes="160px"
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
            <div className="liquid-glass h-9 w-9 rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform">
              <Play className="h-4 w-4 text-white fill-white ml-0.5" />
            </div>
          </div>
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
            <div
              className="h-full"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(to right, #c2410c, #fb923c)",
              }}
            />
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 pt-0.5">
        <Link href={`/title/${title.id}`}>
          <h3 className="text-sm font-semibold text-text-primary hover:text-accent-purple-light transition-colors line-clamp-1">
            {title.title}
          </h3>
        </Link>
        {item.episode && (
          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
            E{item.episode.episodeNumber}: {item.episode.name}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <div className="h-1 w-28 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(to right, #c2410c, #fb923c)",
              }}
            />
          </div>
          <span className="text-[11px] text-text-muted">{Math.round(pct)}%</span>
          {remaining > 60 && !item.completed && (
            <span className="text-[11px] text-text-muted">· {formatTime(remaining)} left</span>
          )}
          {item.completed && (
            <span className="text-[11px] text-accent-green">· Completed</span>
          )}
        </div>
        <Link
          href={watchHref}
          className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-accent-purple-light hover:text-accent-purple transition-colors"
        >
          <Play className="h-3 w-3 fill-current" />
          {item.completed ? "Watch Again" : "Continue"}
        </Link>
      </div>

      {/* Delete */}
      <button
        onClick={handleRemove}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red transition-all mt-1"
        aria-label="Remove from history"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function HistoryPage() {
  const [items, setItems] = useState<WatchProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<WatchProgress[]>("/api/progress/history")
      .then((res) => setItems(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const clearAll = async () => {
    setItems([]);
    try {
      await api.delete("/api/progress/history");
      toast.success("Watch history cleared");
    } catch {
      toast.error("Couldn't clear history");
    }
  };

  const groups = groupByRecency(items);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">Watch History</h1>
          {items.length > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-text-muted hover:text-accent-red transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-3">
                <Skeleton className="w-40 aspect-video rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-1 w-28" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grouped history */}
        {!loading && items.length > 0 && (
          <div className="space-y-8">
            {Object.entries(groups).map(([label, groupItems]) => {
              if (groupItems.length === 0) return null;
              return (
                <div key={label}>
                  <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">
                    {label}
                  </h2>
                  <div className="space-y-1">
                    {groupItems.map((item) => (
                      <HistoryCard key={item.id} item={item} onRemove={handleRemove} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty */}
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
            <History className="h-16 w-16 text-text-muted/30" />
            <p className="text-lg text-text-secondary">No watch history yet</p>
            <p className="text-sm text-text-muted">
              Start watching to see your history here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}