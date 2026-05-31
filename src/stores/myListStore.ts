import { create } from "zustand";
import api from "@/lib/api";
import { toast } from "sonner";

interface MyListStore {
  ids: string[];
  loaded: boolean;

  load: () => Promise<void>;
  isInList: (titleId: string) => boolean;
  toggle: (titleId: string) => Promise<void>;
}

export const useMyListStore = create<MyListStore>((set, get) => ({
  ids: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    try {
      const res = await api.get<string[]>("/api/my-list/ids");
      set({ ids: res.data ?? [], loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  isInList: (titleId) => get().ids.includes(titleId),

  toggle: async (titleId) => {
    const inList = get().isInList(titleId);
    // Optimistic update
    set((s) => ({
      ids: inList ? s.ids.filter((id) => id !== titleId) : [...s.ids, titleId],
    }));
    try {
      if (inList) {
        await api.delete(`/api/my-list/${titleId}`);
      } else {
        await api.post("/api/my-list", { titleId });
        toast.success("Added to My List");
      }
    } catch {
      // Revert
      set((s) => ({
        ids: inList ? [...s.ids, titleId] : s.ids.filter((id) => id !== titleId),
      }));
      toast.error("Couldn't update your list");
    }
  },
}));