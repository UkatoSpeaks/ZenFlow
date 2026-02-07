"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { TimerProvider } from "@/contexts/TimerContext";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary, NetworkStatus, useNetworkStatus } from "@/components/ErrorState";
import BreakScreen from "@/components/BreakScreen";
import { ReactNode } from "react";

function NetworkStatusWrapper({ children }: { children: ReactNode }) {
  const isOnline = useNetworkStatus();
  return (
    <>
      <NetworkStatus isOnline={isOnline} />
      {children}
    </>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <AuthProvider>
          <SettingsProvider>
            <TimerProvider>
              <NetworkStatusWrapper>
                {children}
                <BreakScreen 
                  breakDuration={5}
                  showStretchReminder={true}
                  showHydrationReminder={true}
                  showEyeRestReminder={true}
                  autoStartBreak={false}
                />
              </NetworkStatusWrapper>
            </TimerProvider>
          </SettingsProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ToastProvider>
  );
}
