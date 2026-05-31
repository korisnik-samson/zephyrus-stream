"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ListVideo } from "lucide-react";
import { Skeleton } from "@/components/ui";
import ContentCard, { ContentCardSkeleton } from "@/components/content/ContentCard";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Title } from "@/types/content";

function SortableCard({ title, index }: { title: Title; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: title.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : "auto",
      }}
      className="relative"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute top-2 left-2 z-10 h-7 w-7 rounded-lg liquid-glass-sm flex items-center justify-center cursor-grab active:cursor-grabbing",
          "text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        )}
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="group">
        <ContentCard title={title} index={index} />
      </div>
    </div>
  );
}

export default function MyListPage() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Title[]>("/api/my-list")
      .then((res) => setTitles(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setTitles((items) => {
      const oldIdx = items.findIndex((t) => t.id === active.id);
      const newIdx = items.findIndex((t) => t.id === over.id);
      const reordered = arrayMove(items, oldIdx, newIdx);
      api.post("/api/my-list/reorder", { ids: reordered.map((t) => t.id) }).catch(() => {});
      return reordered;
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8 flex items-baseline gap-3">
          <h1 className="text-3xl font-bold text-text-primary">My List</h1>
          {!loading && titles.length > 0 && (
            <span className="text-sm text-text-muted">{titles.length} title{titles.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Hint */}
        {!loading && titles.length > 0 && (
          <p className="text-xs text-text-muted mb-6 flex items-center gap-1.5">
            <GripVertical className="h-3.5 w-3.5" />
            Drag cards to reorder your list
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <ContentCardSkeleton key={i} />)}
          </div>
        )}

        {/* Sortable grid */}
        {!loading && titles.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={titles.map((t) => t.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {titles.map((title, i) => (
                  <SortableCard key={title.id} title={title} index={i} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Empty state */}
        {!loading && titles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
            <ListVideo className="h-16 w-16 text-text-muted/30" />
            <p className="text-lg text-text-secondary">Your list is empty</p>
            <p className="text-sm text-text-muted">
              Add titles by clicking the + button on any movie or show.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}