// Streak API
// GET: Get user's current streak info
// POST: Update streak (called daily)

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import {
  successResponse,
  authError,
  serverError,
  getUserIdFromRequest,
} from '@/lib/api-utils';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakStartDate: string;
}

// GET /api/user/streak - Get user's streak information
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    // Get user profile which has streak data
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return successResponse({
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        streakStartDate: null,
      });
    }

    const userData = userDoc.data()!;

    // Calculate current streak from daily stats
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Fetch recent daily stats
    const dailyStatsSnapshot = await adminDb
      .collection('dailyStats')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(365)
      .get();

    if (dailyStatsSnapshot.empty) {
      return successResponse({
        currentStreak: 0,
        longestStreak: userData.longestStreak || 0,
        lastActiveDate: null,
        streakStartDate: null,
      });
    }

    const dailyStats = dailyStatsSnapshot.docs.map(doc => doc.data());
    
    // Calculate current streak
    let currentStreak = 0;
    let streakStartDate: string | null = null;
    let lastActiveDate = dailyStats[0]?.date || null;

    // Check if today or yesterday has activity
    const hasActivityToday = dailyStats.some(d => d.date === today);
    const hasActivityYesterday = dailyStats.some(d => d.date === yesterday);

    if (hasActivityToday || hasActivityYesterday) {
      // Count consecutive days
      const startDate = hasActivityToday ? today : yesterday;
      let checkDate = new Date(startDate);
      
      for (const stat of dailyStats) {
        const expectedDate = checkDate.toISOString().split('T')[0];
        
        if (stat.date === expectedDate && stat.totalMinutes > 0) {
          currentStreak++;
          streakStartDate = stat.date;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (stat.date < expectedDate) {
          break;
        }
      }
    }

    // Update longest streak if current is higher
    const longestStreak = Math.max(currentStreak, userData.longestStreak || 0);
    
    if (longestStreak > (userData.longestStreak || 0)) {
      await userRef.update({
        currentStreak,
        longestStreak,
      });
    }

    return successResponse({
      currentStreak,
      longestStreak,
      lastActiveDate,
      streakStartDate,
      daysThisWeek: dailyStats.filter(d => {
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        return d.date >= weekAgo;
      }).length,
      daysThisMonth: dailyStats.filter(d => {
        const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        return d.date >= monthAgo;
      }).length,
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    return serverError('Failed to fetch streak data');
  }
}

// POST /api/user/streak - Record activity for today
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const today = new Date().toISOString().split('T')[0];
    const dailyStatsRef = adminDb.collection('dailyStats').doc(`${userId}_${today}`);
    
    const doc = await dailyStatsRef.get();
    
    if (!doc.exists) {
      // Create entry for today
      await dailyStatsRef.set({
        userId,
        date: today,
        totalMinutes: 0,
        sessionsCount: 0,
        tags: {},
        streak: 1,
      });
    }

    // Update user's last activity
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({
      lastActiveDate: today,
    });

    return successResponse({ date: today }, 'Activity recorded');
  } catch (error) {
    console.error('Error recording activity:', error);
    return serverError('Failed to record activity');
  }
}
