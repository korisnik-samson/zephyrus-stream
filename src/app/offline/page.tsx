import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = { title: "You're Offline | Zephyrus" };

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-bg-primary px-4 text-center">
      <div className="liquid-glass h-20 w-20 rounded-2xl flex items-center justify-center">
        <WifiOff className="h-9 w-9 text-text-muted" />
      </div>
      <h1 className="text-2xl font-bold text-white">You&apos;re offline</h1>
      <p className="text-sm text-text-muted max-w-xs">
        No internet connection. Check your network and try again, or watch your downloaded content.
      </p>
      <div className="flex gap-3">
        <Link href="/downloads" className="liquid-glass-sm px-5 py-2.5 rounded-xl text-sm font-medium text-text-primary hover:text-accent-gold-light transition-colors">
          My Downloads
        </Link>
        <Link href="/" className="bg-gradient-purple-btn text-white px-5 py-2.5 rounded-xl text-sm font-medium">
          Try Again
        </Link>
      </div>
    </div>
  );
}