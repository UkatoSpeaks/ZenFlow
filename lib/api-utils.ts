// API Response types and utilities
import { NextResponse } from 'next/server';

// Standard API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Success response helper
export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

// Error response helper
export function errorResponse(error: string, status: number = 400): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

// Auth error response
export function authError(): NextResponse<ApiResponse> {
  return errorResponse('Unauthorized. Please log in.', 401);
}

// Not found response
export function notFoundError(resource: string = 'Resource'): NextResponse<ApiResponse> {
  return errorResponse(`${resource} not found.`, 404);
}

// Validation error response
export function validationError(message: string): NextResponse<ApiResponse> {
  return errorResponse(`Validation error: ${message}`, 400);
}

// Server error response
export function serverError(message: string = 'Internal server error'): NextResponse<ApiResponse> {
  return errorResponse(message, 500);
}

// Extract user ID from authorization header (Firebase ID token)
export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];
  
  if (!token) {
    return null;
  }

  try {
    // Import dynamically to avoid issues on client
    const { adminAuthService } = await import('@/lib/firebase-admin');
    const decodedToken = await adminAuthService.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Type definitions for database models
export interface FocusSession {
  id?: string;
  userId: string;
  duration: number; // in minutes
  tag: string;
  taskName?: string;
  completedAt: string; // ISO date string
  timestamp: number;
  isCompleted: boolean;
}

export interface DailyFocusStats {
  userId: string;
  date: string; // YYYY-MM-DD format
  totalMinutes: number;
  sessionsCount: number;
  tags: Record<string, number>; // tag -> minutes
  streak: number;
}

export interface UserSettings {
  userId: string;
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
  desktopNotifications: boolean;
  timerEndSound: boolean;
  breakSound: boolean;
  defaultAmbientSound: string;
  soundVolume: number;
  // Profile
  displayName?: string;
  photoURL?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface BlockedSite {
  domain: string;
  enabled: boolean;
  addedAt: number;
}

export interface BlockerSettings {
  userId: string;
  masterToggle: boolean;
  blockMode: 'focus' | 'always' | 'warning';
  blockedSites: BlockedSite[];
  totalBlockedAttempts: number;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
  // Stats
  totalSessions: number;
  totalFocusMinutes: number;
  currentStreak: number;
  longestStreak: number;
  totalBlockedAttempts: number;
}

// Default settings
export const DEFAULT_SETTINGS: Omit<UserSettings, 'userId' | 'createdAt' | 'updatedAt'> = {
  defaultDuration: 25,
  autoStartBreak: false,
  autoStartNextSession: false,
  enterFullscreen: false,
  darkFocusMode: false,
  showMotivationalQuotes: true,
  breakDuration: 5,
  stretchReminder: true,
  hydrationReminder: true,
  eyeRestReminder: true,
  breathingAnimation: true,
  desktopNotifications: true,
  timerEndSound: true,
  breakSound: true,
  defaultAmbientSound: 'off',
  soundVolume: 0.7,
};

export const DEFAULT_BLOCKER_SETTINGS: Omit<BlockerSettings, 'userId' | 'updatedAt'> = {
  masterToggle: true,
  blockMode: 'focus',
  blockedSites: [
    { domain: 'youtube.com', enabled: true, addedAt: Date.now() },
    { domain: 'twitter.com', enabled: true, addedAt: Date.now() },
    { domain: 'instagram.com', enabled: true, addedAt: Date.now() },
    { domain: 'reddit.com', enabled: true, addedAt: Date.now() },
    { domain: 'facebook.com', enabled: true, addedAt: Date.now() },
  ],
  totalBlockedAttempts: 0,
};
