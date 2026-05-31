"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info } from "lucide-react";
import { Skeleton } from "@/components/ui";
import { TMDB_IMAGE, HERO_ROTATE_INTERVAL } from "@/lib/constants";
import { cn, truncate, getBlurDataUrl } from "@/lib/utils";
import type { FeaturedTitle } from "@/types/content";

interface HeroBillboardProps {
  items: FeaturedTitle[];
}

export default function HeroBillboard({ items }: HeroBillboardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ─── Auto-rotate ──────────────────────────────────────────
  const goTo = useCallback(
    (index: number) => {
      if (index === activeIndex || items.length === 0) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex(index);
        setIsTransitioning(false);
      }, 400);
    },
    [activeIndex, items.length]
  );

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      goTo((activeIndex + 1) % items.length);
    }, HERO_ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [activeIndex, items.length, goTo]);

  // ─── Loading / empty state ────────────────────────────────
  if (!items || items.length === 0) {
    return (
      <div className="relative h-[80vh] w-full bg-bg-secondary">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-hero" />
        <div className="absolute bottom-20 left-8 md:left-12 lg:left-16 space-y-4">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-4 w-72" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 w-32 rounded-md" />
            <Skeleton className="h-11 w-40 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  const current = items[activeIndex];
  if (!current) return null;

  return (
    <section className="relative h-[80vh] w-full overflow-hidden">
      {/* ─── Backdrop Image ──────────────────────────────────── */}
      {current.backdropPath && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            isTransitioning ? "opacity-0" : "opacity-100"
          )}
        >
          <Image
            src={`${TMDB_IMAGE.backdrop.original}${current.backdropPath}`}
            alt={current.title}
            fill
            priority
            className="object-cover object-top"
            placeholder="blur"
            blurDataURL={getBlurDataUrl()}
            sizes="100vw"
          />
        </div>
      )}

      {/* ─── Gradient overlays ───────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 via-bg-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-hero" />

      {/* ─── Content ─────────────────────────────────────────── */}
      <div
        className={cn(
          "absolute bottom-24 left-6 right-6 md:left-12 md:right-auto md:max-w-xl lg:left-16 lg:max-w-2xl transition-all duration-500",
          isTransitioning
            ? "translate-y-4 opacity-0"
            : "translate-y-0 opacity-100"
        )}
      >
        {/* Logo or title text */}
        {current.logoPath ? (
          <div className="relative mb-4 h-24 w-72 md:h-28 md:w-80">
            <Image
              src={`${TMDB_IMAGE.backdrop.lg}${current.logoPath}`}
              alt={current.title}
              fill
              className="object-contain object-left"
            />
          </div>
        ) : (
          <h1
            className="mb-4 text-3xl font-extrabold leading-tight text-text-primary md:text-5xl lg:text-6xl"
            style={{
              textShadow: "0 0 40px rgba(124, 58, 237, 0.3)",
            }}
          >
            {current.title}
          </h1>
        )}

        {/* Tagline */}
        {current.tagline && (
          <p className="mb-2 text-sm font-medium text-accent-purple-light italic">
            {current.tagline}
          </p>
        )}

        {/* Overview */}
        <p className="mb-6 text-sm leading-relaxed text-text-secondary line-clamp-2 md:text-base">
          {truncate(current.overview, 200)}
        </p>

        {/* Action buttons — use Link directly instead of Button asChild */}
        <div className="flex items-center gap-3">
          <Link
            href={`/title/${current.id}`}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-white text-black font-semibold hover:bg-white/90 shadow-lg text-sm transition-all"
          >
            <Play className="h-5 w-5 fill-current" />
            Play
          </Link>

          <Link
            href={`/title/${current.id}`}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg glass border border-white/20 text-text-primary hover:bg-white/10 text-sm font-medium transition-all"
          >
            <Info className="h-5 w-5" />
            More Info
          </Link>
        </div>
      </div>

      {/* ─── Navigation dots ─────────────────────────────────── */}
      {items.length > 1 && (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIndex
                  ? "w-8 bg-accent-purple"
                  : "w-3 bg-white/30 hover:bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
