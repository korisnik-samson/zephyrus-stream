import { notFound } from "next/navigation";
import api from "@/lib/api";
import type { ContentRow as ContentRowType, Title } from "@/types/content";
import TitleDetailClient from "./TitleDetailClient";

interface TitlePageProps {
    params: Promise<{ id: string }>;
}

export default async function TitlePage({ params }: TitlePageProps) {
    const { id } = await params;

    let title: Title | null = null;
    let similar: ContentRowType | null = null;

    try {
        const titleRes = await api.get<Title>(`/api/content/${id}`);
        if (titleRes.data) {
            title = titleRes.data;
        }
    } catch {
        // Title not found or API error
    }

    if (!title) {
        notFound();
    }

    // Fetch similar content
    try {
        const similarRes = await api.get<ContentRowType>(`/api/content/${id}/similar`);
        if (similarRes.data) {
            similar = similarRes.data;
        }
    } catch {
        // Similar content unavailable — not critical
    }

    return <TitleDetailClient title={title} similar={similar}/>;
}
