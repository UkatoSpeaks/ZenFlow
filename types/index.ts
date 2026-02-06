/**
 * ZenFlow TypeScript Type Definitions
 */

import { SESSION_TAGS } from "@/lib/constants";

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: Date;
  dailyGoal: number; // in minutes
  weeklyGoal: number; // in minutes
  settings: UserSettings;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  soundEnabled: boolean;
  autoBreak: boolean;
  breakDuration: number; // in minutes
  notifications: boolean;
}

// Session types
export type SessionTagId = (typeof SESSION_TAGS)[number]["id"];

export interface FocusSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  tag: SessionTagId;
  completed: boolean;
  createdAt: Date;
}

export interface SessionStats {
  totalMinutes: number;
  totalSessions: number;
  averageSession: number;
  longestSession: number;
  tagBreakdown: Record<SessionTagId, number>;
}

// Timer types
export type TimerStatus = "idle" | "running" | "paused" | "break";

export interface TimerState {
  status: TimerStatus;
  duration: number; // target duration in seconds
  elapsed: number; // elapsed time in seconds
  tag: SessionTagId;
}

// Streak types
export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
}

// Blocked sites types
export interface BlockedSites {
  userId: string;
  domains: string[];
  isActive: boolean;
}

// Goals types
export interface Goals {
  userId: string;
  dailyTargetMinutes: number;
  weeklyTargetMinutes: number;
}

// Chart data types
export interface DailyData {
  date: string;
  minutes: number;
  sessions: number;
}

export interface WeeklyData {
  day: string;
  minutes: number;
}

export interface TagData {
  tag: SessionTagId;
  label: string;
  minutes: number;
  percentage: number;
  color: string;
}

// Break reminder types
export type BreakType = "stretch" | "hydrate" | "eyes" | "breathe";

export interface BreakReminder {
  id: BreakType;
  label: string;
  description: string;
  icon: string;
}

// Navigation types
export interface NavLink {
  href: string;
  label: string;
  icon?: string;
}

// Component prop types
export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}
