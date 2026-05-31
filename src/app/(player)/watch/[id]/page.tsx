import { Suspense } from "react";
import { AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import VideoPlayer from "@/components/player/VideoPlayer";
import type { WatchSession } from "@/types/player";
import type { Season, Title } from "@/types/content";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ episode?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const res = await api.get<Title>(`/api/content/${id}`);
    const title = res.data;
    if (title) return { title: `Watch ${title.title} | Zephyrus` };
  } catch {
    // fall through
  }
  return { title: "Watch | Zephyrus" };
}

export default async function WatchPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { episode: episodeId } = await searchParams;

  let session: WatchSession | null = null;
  let seasons: Season[] = [];

  try {
    const endpoint = episodeId
      ? `/api/content/${id}/watch?episode=${episodeId}`
      : `/api/content/${id}/watch`;

    const [sessionRes, seasonsRes] = await Promise.allSettled([
      api.get<WatchSession>(endpoint),
      api.get<Season[]>(`/api/content/${id}/seasons`),
    ]);

    if (sessionRes.status === "fulfilled") session = sessionRes.value.data ?? null;
    if (seasonsRes.status === "fulfilled") seasons = seasonsRes.value.data ?? [];
  } catch {
    // Handled below
  }

  if (!session) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4 bg-black text-white">
        <AlertTriangle className="h-10 w-10 text-accent-gold" />
        <p className="text-lg font-semibold">Content Unavailable</p>
        <p className="text-sm text-white/50">
          This title could not be loaded. The backend may be offline.
        </p>
        <a
          href="/"
          className="mt-2 text-sm text-accent-gold-light hover:text-accent-gold transition-colors"
        >
          ← Back to Browse
        </a>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="h-full w-full flex items-center justify-center bg-black">
          <div className="h-10 w-10 rounded-full border-2 border-accent-gold border-t-transparent animate-spin" />
        </div>
      }
    >
      <VideoPlayer session={session} seasons={seasons} />
    </Suspense>
  );
}