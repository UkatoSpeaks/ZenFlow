"use client";

// useStreak Hook
// Provides streak data with auto-check on login

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  checkAndUpdateStreak, 
  StreakData, 
  getStreakMessage,
  isStreakAtRisk,
} from '@/lib/streak-logic';

interface UseStreakReturn {
  streak: StreakData | null;
  isLoading: boolean;
  error: string | null;
  message: string;
  isAtRisk: boolean;
  refresh: () => Promise<void>;
}

export function useStreak(): UseStreakReturn {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch streak data
  const fetchStreak = useCallback(async () => {
    if (!user) {
      setStreak(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const streakData = await checkAndUpdateStreak(user.uid);
      setStreak(streakData);
    } catch (err) {
      console.error('Error fetching streak:', err);
      setError('Failed to load streak data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch on login
  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchStreak();
  }, [fetchStreak]);

  // Get streak message
  const message = streak ? getStreakMessage(streak.currentStreak) : "Start your first session!";
  
  // Check if streak is at risk
  const isAtRisk = streak ? isStreakAtRisk(streak.lastActiveDate) : false;

  return {
    streak,
    isLoading,
    error,
    message,
    isAtRisk,
    refresh,
  };
}

export default useStreak;
