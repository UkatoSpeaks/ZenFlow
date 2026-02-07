"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

// Storage keys
export const STORAGE_KEYS = {
  SETTINGS: "zenflow_settings",
  USER: "zenflow_user",
  BLOCKED_SITES: "zenflow_blocked_sites",
  BLOCKER_ENABLED: "zenflow_blocker_enabled",
  BLOCK_MODE: "zenflow_block_mode",
  BLOCKED_ATTEMPTS: "zenflow_blocked_attempts",
  TOTAL_BLOCKED: "zenflow_total_blocked",
  LAST_RESET_DATE: "zenflow_last_reset_date",
  SESSION_COUNT: "zenflow_session_count",
  TOTAL_FOCUS_TIME: "zenflow_total_focus_time",
};

// Settings type
export interface ZenFlowSettings {
  // Focus Preferences
  defaultDuration: number;
  autoStartBreak: boolean;
  autoStartNextSession: boolean;
  enterFullscreen: boolean;
  darkFocusMode: boolean;
  showMotivationalQuotes: boolean;
  
  // Break & Wellness
  breakDuration: number;
  stretchReminder: boolean;
  hydrationReminder: boolean;
  eyeRestReminder: boolean;
  breathingAnimation: boolean;
  
  // Notifications & Sounds
  timerEndSound: boolean;
  breakSound: boolean;
  defaultAmbientSound: string;
  desktopNotifications: boolean;
  soundVolume: number;
}

// User type
export interface ZenFlowUser {
  name: string;
  email: string;
  avatar: string | null;
}

// Stats type
export interface ZenFlowStats {
  blockedAttempts: number;
  totalBlocked: number;
  sessionCount: number;
  totalFocusTime: number; // in minutes
}

// Default settings
export const DEFAULT_SETTINGS: ZenFlowSettings = {
  // Focus Preferences
  defaultDuration: 25,
  autoStartBreak: true,
  autoStartNextSession: false,
  enterFullscreen: false,
  darkFocusMode: true,
  showMotivationalQuotes: true,
  
  // Break & Wellness
  breakDuration: 5,
  stretchReminder: true,
  hydrationReminder: true,
  eyeRestReminder: true,
  breathingAnimation: true,
  
  // Notifications & Sounds
  timerEndSound: true,
  breakSound: true,
  defaultAmbientSound: "off",
  desktopNotifications: true,
  soundVolume: 0.7,
};

// Default user
export const DEFAULT_USER: ZenFlowUser = {
  name: "Focus Master",
  email: "user@zenflow.app",
  avatar: null,
};

// Default stats
export const DEFAULT_STATS: ZenFlowStats = {
  blockedAttempts: 0,
  totalBlocked: 0,
  sessionCount: 0,
  totalFocusTime: 0,
};

