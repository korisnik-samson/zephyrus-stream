"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, X, Mic, MicOff, Clock, TrendingUp, ArrowRight,
} from "lucide-react";
import ContentCard, { ContentCardSkeleton } from "@/components/content/ContentCard";
import { useUIStore } from "@/stores/uiStore";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Title } from "@/types/content";

interface SpeechRecognitionEvent extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition ??
    null
  );
}

export default function SearchOverlay() {
  const router = useRouter();
  const { searchOpen, setSearchOpen } = useUIStore();
  const { history, add: addHistory, remove: removeHistory, clear: clearHistory } = useSearchHistory();

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Title[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Open/close side-effects
  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 80);
      api.get<string[]>("/api/search/trending")
        .then((r) => setTrending(r.data ?? []))
        .catch(() => {});
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
      setIsListening(false);
      recognitionRef.current?.abort();
    }
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen]);

  // Escape closes overlay
  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await api.get<Title[]>(`/api/search?q=${encodeURIComponent(query.trim())}`);
        setResults(res.data ?? []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const navigate = useCallback((q: string) => {
    addHistory(q.trim());
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }, [addHistory, setSearchOpen, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(query);
  };

  // Voice search
  const toggleVoice = () => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new Ctor();
    recognitionRef.current = rec;
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e: SpeechRecognitionEvent) => setQuery(e.results[0]?.[0]?.transcript ?? "");
    rec.onerror = () => setIsListening(false);
    rec.start();
  };

  if (!searchOpen) return null;

  const hasQuery = query.trim().length > 0;
  const hasSpeechSupport = !!getSpeechRecognition();

  return (
    <div className="fixed inset-0 z-[60] flex flex-col animate-fade-in"
      style={{ background: "rgba(12,10,8,0.97)", backdropFilter: "blur(20px)" }}
    >
      {/* ── Search bar ─────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 px-4 md:px-8 lg:px-16 h-20 border-b border-white/8 flex-shrink-0"
      >
        <Search className="h-5 w-5 text-text-muted flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, shows, people…"
          className="flex-1 bg-transparent text-lg md:text-xl text-text-primary placeholder:text-text-muted outline-none min-w-0"
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasSpeechSupport && (
            <button
              type="button"
              onClick={toggleVoice}
              title={isListening ? "Stop listening" : "Voice search"}
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center transition-all",
                isListening
                  ? "bg-accent-red/20 text-accent-red"
                  : "liquid-glass-sm text-text-muted hover:text-text-primary"
              )}
            >
              {isListening
                ? <MicOff className="h-4 w-4 animate-pulse" />
                : <Mic className="h-4 w-4" />
              }
            </button>
          )}
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="h-9 w-9 rounded-xl flex items-center justify-center liquid-glass-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Listening indicator */}
      {isListening && (
        <div className="flex items-center justify-center gap-2 py-2 bg-accent-red/10 text-accent-red text-sm animate-pulse">
          <Mic className="h-3.5 w-3.5" />
          Listening…
        </div>
      )}

      {/* ── Content ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 py-8">
        {!hasQuery ? (
          /* Empty state — recent + trending */
          <div className="max-w-4xl mx-auto space-y-10">
            {history.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">
                    Recent Searches
                  </h2>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-text-muted hover:text-accent-purple-light transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((term) => (
                    <div
                      key={term}
                      className="group flex items-center gap-2 liquid-glass-sm px-3 py-2 rounded-xl"
                    >
                      <Clock className="h-3.5 w-3.5 text-text-muted flex-shrink-0" />
                      <button
                        onClick={() => setQuery(term)}
                        className="text-sm text-text-secondary group-hover:text-text-primary transition-colors"
                      >
                        {term}
                      </button>
                      <button
                        onClick={() => removeHistory(term)}
                        className="text-text-muted hover:text-text-primary transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {trending.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
                  Trending Now
                </h2>
                <div className="flex flex-wrap gap-2">
                  {trending.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="flex items-center gap-1.5 liquid-glass-sm px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <TrendingUp className="h-3.5 w-3.5 text-accent-gold flex-shrink-0" />
                      {term}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {history.length === 0 && trending.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <Search className="h-14 w-14 text-text-muted/20" />
                <p className="text-text-secondary">Start typing to search</p>
                <p className="text-sm text-text-muted">
                  Find movies, TV shows, people, and more
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Results */
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => <ContentCardSkeleton key={i} />)}
              </div>
            ) : results.length > 0 ? (
              <>
                <p className="text-sm text-text-muted mb-5">
                  <span className="text-text-primary font-medium">{results.length} results</span> for &ldquo;{query}&rdquo;
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.slice(0, 12).map((title, i) => (
                    <div key={title.id} onClick={() => { addHistory(query); setSearchOpen(false); }}>
                      <ContentCard title={title} index={i} />
                    </div>
                  ))}
                </div>
                {results.length > 12 && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => navigate(query)}
                      className="inline-flex items-center gap-2 liquid-glass px-5 py-2.5 rounded-xl text-sm font-medium text-text-primary hover:text-accent-gold-light transition-colors"
                    >
                      See all {results.length} results
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <Search className="h-14 w-14 text-text-muted/20" />
                <p className="text-text-secondary">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-sm text-text-muted">Try different keywords or browse by category</p>
                <Link
                  href="/categories"
                  onClick={() => setSearchOpen(false)}
                  className="mt-2 text-sm text-accent-purple-light hover:text-accent-purple transition-colors"
                >
                  Browse Categories →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}