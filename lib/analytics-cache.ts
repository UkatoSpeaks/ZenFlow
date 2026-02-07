// Analytics Caching Layer
// Pre-calculates and caches analytics to avoid expensive client-side computation

import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';

// Cache expiry times (in milliseconds)
const CACHE_EXPIRY = {
  TODAY: 5 * 60 * 1000,      // 5 minutes
  WEEK: 15 * 60 * 1000,      // 15 minutes
  MONTH: 60 * 60 * 1000,     // 1 hour
  ALL_TIME: 6 * 60 * 60 * 1000, // 6 hours
};

// Local storage cache keys
const CACHE_KEYS = {
  DAILY_STATS: 'zenflow_analytics_daily',
  WEEKLY_STATS: 'zenflow_analytics_weekly',
  MONTHLY_STATS: 'zenflow_analytics_monthly',
  ALL_TIME_STATS: 'zenflow_analytics_all',
  LAST_UPDATED: 'zenflow_analytics_updated',
};

export interface CachedAnalytics {
  summary: {
    totalMinutes: number;
    totalSessions: number;
    avgMinutesPerDay: number;
    avgMinutesPerSession: number;
    currentStreak: number;
    longestStreak: number;
    bestDay: { date: string; minutes: number } | null;
    mostProductiveHour: number | null;
  };
  weeklyData: { day: string; date: string; minutes: number }[];
  tagDistribution: Record<string, number>;
  heatmapData: { date: string; minutes: number; level: number }[];
  recentSessions: {
    id: string;
    date: string;
    duration: number;
    tag: string;
    taskName?: string;
  }[];
  cachedAt: number;
}

// Get cached analytics from localStorage
function getLocalCache(key: string): CachedAnalytics | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const data = JSON.parse(cached) as CachedAnalytics;
    return data;
  } catch {
    return null;
  }
}

// Save analytics to localStorage
function setLocalCache(key: string, data: CachedAnalytics): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching analytics:', error);
  }
}

// Check if cache is still valid
function isCacheValid(cachedAt: number, expiryMs: number): boolean {
  return Date.now() - cachedAt < expiryMs;
}

