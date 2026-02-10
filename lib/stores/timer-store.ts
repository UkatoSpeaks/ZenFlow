import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimerState, SessionTagId } from "@/types";
import { DEFAULT_TIMER_DURATION } from "@/lib/constants";

interface TimerStore extends TimerState {
  // Actions
  setDuration: (minutes: number) => void;
  setTag: (tag: SessionTagId) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  tick: () => void;
  startBreak: (minutes: number) => void;
  finishSession: () => void;
  clear: () => void;
  
  // Computed
  remaining: () => number;
  progress: () => number;
}

const initialState = {
  status: "idle" as const,
  duration: DEFAULT_TIMER_DURATION * 60,
  elapsed: 0,
  tag: "coding" as SessionTagId,
};

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Actions
      setDuration: (minutes) =>
        set({
          duration: minutes * 60,
          elapsed: 0,
          status: "idle",
        }),

      setTag: (tag) => set({ tag }),

      start: () =>
        set({
          status: "running",
          elapsed: 0,
        }),

      pause: () => set({ status: "paused" }),

      resume: () => set({ status: "running" }),

      reset: () =>
        set({
          status: "idle",
          elapsed: 0,
        }),

      tick: () => {
        const { status, elapsed, duration } = get();
        if (status === "running" || status === "break") {
          if (elapsed < duration) {
            set({ elapsed: elapsed + 1 });
          } else {
            // Timer complete
            set({ status: "idle", elapsed: 0 });
          }
        }
      },

      startBreak: (minutes) =>
        set({
          status: "break",
          duration: minutes * 60,
          elapsed: 0,
        }),

      finishSession: () =>
        set({
          status: "idle",
          elapsed: 0,
        }),
      
      clear: () => set(initialState),

      // Computed values
      remaining: () => {
        const { duration, elapsed } = get();
        return Math.max(0, duration - elapsed);
      },

      progress: () => {
        const { duration, elapsed } = get();
        if (duration === 0) return 0;
        return Math.min(100, (elapsed / duration) * 100);
      },
    }),
    {
      name: "zenflow-timer",
      partialize: (state) => ({
        duration: state.duration,
        tag: state.tag,
      }),
    }
  )
);
