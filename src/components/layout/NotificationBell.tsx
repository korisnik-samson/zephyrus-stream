"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, X, Film, Play, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Notification, NotificationType } from "@/types/notifications";

function typeIcon(type: NotificationType) {
  switch (type) {
    case "NEW_RELEASE":    return <Film className="h-4 w-4 text-accent-purple-light" />;
    case "CONTINUE_WATCHING": return <Play className="h-4 w-4 text-accent-gold" />;
    case "RECOMMENDATION": return <Sparkles className="h-4 w-4 text-accent-green" />;
    default:               return <Info className="h-4 w-4 text-accent-blue-light" />;
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch on open
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.get<Notification[]>("/api/notifications")
      .then((res) => setNotifications(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await api.post(`/api/notifications/${id}/read`).catch(() => {});
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await api.post("/api/notifications/read-all").catch(() => {});
  };

  const dismiss = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await api.delete(`/api/notifications/${id}`).catch(() => {});
  };

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative h-9 w-9 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-accent-red text-[10px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 animate-scale-in liquid-glass rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-accent-purple-light hover:text-accent-purple transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
            {loading && (
              <div className="flex items-center justify-center py-10">
                <div className="h-5 w-5 rounded-full border-2 border-accent-gold border-t-transparent animate-spin" />
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell className="h-8 w-8 text-white/20" />
                <p className="text-xs text-white/40">No notifications yet</p>
              </div>
            )}

            {!loading && notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "relative group/notif flex items-start gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0",
                  !n.read && "bg-accent-purple/5"
                )}
                onClick={() => {
                  markRead(n.id);
                  setOpen(false);
                }}
              >
                {/* Type icon */}
                <div className="mt-0.5 flex-shrink-0 h-8 w-8 rounded-lg liquid-glass-sm flex items-center justify-center">
                  {typeIcon(n.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {n.actionUrl ? (
                    <Link href={n.actionUrl} className="block">
                      <p className={cn("text-xs font-semibold line-clamp-1", n.read ? "text-white/70" : "text-white")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-white/40 line-clamp-2 mt-0.5">{n.message}</p>
                    </Link>
                  ) : (
                    <>
                      <p className={cn("text-xs font-semibold line-clamp-1", n.read ? "text-white/70" : "text-white")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-white/40 line-clamp-2 mt-0.5">{n.message}</p>
                    </>
                  )}
                  <p className="text-[10px] text-white/25 mt-1">{timeAgo(n.createdAt)}</p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <div className="mt-1.5 flex-shrink-0 h-2 w-2 rounded-full bg-accent-purple" />
                )}

                {/* Dismiss */}
                <button
                  onClick={(e) => dismiss(e, n.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover/notif:opacity-100 text-white/30 hover:text-white/70 transition-all"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}