"use client";

import HeroBillboard from "@/components/content/HeroBillboard";
import ContentRow from "@/components/content/ContentRow";
import type { ContentRow as ContentRowType, FeaturedTitle } from "@/types/content";

interface HomeClientProps {
    featured: FeaturedTitle[];
    rows: ContentRowType[];
}

export default function HomeClient({ featured, rows }: HomeClientProps) {
    return (
        <div className="min-h-screen">
            {/* Hero Billboard */}
            <HeroBillboard items={featured}/>

            {/* Content Rows — slightly overlap the hero */}
            <div className="relative z-10 -mt-16 space-y-2 pb-16">
                {rows.map((row) => (
                    <ContentRow key={row.id} row={row} seeAllHref={
                            row.genreId ? `/browse/${row.genreId}` : undefined}/>
                ))}

                {/* Fallback if no rows loaded */}
                {rows.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <p className="text-text-muted text-lg">
                            Content is loading or unavailable.
                        </p>
                        <p className="text-text-muted text-sm mt-1">
                            Check back soon for new titles.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