// Context type
interface SettingsContextType {
  settings: ZenFlowSettings;
  user: ZenFlowUser;
  stats: ZenFlowStats;
  isLoading: boolean;
  updateSetting: <K extends keyof ZenFlowSettings>(key: K, value: ZenFlowSettings[K]) => void;
  updateUser: (updates: Partial<ZenFlowUser>) => void;
  updateStats: (updates: Partial<ZenFlowStats>) => void;
  incrementStat: (key: keyof ZenFlowStats, amount?: number) => void;
  resetDailyStats: () => void;
  exportData: () => void;
  clearHistory: () => void;
  deleteAllData: () => void;
  requestNotificationPermission: () => Promise<boolean>;
  sendNotification: (title: string, body: string) => void;
  playSound: (type: "timer" | "break" | "notification") => void;
}

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ZenFlowSettings>(DEFAULT_SETTINGS);
  const [user, setUser] = useState<ZenFlowUser>(DEFAULT_USER);
  const [stats, setStats] = useState<ZenFlowStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Load all data on mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Load settings
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (savedSettings) {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
        }
        
        // Load user
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser) {
          setUser({ ...DEFAULT_USER, ...JSON.parse(savedUser) });
        }

        // Load stats
        const today = new Date().toDateString();
        const lastResetDate = localStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE);
        
        // Reset daily stats if new day
        if (lastResetDate !== today) {
          localStorage.setItem(STORAGE_KEYS.BLOCKED_ATTEMPTS, "0");
          localStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, today);
        }

        const blockedAttempts = parseInt(localStorage.getItem(STORAGE_KEYS.BLOCKED_ATTEMPTS) || "0", 10);
        const totalBlocked = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_BLOCKED) || "0", 10);
        const sessionCount = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_COUNT) || "0", 10);
        const totalFocusTime = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_FOCUS_TIME) || "0", 10);

        setStats({
          blockedAttempts,
          totalBlocked,
          sessionCount,
          totalFocusTime,
        });

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save settings when changed
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  // Save user when changed
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }, [user, isLoading]);

  // Save stats when changed
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.BLOCKED_ATTEMPTS, stats.blockedAttempts.toString());
      localStorage.setItem(STORAGE_KEYS.TOTAL_BLOCKED, stats.totalBlocked.toString());
      localStorage.setItem(STORAGE_KEYS.SESSION_COUNT, stats.sessionCount.toString());
      localStorage.setItem(STORAGE_KEYS.TOTAL_FOCUS_TIME, stats.totalFocusTime.toString());
    }
  }, [stats, isLoading]);

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof ZenFlowSettings>(
    key: K,
    value: ZenFlowSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update user
  const updateUser = useCallback((updates: Partial<ZenFlowUser>) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  // Update stats
  const updateStats = useCallback((updates: Partial<ZenFlowStats>) => {
    setStats(prev => ({ ...prev, ...updates }));
  }, []);

  // Increment a stat
  const incrementStat = useCallback((key: keyof ZenFlowStats, amount = 1) => {
    setStats(prev => ({ ...prev, [key]: prev[key] + amount }));
  }, []);

  // Reset daily stats
  const resetDailyStats = useCallback(() => {
    setStats(prev => ({ ...prev, blockedAttempts: 0 }));
    localStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, new Date().toDateString());
  }, []);

  // Export all data
  const exportData = useCallback(() => {
    const data = {
      settings,
      user: { name: user.name },
      stats,
      blockedSites: JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOCKED_SITES) || "[]"),
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zenflow-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [settings, user, stats]);

  // Clear history (stats only)
  const clearHistory = useCallback(() => {
    setStats({
      blockedAttempts: 0,
      totalBlocked: 0,
      sessionCount: 0,
      totalFocusTime: 0,
    });
  }, []);

  // Delete all data
  const deleteAllData = useCallback(() => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("zenflow_")) {
        localStorage.removeItem(key);
      }
    });
    setSettings(DEFAULT_SETTINGS);
    setUser(DEFAULT_USER);
    setStats(DEFAULT_STATS);
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }, []);

  // Send notification
  const sendNotification = useCallback((title: string, body: string) => {
    if (!settings.desktopNotifications) return;
    
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "zenflow",
        silent: false,
      });
    }
  }, [settings.desktopNotifications]);

  // Play sound
  const playSound = useCallback((type: "timer" | "break" | "notification") => {
    if (type === "timer" && !settings.timerEndSound) return;
    if (type === "break" && !settings.breakSound) return;

    try {
      // Create audio context if needed
      let ctx = audioContext;
      if (!ctx) {
        ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        setAudioContext(ctx);
      }

      // Create oscillator for simple beep
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Different sounds for different types
      switch (type) {
        case "timer":
          oscillator.frequency.value = 800;
          oscillator.type = "sine";
          break;
        case "break":
          oscillator.frequency.value = 600;
          oscillator.type = "triangle";
          break;
        case "notification":
          oscillator.frequency.value = 1000;
          oscillator.type = "sine";
          break;
      }

      gainNode.gain.value = settings.soundVolume * 0.3;
      
      oscillator.start();
      
      // Fade out
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gainNode.disconnect();
      }, 600);

    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, [settings.timerEndSound, settings.breakSound, settings.soundVolume, audioContext]);

  const value: SettingsContextType = {
    settings,
    user,
    stats,
    isLoading,
    updateSetting,
    updateUser,
    updateStats,
    incrementStat,
    resetDailyStats,
    exportData,
    clearHistory,
    deleteAllData,
    requestNotificationPermission,
    sendNotification,
    playSound,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook to use settings
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

// Hook for just reading settings (no methods)
export function useSettingsValue() {
  const { settings, user, stats, isLoading } = useSettings();
  return { settings, user, stats, isLoading };
}
