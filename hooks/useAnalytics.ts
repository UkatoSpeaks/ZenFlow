"use client";

// useAnalytics Hook
// Provides cached analytics data with automatic refresh

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getCachedAnalytics, 
  CachedAnalytics, 
  prefetchAnalytics,
  invalidateAnalyticsCache,
  getQuickStats,
} from '@/lib/analytics-cache';

type Period = 'today' | 'week' | 'month' | 'all';

interface UseAnalyticsOptions {
  period?: Period;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseAnalyticsReturn {
  data: CachedAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refresh: (force?: boolean) => Promise<void>;
  setPeriod: (period: Period) => void;
  quickStats: {
    todayMinutes: number;
    weekMinutes: number;
    currentStreak: number;
  } | null;
}

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const { 
    period: initialPeriod = 'week', 
    autoRefresh = false, 
    refreshInterval = 60000 
  } = options;
  
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [data, setData] = useState<CachedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickStats, setQuickStats] = useState<{
    todayMinutes: number;
    weekMinutes: number;
    currentStreak: number;
  } | null>(null);

  // Fetch analytics data
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const analytics = await getCachedAnalytics(user.uid, period, forceRefresh);
      setData(analytics);
      
      // Update quick stats
      const stats = getQuickStats();
      setQuickStats(stats);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [user, period]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Prefetch other periods when user logs in
  useEffect(() => {
    if (user) {
      prefetchAnalytics(user.uid).catch(console.error);
    }
  }, [user]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !user) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData, user]);

  // Refresh function
  const refresh = useCallback(async (force = true) => {
    if (force) {
      invalidateAnalyticsCache();
    }
    await fetchData(force);
  }, [fetchData]);

  // Handle period change
  const handleSetPeriod = useCallback((newPeriod: Period) => {
    setPeriod(newPeriod);
  }, []);

  return {
    data,
    isLoading,
    error,
    refresh,
    setPeriod: handleSetPeriod,
    quickStats,
  };
}

export default useAnalytics;
