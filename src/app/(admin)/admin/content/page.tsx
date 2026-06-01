"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search, Plus, Upload, Pencil, Trash2, Film, Tv,
  MoreVertical, X,
} from "lucide-react";
import { Input, Badge } from "@/components/ui";
import { cn, formatNumber, formatDate, getMaturityColor } from "@/lib/utils";
import api from "@/lib/api";
import { getDemoTitles } from "@/lib/adminDemo";
import { toast } from "sonner";
import type { AdminTitle } from "@/types/admin";

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED";

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-accent-green/15 text-accent-green",
  DRAFT:     "bg-accent-gold/15 text-accent-gold",
  ARCHIVED:  "bg-text-muted/15 text-text-muted",
};

export default function AdminContentPage() {
  const [titles, setTitles] = useState<AdminTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    api.get<AdminTitle[]>("/api/admin/content")
      .then((res) => setTitles(res.data && res.data.length ? res.data : getDemoTitles()))
      .catch(() => setTitles(getDemoTitles()))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return titles.filter((t) => {
      const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "ALL" || t.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [titles, query, status]);

  const allSelected = filtered.length > 0 && filtered.every((t) => selected.has(t.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((t) => t.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    setTitles((prev) => prev.filter((t) => t.id !== id));
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setOpenMenu(null);
    try { await api.delete(`/api/admin/content/${id}`); }
    catch { toast.error("Couldn't delete title"); }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    setTitles((prev) => prev.filter((t) => !selected.has(t.id)));
    setSelected(new Set());
    try { await api.post("/api/admin/content/bulk-delete", { ids }); toast.success(`${ids.length} titles deleted`); }
    catch { toast.error("Couldn't delete selected titles"); }
  };

  return (
    <div className="px-4 md:px-8 py-8 lg:py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pl-12 lg:pl-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Content</h1>
          <p className="text-sm text-text-muted mt-1">
            {titles.length} titles in the catalog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Bulk import — connect a CSV/JSON source")}
            className="flex items-center gap-2 liquid-glass-sm px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <Upload className="h-4 w-4" />
            Bulk Import
          </button>
          <button
            onClick={() => toast.info("Open the title editor")}
            className="flex items-center gap-2 bg-gradient-purple-btn text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Title
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles…"
            className="pl-9 bg-bg-secondary border-border text-text-primary"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 liquid-glass-sm rounded-xl p-1">
          {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                status === s ? "bg-accent-purple text-white" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {s.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between liquid-glass rounded-xl px-4 py-2.5 mb-3 animate-fade-in">
          <span className="text-sm text-text-primary font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-xs text-accent-red hover:text-accent-red-light transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
            <button onClick={() => setSelected(new Set())} className="text-text-muted hover:text-text-primary">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="liquid-glass rounded-2xl overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[40px_1fr_100px_90px_90px_80px_40px] md:grid-cols-[40px_1fr_120px_100px_100px_100px_100px_40px] gap-3 px-4 py-3 border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wide">
          <div className="flex items-center">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-accent-purple cursor-pointer" />
          </div>
          <div>Title</div>
          <div className="hidden md:block">Type</div>
          <div>Rating</div>
          <div>Status</div>
          <div className="hidden md:block">Views</div>
          <div>Updated</div>
          <div></div>
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3 border-b border-border last:border-0">
              <div className="h-8 bg-bg-elevated rounded animate-pulse" />
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map((title) => (
            <div
              key={title.id}
              className={cn(
                "grid grid-cols-[40px_1fr_100px_90px_90px_80px_40px] md:grid-cols-[40px_1fr_120px_100px_100px_100px_100px_40px] gap-3 px-4 py-3 border-b border-border last:border-0 items-center hover:bg-bg-elevated/50 transition-colors",
                selected.has(title.id) && "bg-accent-purple/5"
              )}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selected.has(title.id)}
                  onChange={() => toggleOne(title.id)}
                  className="accent-accent-purple cursor-pointer"
                />
              </div>

              {/* Title + poster */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 h-10 w-7 rounded bg-bg-elevated flex items-center justify-center">
                  {title.mediaType === "SERIES"
                    ? <Tv className="h-3.5 w-3.5 text-text-muted" />
                    : <Film className="h-3.5 w-3.5 text-text-muted" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary line-clamp-1">{title.title}</p>
                  <p className="text-[11px] text-text-muted">★ {title.voteAverage.toFixed(1)}</p>
                </div>
              </div>

              <div className="hidden md:block">
                <span className="text-xs text-text-secondary capitalize">{title.mediaType.toLowerCase()}</span>
              </div>

              <div>
                <Badge className={cn("text-[10px] font-bold px-1.5 py-0", getMaturityColor(title.maturityRating))}>
                  {title.maturityRating}
                </Badge>
              </div>

              <div>
                <span className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded-full", STATUS_STYLES[title.status])}>
                  {title.status}
                </span>
              </div>

              <div className="hidden md:block">
                <span className="text-xs text-text-secondary">{formatNumber(title.views)}</span>
              </div>

              <div>
                <span className="text-xs text-text-muted">{formatDate(title.updatedAt)}</span>
              </div>

              {/* Row menu */}
              <div className="relative flex justify-end">
                <button
                  onClick={() => setOpenMenu(openMenu === title.id ? null : title.id)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {openMenu === title.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                    <div className="absolute right-0 top-6 z-20 liquid-glass rounded-xl py-1 w-32 animate-scale-in">
                      <button
                        onClick={() => { toast.info("Edit title"); setOpenMenu(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-white/8 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(title.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-accent-red hover:bg-white/8 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center">
            <p className="text-text-secondary text-sm">No titles match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}