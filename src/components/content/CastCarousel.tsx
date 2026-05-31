"use client";

import Image from "next/image";
import { Skeleton } from "@/components/ui";
import { TMDB_IMAGE } from "@/lib/constants";
import { getBlurDataUrl } from "@/lib/utils";
import type { CastMember } from "@/types/content";

interface CastCarouselProps {
  cast: CastMember[];
}

export default function CastCarousel({ cast }: CastCarouselProps) {
  if (!cast || cast.length === 0) return null;

  return (
    <section>
      <h3 className="mb-4 text-lg font-bold text-text-primary">Cast</h3>
      <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2">
        {cast.map((member) => (
          <div
            key={member.id}
            className="flex flex-shrink-0 flex-col items-center gap-2 w-20"
          >
            {/* Avatar */}
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-border bg-bg-card">
              {member.profilePath ? (
                <Image
                  src={`${TMDB_IMAGE.profile.sm}${member.profilePath}`}
                  alt={member.name}
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={getBlurDataUrl()}
                  sizes="80px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-bg-elevated">
                  <span className="text-lg font-bold text-text-muted">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Name */}
            <span className="text-center text-xs font-medium text-text-primary line-clamp-1 w-full">
              {member.name}
            </span>

            {/* Character */}
            <span className="text-center text-[11px] text-text-muted line-clamp-1 w-full -mt-1">
              {member.character}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Skeleton for CastCarousel */
export function CastCarouselSkeleton() {
  return (
    <section>
      <Skeleton className="mb-4 h-6 w-20" />
      <div className="flex gap-5 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-shrink-0 flex-col items-center gap-2 w-20">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-2.5 w-14" />
          </div>
        ))}
      </div>
    </section>
  );
}
