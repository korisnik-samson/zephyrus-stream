"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Play, Plus, Share2, Star, ThumbsUp, } from "lucide-react";
import { Badge, Button, Separator, Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui";
import { TMDB_IMAGE } from "@/lib/constants";
import { calculateMatchPercentage, cn, formatRuntime, getBlurDataUrl, getMaturityColor, getYear, } from "@/lib/utils";
import CastCarousel from "@/components/content/CastCarousel";
import EpisodeCard from "@/components/content/EpisodeCard";
import ContentRow from "@/components/content/ContentRow";
import type { ContentRow as ContentRowType, Title } from "@/types/content";

interface TitleDetailClientProps {
    title: Title;
    similar: ContentRowType | null;
}

export default function TitleDetailClient({
                                              title,
                                              similar,
                                          }: TitleDetailClientProps) {
    const [synopsisExpanded, setSynopsisExpanded] = useState(false);
    const matchPct = calculateMatchPercentage(title.id);

    const isLongOverview = title.overview.length > 300;
    const displayOverview =
        isLongOverview && !synopsisExpanded
            ? title.overview.slice(0, 300) + "…"
            : title.overview;

    return (
        <div className="min-h-screen">
            {/* ═══════════════════════════════════════════════════════
         Backdrop Hero (70vh)
         ═══════════════════════════════════════════════════════ */}
            <section className="relative h-[70vh] w-full overflow-hidden">
                {title.backdropPath && (
                    <Image
                        src={`${TMDB_IMAGE.backdrop.original}${title.backdropPath}`}
                        alt={title.title}
                        fill
                        priority
                        className="object-cover object-top"
                        placeholder="blur"
                        blurDataURL={getBlurDataUrl()}
                        sizes="100vw"
                    />
                )}
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 via-bg-primary/40 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-hero"/>
            </section>

            {/* ═══════════════════════════════════════════════════════
         Content Body
         ═══════════════════════════════════════════════════════ */}
            <div className="relative z-10 -mt-48 mx-auto max-w-6xl px-4 md:px-8 lg:px-12 pb-16">
                {/* ─── Title + Meta ──────────────────────────────────── */}
                <h1
                    className="text-3xl font-extrabold text-text-primary md:text-5xl lg:text-6xl mb-4"
                    style={{ textShadow: "0 0 40px rgba(124, 58, 237, 0.3)" }}
                >
                    {title.title}
                </h1>

                {title.tagline && (
                    <p className="mb-3 text-sm font-medium text-accent-purple-light italic">
                        {title.tagline}
                    </p>
                )}

                {/* Metadata line */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary mb-6">
          <span className="font-semibold text-accent-green">
            {matchPct}% Match
          </span>
                    <span>{getYear(title.releaseDate)}</span>
                    <Badge
                        className={cn(
                            "px-2 py-0.5 text-xs font-bold",
                            getMaturityColor(title.maturityRating)
                        )}
                    >
                        {title.maturityRating}
                    </Badge>
                    {title.runtime && <span>{formatRuntime(title.runtime)}</span>}
                    <Badge
                        variant="outline"
                        className="border-border text-text-muted text-xs"
                    >
                        HD
                    </Badge>
                    <div className="flex items-center gap-1 text-accent-gold">
                        <Star className="h-3.5 w-3.5 fill-current"/>
                        <span className="text-xs font-semibold">
              {title.voteAverage.toFixed(1)}
            </span>
                    </div>
                </div>

                {/* ─── Action Buttons ────────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <Button
                        size="lg"
                        className="gap-2 bg-white text-black font-semibold hover:bg-white/90 shadow-lg"
                    >
                        <Play className="h-5 w-5 fill-current"/>
                        Play
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="gap-2 glass border-white/20 text-text-primary hover:bg-white/10"
                    >
                        <Plus className="h-5 w-5"/>
                        My List
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-11 w-11 rounded-full border-border hover:border-white/40 text-text-primary"
                    >
                        <ThumbsUp className="h-5 w-5"/>
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-11 w-11 rounded-full border-border hover:border-white/40 text-text-primary"
                    >
                        <Share2 className="h-5 w-5"/>
                    </Button>
                </div>

                {/* ─── Synopsis ──────────────────────────────────────── */}
                <div className="mb-8 max-w-3xl">
                    <p className="text-sm leading-relaxed text-text-secondary md:text-base">
                        {displayOverview}
                    </p>
                    {isLongOverview && (
                        <button
                            onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                            className="mt-2 flex items-center gap-1 text-xs font-medium text-accent-purple-light hover:text-accent-purple transition-colors"
                        >
                            {synopsisExpanded ? (
                                <>
                                    Show Less <ChevronUp className="h-3.5 w-3.5"/>
                                </>
                            ) : (
                                <>
                                    Read More <ChevronDown className="h-3.5 w-3.5"/>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* ─── Genres ─────────────────────────────────────────── */}
                {title.genres && title.genres.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-8">
                        <span className="text-xs text-text-muted">Genres:</span>
                        {title.genres.map((genre) => (
                            <Badge
                                key={genre.id}
                                variant="secondary"
                                className="bg-bg-elevated text-text-secondary text-xs"
                            >
                                {genre.name}
                            </Badge>
                        ))}
                    </div>
                )}

                <Separator className="bg-border mb-8"/>

                {/* ─── Cast Carousel ──────────────────────────────────── */}
                {title.cast && title.cast.length > 0 && (
                    <div className="mb-10">
                        <CastCarousel cast={title.cast}/>
                    </div>
                )}

                {/* ─── Series: Season Tabs → Episodes ─────────────────── */}
                {title.mediaType === "SERIES" && title.seasons && title.seasons.length > 0 && (
                    <div className="mb-10">
                        <h3 className="mb-4 text-lg font-bold text-text-primary">
                            Episodes
                        </h3>
                        <Tabs
                            defaultValue={title.seasons[0]?.id ?? "s0"}
                            className="w-full"
                        >
                            <TabsList className="mb-4 flex-wrap bg-bg-secondary border border-border">
                                {title.seasons.map((season) => (
                                    <TabsTrigger
                                        key={season.id}
                                        value={season.id}
                                        className="data-[state=active]:bg-accent-purple data-[state=active]:text-white text-text-secondary"
                                    >
                                        {season.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {title.seasons.map((season) => (
                                <TabsContent key={season.id} value={season.id}>
                                    {season.overview && (
                                        <p className="mb-4 text-sm text-text-secondary">
                                            {season.overview}
                                        </p>
                                    )}

                                    <div className="space-y-1">
                                        {season.episodes && season.episodes.length > 0 ? (
                                            season.episodes.map((episode) => (
                                                <EpisodeCard
                                                    key={episode.id}
                                                    episode={episode}
                                                    titleId={title.id}
                                                />
                                            ))
                                        ) : (
                                            <p className="py-8 text-center text-sm text-text-muted">
                                                Episodes will appear here when available.
                                            </p>
                                        )}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                )}

                {/* ─── More Like This ─────────────────────────────────── */}
                {similar && similar.titles.length > 0 && (
                    <div className="mb-10">
                        <h3 className="mb-4 text-lg font-bold text-text-primary">
                            More Like This
                        </h3>
                        <ContentRow row={similar}/>
                    </div>
                )}
            </div>
        </div>
    );
}
