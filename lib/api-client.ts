// API Client for frontend use
// Provides typed methods for all backend API endpoints

import { auth } from './firebase';

const API_BASE = '/api';

// Get auth token from current user
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Make authenticated API request
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  const token = await getAuthToken();
  
  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request error:', error);
    return { success: false, error: 'Network error' };
  }
}

// ==================== Session APIs ====================

export interface FocusSession {
  id?: string;
  userId?: string;
  duration: number;
  tag: string;
  taskName?: string;
  completedAt?: string;
  timestamp?: number;
  isCompleted?: boolean;
}

export const sessionsApi = {
  // Get all sessions
  getAll: async (params?: { limit?: number; startDate?: string; endDate?: string; tag?: string }) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString() : '';
    return apiRequest<{ sessions: FocusSession[]; count: number }>(`/sessions${queryString}`);
  },

  // Get single session
  get: async (id: string) => {
    return apiRequest<FocusSession>(`/sessions/${id}`);
  },

  // Create session
  create: async (session: Omit<FocusSession, 'id' | 'userId' | 'completedAt' | 'timestamp'>) => {
    return apiRequest<FocusSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  },

  // Update session
  update: async (id: string, updates: Partial<Pick<FocusSession, 'tag' | 'taskName' | 'isCompleted'>>) => {
    return apiRequest<FocusSession>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete session
  delete: async (id: string) => {
    return apiRequest<{ id: string }>(`/sessions/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== Analytics APIs ====================

export interface AnalyticsSummary {
  totalMinutes: number;
  totalSessions: number;
  daysWithFocus: number;
  avgMinutesPerDay: number;
  avgMinutesPerSession: number;
  currentStreak: number;
  longestSession: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  tagDistribution: Record<string, number>;
  weeklyData: { day: string; minutes: number; date: string }[];
  heatmapData: { date: string; minutes: number }[];
  recentSessions: FocusSession[];
  period: string;
  dateRange: { start: string; end: string };
}

export const analyticsApi = {
  // Get analytics data
  get: async (params?: { period?: 'today' | 'week' | 'month' | 'year' | 'all'; startDate?: string; endDate?: string }) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString() : '';
    return apiRequest<AnalyticsData>(`/analytics${queryString}`);
  },
};

// ==================== Settings APIs ====================

export interface UserSettings {
  userId?: string;
  defaultDuration: number;
  autoStartBreak: boolean;
  autoStartNextSession: boolean;
  enterFullscreen: boolean;
  darkFocusMode: boolean;
  showMotivationalQuotes: boolean;
  breakDuration: number;
  stretchReminder: boolean;
  hydrationReminder: boolean;
  eyeRestReminder: boolean;
  breathingAnimation: boolean;
  desktopNotifications: boolean;
  timerEndSound: boolean;
  breakSound: boolean;
  defaultAmbientSound: string;
  soundVolume: number;
  displayName?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const settingsApi = {
  // Get settings
  get: async () => {
    return apiRequest<UserSettings>('/settings');
  },

  // Update settings
  update: async (settings: Partial<UserSettings>) => {
    return apiRequest<UserSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Reset to defaults
  reset: async () => {
    return apiRequest<UserSettings>('/settings', {
      method: 'DELETE',
    });
  },
};

// ==================== Blocker APIs ====================

export interface BlockedSite {
  domain: string;
  enabled: boolean;
  addedAt: number;
}

export interface BlockerSettings {
  userId?: string;
  masterToggle: boolean;
  blockMode: 'focus' | 'always' | 'warning';
  blockedSites: BlockedSite[];
  totalBlockedAttempts: number;
  updatedAt?: string;
}

export const blockerApi = {
  // Get blocker settings
  get: async () => {
    return apiRequest<BlockerSettings>('/blocker');
  },

  // Update blocker settings
  update: async (settings: Partial<Pick<BlockerSettings, 'masterToggle' | 'blockMode' | 'blockedSites'>> & { incrementBlockedAttempts?: boolean }) => {
    return apiRequest<BlockerSettings>('/blocker', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Add single site
  addSite: async (domain: string) => {
    return apiRequest<{ site: BlockedSite; totalSites: number }>(`/blocker/sites/${encodeURIComponent(domain)}`, {
      method: 'POST',
    });
  },

  // Toggle site
  toggleSite: async (domain: string, enabled: boolean) => {
    return apiRequest<{ site: BlockedSite }>(`/blocker/sites/${encodeURIComponent(domain)}`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    });
  },

  // Remove site
  removeSite: async (domain: string) => {
    return apiRequest<{ domain: string; totalSites: number }>(`/blocker/sites/${encodeURIComponent(domain)}`, {
      method: 'DELETE',
    });
  },

  // Add preset or bulk sites
  addBulk: async (data: { preset?: string } | { sites: string[] }) => {
    return apiRequest<{ added: number; sites?: string[]; total: number }>('/blocker/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Clear all sites
  clearAll: async () => {
    return apiRequest<{ cleared: number }>('/blocker/bulk', {
      method: 'DELETE',
    });
  },
};

// ==================== User APIs ====================

export interface UserProfile {
  userId?: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt?: string;
  lastLoginAt?: string;
  totalSessions: number;
  totalFocusMinutes: number;
  currentStreak: number;
  longestStreak: number;
  totalBlockedAttempts: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  streakStartDate: string | null;
  daysThisWeek?: number;
  daysThisMonth?: number;
}

export const userApi = {
  // Get user profile
  get: async () => {
    return apiRequest<UserProfile>('/user');
  },

  // Update user profile
  update: async (updates: Partial<Pick<UserProfile, 'displayName' | 'photoURL'>>) => {
    return apiRequest<UserProfile>('/user', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete account
  delete: async () => {
    return apiRequest<{ userId: string }>('/user', {
      method: 'DELETE',
    });
  },

  // Get streak data
  getStreak: async () => {
    return apiRequest<StreakData>('/user/streak');
  },

  // Record activity
  recordActivity: async () => {
    return apiRequest<{ date: string }>('/user/streak', {
      method: 'POST',
    });
  },

  // Export all data
  exportData: async () => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE}/user/export`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export data');
    }

    // Trigger download
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenflow-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true };
  },
};

// Export all APIs
export const api = {
  sessions: sessionsApi,
  analytics: analyticsApi,
  settings: settingsApi,
  blocker: blockerApi,
  user: userApi,
};

export default api;
