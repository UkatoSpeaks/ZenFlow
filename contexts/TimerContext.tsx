"use client";

// Timer Context
// Manages timer state with persistence, break auto-start, and smooth transitions

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useRef, 
  useCallback,
  ReactNode 
} from 'react';
import { useAuth } from './AuthContext';
import {
  TimerState,
  DEFAULT_TIMER_STATE,
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  syncToFirestore,
  loadFromFirestore,
  calculateRemainingTime,
  checkTimerCompletion,
  setupVisibilityHandler,
  setupBeforeUnloadHandler,
  generateSessionId,
} from '@/lib/timer-persistence';
import { recordDailyActivity } from '@/lib/streak-logic';
import { invalidateAnalyticsCache } from '@/lib/analytics-cache';
import { playSound, initAudio } from '@/lib/sounds';

interface TimerContextType {
  // State
  state: TimerState;
  displayTime: number; // Current time to display (in seconds)
  progress: number; // 0-100 progress percentage
  
  // Actions
  startTimer: (duration: number, tag?: string, taskName?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (saveSession?: boolean) => Promise<void>;
  resetTimer: () => void;
  startBreak: (duration: number) => void;
  skipBreak: () => void;
  
  // Settings
  setTag: (tag: string) => void;
  setTaskName: (taskName: string) => void;
  setDuration: (duration: number) => void;
  
  // Status
  isLoading: boolean;
  hasCompletedSession: boolean;
  showBreakScreen: boolean;
  setShowBreakScreen: (show: boolean) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Timer state
  const [state, setState] = useState<TimerState>(DEFAULT_TIMER_STATE);
  const [displayTime, setDisplayTime] = useState(DEFAULT_TIMER_STATE.timeRemaining);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedSession, setHasCompletedSession] = useState(false);
  const [showBreakScreen, setShowBreakScreen] = useState(false);
  
  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Progress percentage
  const progress = state.totalDuration > 0 
    ? ((state.totalDuration - displayTime) / state.totalDuration) * 100 
    : 0;

  // Initialize audio on user interaction
  useEffect(() => {
    initAudio();
  }, []);

  // Restore timer state on mount
  useEffect(() => {
    async function restoreState() {
      setIsLoading(true);
      
      // First, try localStorage (faster)
      const localState = loadFromLocalStorage();
      
      if (localState) {
        // Check if timer completed while away
        const { isCompleted, actualDuration } = checkTimerCompletion(localState);
        
        if (isCompleted && !localState.isBreak) {
          // Timer completed while page was closed
          if (user && actualDuration > 0) {
            await saveCompletedSession(actualDuration, localState.tag, localState.taskName);
          }
          
          // Show break screen
          setShowBreakScreen(true);
          setHasCompletedSession(true);
          setState({
            ...DEFAULT_TIMER_STATE,
            tag: localState.tag,
            taskName: localState.taskName,
            totalDuration: localState.totalDuration,
          });
          clearLocalStorage();
        } else if (localState.isRunning && !localState.isPaused) {
          // Timer is still running
          const remaining = calculateRemainingTime(localState);
          setState(localState);
          setDisplayTime(remaining);
        } else {
          // Timer was paused or stopped
          setState(localState);
          setDisplayTime(localState.timeRemaining);
        }
      }
      
      // If logged in, also check Firestore for cross-device sync
      if (user) {
        try {
          const firestoreState = await loadFromFirestore(user.uid);
          if (firestoreState && firestoreState.isRunning) {
            // Check if Firestore has more recent state
            const localSavedAt = localState?.startedAt || 0;
            const firestoreSavedAt = firestoreState.startedAt || 0;
            
            if (firestoreSavedAt > localSavedAt) {
              const remaining = calculateRemainingTime(firestoreState);
              if (remaining > 0) {
                setState(firestoreState);
                setDisplayTime(remaining);
              }
            }
          }
        } catch (error) {
          console.error('Error loading Firestore state:', error);
        }
      }
      
      setIsLoading(false);
    }
    
    restoreState();
  }, [user]);

  // Timer tick logic
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setDisplayTime(prev => {
          const newTime = prev - 1;
          
          if (newTime <= 0) {
            // Timer completed
            handleTimerComplete();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.isPaused]);

  // Persist state changes
  useEffect(() => {
    if (!isLoading && state.sessionId) {
      const stateToSave = {
        ...state,
        timeRemaining: displayTime,
      };
      
      saveToLocalStorage(stateToSave);
      
      // Broadcast to extension
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zenflow-sync', {
          detail: {
            focusState: {
              isActive: state.isRunning && !state.isPaused && !state.isBreak,
              timeRemaining: displayTime,
              totalDuration: state.totalDuration,
              startedAt: state.startedAt,
            }
          }
        }));
      }
      
