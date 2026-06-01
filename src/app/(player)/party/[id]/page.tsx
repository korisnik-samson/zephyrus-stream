import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import WatchPartyClient from "./WatchPartyClient";
import type { WatchSession } from "@/types/player";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ title?: string; episode?: string; host?: string }>;
}

export const metadata = { title: "Watch Party | Zephyrus" };

export default async function WatchPartyPage({ params, searchParams }: PageProps) {
  const { id: partyId } = await params;
  const { title, episode, host } = await searchParams;

  const titleId = title ?? partyId;
  const isHost = host === "1";

  let session: WatchSession | null = null;
  try {
    const endpoint = episode
      ? `/api/content/${titleId}/watch?episode=${episode}`
      : `/api/content/${titleId}/watch`;
    const res = await api.get<WatchSession>(endpoint);
    session = res.data ?? null;
  } catch {
    // handled below
  }

  if (!session) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4 bg-black text-white">
        <AlertTriangle className="h-10 w-10 text-accent-gold" />
        <p className="text-lg font-semibold">Party Unavailable</p>
        <p className="text-sm text-white/50">This watch party could not be loaded.</p>
        <Link href="/" className="mt-2 text-sm text-accent-gold-light hover:text-accent-gold transition-colors">
          ← Back to Browse
        </Link>
      </div>
    );
  }

  return <WatchPartyClient partyId={partyId} session={session} isHost={isHost} />;
}