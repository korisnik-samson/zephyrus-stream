"use client";

import HeroBillboard from "@/components/content/HeroBillboard";
import ContentRow from "@/components/content/ContentRow";
import ContinueWatchingRow from "@/components/content/ContinueWatchingRow";
import type { ContentRow as ContentRowType, FeaturedTitle, WatchProgress } from "@/types/content";

interface HomeClientProps {
    featured: FeaturedTitle[];
    rows: ContentRowType[];
    continueWatching: WatchProgress[];
}

export default function HomeClient({ featured, rows, continueWatching }: HomeClientProps) {
    return (
        <div className="min-h-screen">
            <HeroBillboard items={featured} />

            <div className="relative z-10 -mt-16 space-y-2 pb-16">
                {/* Continue Watching — shown first if items exist */}
                {continueWatching.length > 0 && (
                    <ContinueWatchingRow items={continueWatching} />
                )}

                {rows.map((row) => (
                    <ContentRow
                        key={row.id}
                        row={row}
                        seeAllHref={row.genreId ? `/browse/${row.genreId}` : undefined}
                    />
                ))}

                {rows.length === 0 && continueWatching.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <p className="text-text-muted text-lg">Content is loading or unavailable.</p>
                        <p className="text-text-muted text-sm mt-1">Check back soon for new titles.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
