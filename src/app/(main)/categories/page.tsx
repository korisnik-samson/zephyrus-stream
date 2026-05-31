import Link from "next/link";
import { Layers } from "lucide-react";
import ContentRow from "@/components/content/ContentRow";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Genre, ContentRow as ContentRowType } from "@/types/content";

export const metadata = { title: "Browse Categories | Zephyrus" };

// Genre → warm gradient (complements orange theme)
const GENRE_GRADIENTS: Record<string, string> = {
  Action:      "from-orange-900 to-red-900",
  Adventure:   "from-amber-900 to-orange-800",
  Animation:   "from-violet-900 to-purple-800",
  Comedy:      "from-yellow-800 to-amber-700",
  Crime:       "from-zinc-800 to-slate-900",
  Documentary: "from-teal-900 to-cyan-800",
  Drama:       "from-blue-900 to-indigo-800",
  Fantasy:     "from-purple-900 to-violet-800",
  Horror:      "from-red-950 to-gray-900",
  Mystery:     "from-slate-800 to-zinc-900",
  Romance:     "from-rose-900 to-pink-800",
  "Sci-Fi":    "from-cyan-900 to-blue-800",
  Thriller:    "from-gray-800 to-slate-900",
  War:         "from-stone-800 to-neutral-900",
  Western:     "from-amber-800 to-yellow-900",
  History:     "from-orange-950 to-amber-900",
  Music:       "from-pink-900 to-rose-800",
  Sport:       "from-green-900 to-emerald-800",
  Family:      "from-sky-800 to-blue-700",
};

function getGradient(name: string) {
  return GENRE_GRADIENTS[name] ?? "from-bg-elevated to-bg-card";
}

const CURATED_COLLECTIONS = [
  { slug: "award-winners",       label: "Award Winners 🏆" },
  { slug: "binge-worthy",        label: "Binge-Worthy" },
  { slug: "critically-acclaimed", label: "Critically Acclaimed" },
  { slug: "new-and-fresh",       label: "New & Fresh" },
  { slug: "feel-good",           label: "Feel-Good Picks" },
  { slug: "date-night",          label: "Date Night" },
];

export default async function CategoriesPage() {
  const [genresRes, ...collectionResults] = await Promise.allSettled([
    api.get<Genre[]>("/api/genres"),
    ...CURATED_COLLECTIONS.map((c) =>
      api.get<ContentRowType>(`/api/content/collections/${c.slug}`)
    ),
  ]);

  const genres: Genre[] = genresRes.status === "fulfilled" ? (genresRes.value.data ?? []) : [];

  const collections: (ContentRowType | null)[] = collectionResults.map((r, i) => {
    if (r.status === "fulfilled" && r.value.data) return r.value.data;
    // Fallback stub so the page renders even when backend is offline
    return {
      id: CURATED_COLLECTIONS[i]!.slug,
      label: CURATED_COLLECTIONS[i]!.label,
      rowType: "PERSONALIZED" as const,
      titles: [],
    };
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* ── Genre Grid ─────────────────────────────────────── */}
      <section className="px-4 md:px-8 lg:px-12 mb-14">
        <div className="flex items-center gap-3 mb-6">
          <Layers className="h-5 w-5 text-accent-purple-light" />
          <h1 className="text-2xl font-bold text-text-primary">Browse by Genre</h1>
        </div>

        {genres.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {genres.map((genre) => (
              <Link
                key={genre.id}
                href={`/browse/${genre.tmdbId}`}
                className={cn(
                  "group relative h-24 rounded-2xl overflow-hidden bg-gradient-to-br cursor-pointer",
                  "transition-transform duration-200 hover:scale-[1.03] hover:shadow-card-hover",
                  getGradient(genre.name)
                )}
              >
                {/* Specular top edge */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                <div className="absolute inset-0 flex items-end p-3">
                  <span className="text-sm font-bold text-white drop-shadow-sm">
                    {genre.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Fallback grid with common genre names when backend is offline */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Object.entries(GENRE_GRADIENTS).map(([name, gradient]) => (
              <Link
                key={name}
                href={`/browse/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className={cn(
                  "group relative h-24 rounded-2xl overflow-hidden bg-gradient-to-br",
                  "transition-transform duration-200 hover:scale-[1.03] hover:shadow-card-hover",
                  gradient
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                <div className="absolute inset-0 flex items-end p-3">
                  <span className="text-sm font-bold text-white drop-shadow-sm">{name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Curated Collections ─────────────────────────────── */}
      {collections.some((c) => c && c.titles.length > 0) && (
        <section>
          <div className="px-4 md:px-8 lg:px-12 mb-2">
            <h2 className="text-2xl font-bold text-text-primary">Curated Collections</h2>
          </div>
          <div className="space-y-2">
            {collections.map((col) =>
              col && col.titles.length > 0 ? (
                <ContentRow key={col.id} row={col} />
              ) : null
            )}
          </div>
        </section>
      )}
    </div>
  );
}
