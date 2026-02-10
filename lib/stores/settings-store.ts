import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserSettings } from "@/types";

interface SettingsStore extends UserSettings {
  // Actions
  setTheme: (theme: UserSettings["theme"]) => void;
  toggleSound: () => void;
  toggleAutoBreak: () => void;
  setBreakDuration: (minutes: number) => void;
  toggleNotifications: () => void;
  resetSettings: () => void;
  clear: () => void;
}

const defaultSettings: UserSettings = {
  theme: "system",
  soundEnabled: true,
  autoBreak: true,
  breakDuration: 5,
  notifications: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setTheme: (theme) => set({ theme }),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      toggleAutoBreak: () => set((state) => ({ autoBreak: !state.autoBreak })),

      setBreakDuration: (minutes) => set({ breakDuration: minutes }),

      toggleNotifications: () =>
        set((state) => ({ notifications: !state.notifications })),

      resetSettings: () => set(defaultSettings),
      clear: () => set(defaultSettings),
    }),
    {
      name: "zenflow-settings",
    }
  )
);