// Calculate heat level for heatmap (0-4)
function getHeatLevel(minutes: number): number {
  if (minutes === 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}

// Get analytics for a period with caching
export async function getCachedAnalytics(
  userId: string,
  period: 'today' | 'week' | 'month' | 'all' = 'week',
  forceRefresh = false
): Promise<CachedAnalytics> {
  const cacheKey = {
    today: CACHE_KEYS.DAILY_STATS,
    week: CACHE_KEYS.WEEKLY_STATS,
    month: CACHE_KEYS.MONTHLY_STATS,
    all: CACHE_KEYS.ALL_TIME_STATS,
  }[period];
  
  const cacheExpiry = {
    today: CACHE_EXPIRY.TODAY,
    week: CACHE_EXPIRY.WEEK,
    month: CACHE_EXPIRY.MONTH,
    all: CACHE_EXPIRY.ALL_TIME,
  }[period];
  
  // Check local cache first
  if (!forceRefresh) {
    const cached = getLocalCache(cacheKey);
    if (cached && isCacheValid(cached.cachedAt, cacheExpiry)) {
      return cached;
    }
  }
  
  // Calculate fresh analytics
  const analytics = await calculateAnalytics(userId, period);
  
  // Cache the results
  setLocalCache(cacheKey, analytics);
  
  return analytics;
}

// Calculate analytics from Firestore
async function calculateAnalytics(
  userId: string,
  period: 'today' | 'week' | 'month' | 'all'
): Promise<CachedAnalytics> {
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'all':
    default:
      startDate = new Date(0);
  }
  
  const startDateStr = startDate.toISOString().split('T')[0];
  
  // Fetch daily stats
  const dailyStatsRef = collection(db, 'dailyStats');
  const statsQuery = query(
    dailyStatsRef,
    where('userId', '==', userId),
    where('date', '>=', startDateStr),
    orderBy('date', 'desc'),
    limit(365)
  );
  
  const statsSnapshot = await getDocs(statsQuery);
  const dailyStats = statsSnapshot.docs.map(doc => doc.data());
  
  // Fetch recent sessions
  const sessionsRef = collection(db, 'sessions');
  const sessionsQuery = query(
    sessionsRef,
    where('userId', '==', userId),
    where('timestamp', '>=', startDate.getTime()),
    orderBy('timestamp', 'desc'),
    limit(50)
  );
  
  const sessionsSnapshot = await getDocs(sessionsQuery);
  
  interface SessionData {
    id: string;
    completedAt?: string;
    duration?: number;
    tag?: string;
    taskName?: string;
    [key: string]: unknown;
  }
  
  const sessions: SessionData[] = sessionsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  
  // Get user data for streak
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.exists() ? userDoc.data() : {};
  
  // Calculate summary stats
  const totalMinutes = dailyStats.reduce((sum, day) => sum + (day.totalMinutes || 0), 0);
  const totalSessions = dailyStats.reduce((sum, day) => sum + (day.sessionsCount || 0), 0);
  const daysWithActivity = dailyStats.filter(d => d.totalMinutes > 0).length;
  
  const avgMinutesPerDay = daysWithActivity > 0 
    ? Math.round(totalMinutes / daysWithActivity) 
    : 0;
  const avgMinutesPerSession = totalSessions > 0 
    ? Math.round(totalMinutes / totalSessions) 
    : 0;
  
  // Find best day
  let bestDay: { date: string; minutes: number } | null = null;
  dailyStats.forEach(day => {
    if (!bestDay || day.totalMinutes > bestDay.minutes) {
      bestDay = { date: day.date, minutes: day.totalMinutes };
    }
  });
  
  // Calculate tag distribution
  const tagDistribution: Record<string, number> = {};
  dailyStats.forEach(day => {
    if (day.tags) {
      Object.entries(day.tags).forEach(([tag, minutes]) => {
        tagDistribution[tag] = (tagDistribution[tag] || 0) + (minutes as number);
      });
    }
  });
  
  // Build weekly data (last 7 days)
  const weeklyData: { day: string; date: string; minutes: number }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayData = dailyStats.find(d => d.date === dateStr);
    
    weeklyData.push({
      day: dayNames[date.getDay()],
      date: dateStr,
      minutes: dayData?.totalMinutes || 0,
    });
  }
  
  // Build heatmap data (last 16 weeks = 112 days)
  const heatmapData: { date: string; minutes: number; level: number }[] = [];
  for (let i = 111; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayData = dailyStats.find(d => d.date === dateStr);
    const minutes = dayData?.totalMinutes || 0;
    
    heatmapData.push({
      date: dateStr,
      minutes,
      level: getHeatLevel(minutes),
    });
  }
  
  // Format recent sessions
  const recentSessions = sessions.slice(0, 10).map(s => ({
    id: s.id as string,
    date: s.completedAt as string,
    duration: s.duration as number,
    tag: s.tag as string,
    taskName: s.taskName as string | undefined,
  }));
  
  return {
    summary: {
      totalMinutes,
      totalSessions,
      avgMinutesPerDay,
      avgMinutesPerSession,
      currentStreak: userData.currentStreak || 0,
      longestStreak: userData.longestStreak || 0,
      bestDay,
      mostProductiveHour: null, // Could be calculated from session timestamps
    },
    weeklyData,
    tagDistribution,
    heatmapData,
    recentSessions,
    cachedAt: Date.now(),
  };
}

// Invalidate cache (called when new session is added)
export function invalidateAnalyticsCache(): void {
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

// Get quick stats (uses cache if available, doesn't recalculate)
export function getQuickStats(): {
  todayMinutes: number;
  weekMinutes: number;
  currentStreak: number;
} | null {
  try {
    const dailyCache = getLocalCache(CACHE_KEYS.DAILY_STATS);
    const weeklyCache = getLocalCache(CACHE_KEYS.WEEKLY_STATS);
    
    if (weeklyCache) {
      const today = new Date().toISOString().split('T')[0];
      const todayData = weeklyCache.weeklyData.find(d => d.date === today);
      
      return {
        todayMinutes: todayData?.minutes || 0,
        weekMinutes: weeklyCache.summary.totalMinutes,
        currentStreak: weeklyCache.summary.currentStreak,
      };
    }
    
    if (dailyCache) {
      return {
        todayMinutes: dailyCache.summary.totalMinutes,
        weekMinutes: 0,
        currentStreak: dailyCache.summary.currentStreak,
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

// Pre-fetch analytics in background
export async function prefetchAnalytics(userId: string): Promise<void> {
  // Fetch week stats first (most commonly used)
  await getCachedAnalytics(userId, 'week');
  
  // Then fetch others in background
  setTimeout(() => {
    getCachedAnalytics(userId, 'today').catch(() => {});
    getCachedAnalytics(userId, 'month').catch(() => {});
  }, 1000);
}
