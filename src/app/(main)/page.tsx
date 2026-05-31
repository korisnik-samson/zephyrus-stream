import api from "@/lib/api";
import type { ContentRow as ContentRowType, FeaturedTitle, WatchProgress } from "@/types/content";
import HomeClient from "./HomeClient";

export default async function HomePage() {
    let featured: FeaturedTitle[] = [];
    let rows: ContentRowType[] = [];
    let continueWatching: WatchProgress[] = [];

    const [featuredRes, rowsRes, continueRes] = await Promise.allSettled([
        api.get<FeaturedTitle[]>("/api/content/featured"),
        api.get<ContentRowType[]>("/api/content/rows"),
        api.get<WatchProgress[]>("/api/progress/continue-watching"),
    ]);

    if (featuredRes.status === "fulfilled") featured = featuredRes.value.data ?? [];
    if (rowsRes.status === "fulfilled") rows = rowsRes.value.data ?? [];
    if (continueRes.status === "fulfilled") continueWatching = continueRes.value.data ?? [];

    return <HomeClient featured={featured} rows={rows} continueWatching={continueWatching} />;
}
