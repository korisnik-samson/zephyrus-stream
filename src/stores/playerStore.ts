import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerPreferences {
  volume: number;
  isMuted: boolean;
  playbackRate: number;

  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  setPlaybackRate: (r: number) => void;
}

/** Persists volume/mute/speed preferences across sessions */
export const usePlayerStore = create<PlayerPreferences>()(
  persist(
    (set) => ({
      volume: 1,
      isMuted: false,
      playbackRate: 1,

      setVolume: (volume) => set({ volume }),
      setMuted: (isMuted) => set({ isMuted }),
      setPlaybackRate: (playbackRate) => set({ playbackRate }),
    }),
    { name: "zephyrus-player-prefs" }
  )
);