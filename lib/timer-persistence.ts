// Timer Persistence Layer
// Handles saving/restoring timer state across refreshes, tab changes, and browser close

import { db } from './firebase';
import { doc, setDoc, getDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';

// Timer state interface
export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  isBreak: boolean;
  timeRemaining: number; // seconds
  totalDuration: number; // seconds
  startedAt: number | null; // timestamp when timer started
  pausedAt: number | null; // timestamp when paused
  tag: string;
  taskName: string;
  sessionId: string;
}

// Default timer state
export const DEFAULT_TIMER_STATE: TimerState = {
  isRunning: false,
  isPaused: false,
  isBreak: false,
  timeRemaining: 25 * 60,
  totalDuration: 25 * 60,
  startedAt: null,
  pausedAt: null,
  tag: 'Focus',
  taskName: '',
  sessionId: '',
};

// LocalStorage key
const TIMER_LOCAL_KEY = 'zenflow_timer_state';
const TIMER_HEARTBEAT_KEY = 'zenflow_timer_heartbeat';

// Save timer state to localStorage (instant, works offline)
export function saveToLocalStorage(state: TimerState): void {
  try {
    localStorage.setItem(TIMER_LOCAL_KEY, JSON.stringify({
      ...state,
      savedAt: Date.now(),
    }));
    localStorage.setItem(TIMER_HEARTBEAT_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error saving timer to localStorage:', error);
  }
}

// Load timer state from localStorage
export function loadFromLocalStorage(): (TimerState & { savedAt?: number }) | null {
  try {
    const saved = localStorage.getItem(TIMER_LOCAL_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error('Error loading timer from localStorage:', error);
    return null;
  }
}

// Clear timer state from localStorage
export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(TIMER_LOCAL_KEY);
    localStorage.removeItem(TIMER_HEARTBEAT_KEY);
  } catch (error) {
    console.error('Error clearing timer from localStorage:', error);
  }
}

// Calculate elapsed time when timer was running
export function calculateElapsedTime(state: TimerState): number {
  if (!state.isRunning || !state.startedAt) return 0;
  
  const now = state.isPaused && state.pausedAt ? state.pausedAt : Date.now();
  const elapsed = Math.floor((now - state.startedAt) / 1000);
  
  return elapsed;
}

// Calculate remaining time accounting for elapsed
export function calculateRemainingTime(state: TimerState): number {
  if (!state.isRunning) return state.timeRemaining;
  
  const elapsed = calculateElapsedTime(state);
  const remaining = state.totalDuration - elapsed;
  
  return Math.max(0, remaining);
}

// Sync timer state to Firestore (for cross-device sync)
export async function syncToFirestore(userId: string, state: TimerState): Promise<void> {
  try {
    const timerRef = doc(db, 'activeTimers', userId);
    await setDoc(timerRef, {
      ...state,
      userId,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (error) {
    console.error('Error syncing timer to Firestore:', error);
  }
}

// Load timer state from Firestore
export async function loadFromFirestore(userId: string): Promise<TimerState | null> {
  try {
    const timerRef = doc(db, 'activeTimers', userId);
    const snapshot = await getDoc(timerRef);
    
    if (!snapshot.exists()) return null;
    
    const data = snapshot.data() as TimerState & { updatedAt: number };
    
    // Check if timer is stale (more than 25 minutes old and was running)
    if (data.isRunning && data.startedAt) {
      const elapsed = Date.now() - data.startedAt;
      if (elapsed > data.totalDuration * 1000 + 60000) {
        // Timer should have completed, return stopped state
        return {
          ...DEFAULT_TIMER_STATE,
          totalDuration: data.totalDuration,
          tag: data.tag,
          taskName: data.taskName,
        };
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error loading timer from Firestore:', error);
    return null;
  }
}

// Subscribe to timer state changes in Firestore
export function subscribeToFirestore(
  userId: string, 
  callback: (state: TimerState | null) => void
): Unsubscribe {
  const timerRef = doc(db, 'activeTimers', userId);
  
  return onSnapshot(timerRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback(snapshot.data() as TimerState);
  }, (error) => {
    console.error('Error subscribing to timer:', error);
  });
}

// Clear timer from Firestore
export async function clearFromFirestore(userId: string): Promise<void> {
  try {
    const timerRef = doc(db, 'activeTimers', userId);
    await setDoc(timerRef, {
      ...DEFAULT_TIMER_STATE,
      userId,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error clearing timer from Firestore:', error);
  }
}

// Generate unique session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Check if timer should have completed while page was closed
export function checkTimerCompletion(state: TimerState): {
  isCompleted: boolean;
  actualDuration: number;
} {
  if (!state.isRunning || !state.startedAt) {
    return { isCompleted: false, actualDuration: 0 };
  }

  const now = Date.now();
  const expectedEndTime = state.startedAt + (state.totalDuration * 1000);
  
  if (now >= expectedEndTime) {
    return {
      isCompleted: true,
      actualDuration: state.totalDuration,
    };
  }
  
  return { isCompleted: false, actualDuration: 0 };
}

// Visibility change handler setup
export function setupVisibilityHandler(
  onVisible: () => void,
  onHidden: () => void
): () => void {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      onHidden();
    } else {
      onVisible();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

// Before unload handler setup
export function setupBeforeUnloadHandler(
  onBeforeUnload: () => void
): () => void {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    onBeforeUnload();
    // Only show confirmation if timer is running
    const state = loadFromLocalStorage();
    if (state?.isRunning && !state.isPaused) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}
