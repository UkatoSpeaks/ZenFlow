"use client";

import { SettingsProvider } from "@/contexts/SettingsContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      {children}
    </SettingsProvider>
  );
}