      // Debounced Firestore sync
      if (user) {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(() => {
          syncToFirestore(user.uid, stateToSave).catch(console.error);
        }, 2000);
      }
    }
  }, [state, displayTime, isLoading, user]);

  // Visibility change handler
  useEffect(() => {
    const cleanup = setupVisibilityHandler(
      () => {
        // Tab became visible - recalculate time
        if (state.isRunning && !state.isPaused) {
          const remaining = calculateRemainingTime(state);
          if (remaining <= 0) {
            handleTimerComplete();
          } else {
            setDisplayTime(remaining);
          }
        }
      },
      () => {
        // Tab became hidden - save state
        if (state.isRunning) {
          saveToLocalStorage({ ...state, timeRemaining: displayTime });
        }
      }
    );
    
    return cleanup;
  }, [state, displayTime]);

  // Before unload handler
  useEffect(() => {
    const cleanup = setupBeforeUnloadHandler(() => {
      if (state.isRunning) {
        saveToLocalStorage({ ...state, timeRemaining: displayTime });
      }
    });
    
    return cleanup;
  }, [state, displayTime]);

  // Handle timer completion
  const handleTimerComplete = useCallback(async () => {
    // Play notification sound
    playSound(state.isBreak ? 'break' : 'notification', 0.7);
    
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const message = state.isBreak 
        ? "Break's over! Ready to focus?" 
        : "Great work! Time for a break.";
      
      new Notification('ZenFlow', {
        body: message,
        icon: '/favicon.ico',
      });
    }
    
    if (state.isBreak) {
      // Break completed
      setState(prev => ({
        ...DEFAULT_TIMER_STATE,
        tag: prev.tag,
        taskName: prev.taskName,
        totalDuration: prev.totalDuration,
      }));
      setDisplayTime(state.totalDuration);
      setShowBreakScreen(false);
    } else {
      // Focus session completed
      const duration = Math.floor(state.totalDuration / 60); // Convert to minutes
      
      if (user && duration > 0) {
        await saveCompletedSession(duration, state.tag, state.taskName);
      }
      
      setHasCompletedSession(true);
      setShowBreakScreen(true);
      
      setState(prev => ({
        ...DEFAULT_TIMER_STATE,
        tag: prev.tag,
        taskName: prev.taskName,
        totalDuration: prev.totalDuration,
      }));
    }
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    clearLocalStorage();
  }, [state, user]);

  // Save completed session
  const saveCompletedSession = async (duration: number, tag: string, taskName: string) => {
    if (!user) return;
    
    try {
      // Record daily activity (updates streak)
      await recordDailyActivity(user.uid, duration, tag);
      
      // Invalidate analytics cache
      invalidateAnalyticsCache();
      
      console.log('Session saved:', { duration, tag, taskName });
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  // Start timer
  const startTimer = useCallback((duration: number, tag = 'Focus', taskName = '') => {
    const newState: TimerState = {
      isRunning: true,
      isPaused: false,
      isBreak: false,
      timeRemaining: duration * 60,
      totalDuration: duration * 60,
      startedAt: Date.now(),
      pausedAt: null,
      tag,
      taskName,
      sessionId: generateSessionId(),
    };
    
    setState(newState);
    setDisplayTime(duration * 60);
    setShowBreakScreen(false);
    setHasCompletedSession(false);
  }, []);

  // Pause timer
  const pauseTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true,
      pausedAt: Date.now(),
      timeRemaining: displayTime,
    }));
  }, [displayTime]);

  // Resume timer
  const resumeTimer = useCallback(() => {
    const pausedDuration = state.pausedAt ? Date.now() - state.pausedAt : 0;
    
    setState(prev => ({
      ...prev,
      isPaused: false,
      pausedAt: null,
      startedAt: prev.startedAt ? prev.startedAt + pausedDuration : Date.now(),
    }));
  }, [state.pausedAt]);

  // Stop timer
  const stopTimer = useCallback(async (saveSession = false) => {
    if (saveSession && user && !state.isBreak) {
      const elapsedMinutes = Math.floor((state.totalDuration - displayTime) / 60);
      if (elapsedMinutes >= 1) {
        await saveCompletedSession(elapsedMinutes, state.tag, state.taskName);
      }
    }
    
    setState(prev => ({
      ...DEFAULT_TIMER_STATE,
      tag: prev.tag,
      taskName: prev.taskName,
      totalDuration: prev.totalDuration,
    }));
    setDisplayTime(state.totalDuration);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    clearLocalStorage();
  }, [displayTime, state, user]);

  // Reset timer
  const resetTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      startedAt: null,
      pausedAt: null,
      timeRemaining: prev.totalDuration,
    }));
    setDisplayTime(state.totalDuration);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [state.totalDuration]);

  // Start break
  const startBreak = useCallback((duration: number) => {
    const newState: TimerState = {
      isRunning: true,
      isPaused: false,
      isBreak: true,
      timeRemaining: duration * 60,
      totalDuration: duration * 60,
      startedAt: Date.now(),
      pausedAt: null,
      tag: state.tag,
      taskName: state.taskName,
      sessionId: generateSessionId(),
    };
    
    setState(newState);
    setDisplayTime(duration * 60);
    setShowBreakScreen(false);
  }, [state.tag, state.taskName]);

  // Skip break
  const skipBreak = useCallback(() => {
    setShowBreakScreen(false);
    setState(prev => ({
      ...DEFAULT_TIMER_STATE,
      tag: prev.tag,
      taskName: prev.taskName,
      totalDuration: prev.totalDuration,
    }));
    setDisplayTime(state.totalDuration);
  }, [state.totalDuration]);

  // Set tag
  const setTag = useCallback((tag: string) => {
    setState(prev => ({ ...prev, tag }));
  }, []);

  // Set task name
  const setTaskName = useCallback((taskName: string) => {
    setState(prev => ({ ...prev, taskName }));
  }, []);

  // Set duration
  const setDuration = useCallback((duration: number) => {
    const durationInSeconds = duration * 60;
    setState(prev => ({ 
      ...prev, 
      totalDuration: durationInSeconds,
      timeRemaining: durationInSeconds,
    }));
    setDisplayTime(durationInSeconds);
  }, []);

  return (
    <TimerContext.Provider
      value={{
        state,
        displayTime,
        progress,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        resetTimer,
        startBreak,
        skipBreak,
        setTag,
        setTaskName,
        setDuration,
        isLoading,
        hasCompletedSession,
        showBreakScreen,
        setShowBreakScreen,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

export default TimerContext;
