// Streak Logic
// Auto-calculates streaks with daily checks

import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  streakStartDate: string | null;
  lastCheckedDate: string | null;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  sessionsCount: number;
  hasActivity: boolean;
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Get yesterday's date in YYYY-MM-DD format
export function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// Calculate days between two dates
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Check and update streak on login/app open
export async function checkAndUpdateStreak(userId: string): Promise<StreakData> {
  const today = getTodayDate();
  
  // Get user document
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  let streakData: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    streakStartDate: null,
    lastCheckedDate: null,
  };
  
  if (userDoc.exists()) {
    const data = userDoc.data();
    streakData = {
      currentStreak: data.currentStreak || 0,
      longestStreak: data.longestStreak || 0,
      lastActiveDate: data.lastActiveDate || null,
      streakStartDate: data.streakStartDate || null,
      lastCheckedDate: data.lastCheckedDate || null,
    };
  }
  
  // If already checked today, return cached data
  if (streakData.lastCheckedDate === today) {
    return streakData;
  }
  
  // Recalculate streak from daily stats
  const calculatedStreak = await calculateStreakFromHistory(userId);
  
  // Update user document
  const updates = {
    currentStreak: calculatedStreak.currentStreak,
    longestStreak: Math.max(calculatedStreak.longestStreak, streakData.longestStreak),
    lastActiveDate: calculatedStreak.lastActiveDate,
    streakStartDate: calculatedStreak.streakStartDate,
    lastCheckedDate: today,
  };
  
  await updateDoc(userRef, updates);
  
  return updates;
}

// Calculate streak from activity history
async function calculateStreakFromHistory(userId: string): Promise<StreakData> {
  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  
  // Fetch last 365 days of daily stats
  const dailyStatsRef = collection(db, 'dailyStats');
  const q = query(
    dailyStatsRef,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(365)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      streakStartDate: null,
      lastCheckedDate: today,
    };
  }
  
  const activeDays = snapshot.docs
    .map(doc => doc.data())
    .filter(day => day.totalMinutes > 0)
    .map(day => day.date as string)
    .sort((a, b) => b.localeCompare(a)); // Sort descending
  
  if (activeDays.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      streakStartDate: null,
      lastCheckedDate: today,
    };
  }
  
  const lastActiveDate = activeDays[0];
  
  // Current streak: consecutive days ending today or yesterday
  let currentStreak = 0;
  let streakStartDate: string | null = null;
  
  // Check if streak is still active (last activity was today or yesterday)
  if (lastActiveDate === today || lastActiveDate === yesterday) {
    currentStreak = 1;
    streakStartDate = lastActiveDate;
    
    // Count consecutive days backwards
    for (let i = 1; i < activeDays.length; i++) {
      const currentDay = activeDays[i - 1];
      const prevDay = activeDays[i];
      
      // Check if consecutive
      const expectedPrevDay = new Date(currentDay);
      expectedPrevDay.setDate(expectedPrevDay.getDate() - 1);
      const expectedPrevDayStr = expectedPrevDay.toISOString().split('T')[0];
      
      if (prevDay === expectedPrevDayStr) {
        currentStreak++;
        streakStartDate = prevDay;
      } else {
        break; // Streak broken
      }
    }
  }
  
  // Calculate longest streak
  let longestStreak = currentStreak;
  let tempStreak = 1;
  
  for (let i = 1; i < activeDays.length; i++) {
    const currentDay = activeDays[i - 1];
    const prevDay = activeDays[i];
    
    const expectedPrevDay = new Date(currentDay);
    expectedPrevDay.setDate(expectedPrevDay.getDate() - 1);
    const expectedPrevDayStr = expectedPrevDay.toISOString().split('T')[0];
    
    if (prevDay === expectedPrevDayStr) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return {
    currentStreak,
    longestStreak,
    lastActiveDate,
    streakStartDate,
    lastCheckedDate: today,
  };
}

// Record activity for today (called after session completion)
export async function recordDailyActivity(
  userId: string, 
  minutes: number,
  tag: string
): Promise<void> {
  const today = getTodayDate();
  const dailyStatsRef = doc(db, 'dailyStats', `${userId}_${today}`);
  
  const existing = await getDoc(dailyStatsRef);
  
  if (existing.exists()) {
    const data = existing.data();
    await updateDoc(dailyStatsRef, {
      totalMinutes: (data.totalMinutes || 0) + minutes,
      sessionsCount: (data.sessionsCount || 0) + 1,
      [`tags.${tag}`]: (data.tags?.[tag] || 0) + minutes,
      updatedAt: Date.now(),
    });
  } else {
    await setDoc(dailyStatsRef, {
      userId,
      date: today,
      totalMinutes: minutes,
      sessionsCount: 1,
      tags: { [tag]: minutes },
      hasActivity: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
  
  // Update user's last active date and potentially streak
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    const userData = userDoc.data();
    const lastActiveDate = userData.lastActiveDate;
    const yesterday = getYesterdayDate();
    
    let newStreak = userData.currentStreak || 0;
    let streakStartDate = userData.streakStartDate || today;
    
    if (lastActiveDate === null) {
      // First activity ever
      newStreak = 1;
      streakStartDate = today;
    } else if (lastActiveDate === today) {
      // Already active today, no change
    } else if (lastActiveDate === yesterday) {
      // Continuing streak
      newStreak++;
    } else {
      // Streak broken, start new
      newStreak = 1;
      streakStartDate = today;
    }
    
    await updateDoc(userRef, {
      lastActiveDate: today,
      currentStreak: newStreak,
      streakStartDate,
      longestStreak: Math.max(newStreak, userData.longestStreak || 0),
      totalFocusMinutes: (userData.totalFocusMinutes || 0) + minutes,
      totalSessions: (userData.totalSessions || 0) + 1,
    });
  }
}

// Get streak status message
export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your streak today!";
  if (streak === 1) return "You're on a roll! Keep it up!";
  if (streak < 7) return `${streak} day streak! Amazing!`;
  if (streak < 30) return `${streak} days! You're unstoppable!`;
  if (streak < 100) return `${streak} days! Legendary focus!`;
  return `${streak} days! You're a Focus Master!`;
}

// Check if streak is at risk (no activity today and it's getting late)
export function isStreakAtRisk(lastActiveDate: string | null): boolean {
  if (!lastActiveDate) return false;
  
  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  
  // If last activity was yesterday and it's after 6 PM, streak is at risk
  if (lastActiveDate === yesterday) {
    const currentHour = new Date().getHours();
    return currentHour >= 18;
  }
  
  // If last activity was before yesterday, streak is already broken
  if (lastActiveDate !== today && lastActiveDate !== yesterday) {
    return false; // Not at risk, already broken
  }
  
  return false;
}
