"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { TimerProvider } from "@/contexts/TimerContext";
import BreakScreen from "@/components/BreakScreen";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <TimerProvider>
          {children}
          <BreakScreen 
            breakDuration={5}
            showStretchReminder={true}
            showHydrationReminder={true}
            showEyeRestReminder={true}
            autoStartBreak={false}
          />
        </TimerProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
