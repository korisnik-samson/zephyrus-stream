    import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/types/auth";

interface AuthStore {
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile | null) => void;
  clearProfile: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      activeProfile: null,
      setActiveProfile: (activeProfile) => set({ activeProfile }),
      clearProfile: () => set({ activeProfile: null }),
    }),
    { name: "zephyrus-active-profile" }
  )
);