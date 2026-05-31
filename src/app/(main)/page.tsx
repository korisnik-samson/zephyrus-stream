import api from "@/lib/api";
import type { ContentRow as ContentRowType, FeaturedTitle } from "@/types/content";
import HomeClient from "./HomeClient";

export default async function HomePage() {
    let featured: FeaturedTitle[] = [];
    let rows: ContentRowType[] = [];

    try {
        const [featuredRes, rowsRes] = await Promise.allSettled([
            api.get<FeaturedTitle[]>("/api/content/featured"),
            api.get<ContentRowType[]>("/api/content/rows"),
        ]);

        if (featuredRes.status === "fulfilled" && featuredRes.value.data) featured = featuredRes.value.data;

        if (rowsRes.status === "fulfilled" && rowsRes.value.data) rows = rowsRes.value.data;

    } catch {
        // Gracefully handle — components will show empty/skeleton states
    }

    return <HomeClient featured={featured} rows={rows}/>;
}
