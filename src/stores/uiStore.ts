import { create } from "zustand";

interface UIStore {
  searchOpen: boolean;
  profileSwitcherOpen: boolean;
  mobileMenuOpen: boolean;

  setSearchOpen: (v: boolean) => void;
  toggleSearch: () => void;
  setProfileSwitcherOpen: (v: boolean) => void;
  setMobileMenuOpen: (v: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  searchOpen: false,
  profileSwitcherOpen: false,
  mobileMenuOpen: false,

  setSearchOpen: (searchOpen) => set({ searchOpen }),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  setProfileSwitcherOpen: (profileSwitcherOpen) => set({ profileSwitcherOpen }),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
}));