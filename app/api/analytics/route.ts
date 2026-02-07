// Analytics API
// GET: Retrieve user's analytics data

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import {
  successResponse,
  authError,
  serverError,
  getUserIdFromRequest,
  DailyFocusStats,
} from '@/lib/api-utils';

// GET /api/analytics - Get user's analytics data
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // today, week, month, year, all
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range based on period
    const now = new Date();
    let rangeStart: Date;
    const rangeEnd = new Date(now);

    switch (period) {
      case 'today':
        rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        rangeStart = new Date(now);
        rangeStart.setDate(rangeStart.getDate() - 7);
        break;
      case 'month':
        rangeStart = new Date(now);
        rangeStart.setMonth(rangeStart.getMonth() - 1);
        break;
      case 'year':
        rangeStart = new Date(now);
        rangeStart.setFullYear(rangeStart.getFullYear() - 1);
        break;
      default:
        rangeStart = new Date(0); // All time
    }

    // Override with custom dates if provided
    if (startDate) {
      rangeStart = new Date(startDate);
    }
    if (endDate) {
      rangeEnd.setTime(new Date(endDate).getTime());
    }

    // Fetch daily stats
    const dailyStatsSnapshot = await adminDb
      .collection('dailyStats')
      .where('userId', '==', userId)
      .where('date', '>=', rangeStart.toISOString().split('T')[0])
      .where('date', '<=', rangeEnd.toISOString().split('T')[0])
      .orderBy('date', 'desc')
      .get();

    const dailyStats: DailyFocusStats[] = dailyStatsSnapshot.docs.map(doc => ({
      ...doc.data(),
    })) as DailyFocusStats[];

    // Calculate summary statistics
    const totalMinutes = dailyStats.reduce((sum, day) => sum + day.totalMinutes, 0);
    const totalSessions = dailyStats.reduce((sum, day) => sum + day.sessionsCount, 0);
    const daysWithFocus = dailyStats.length;
    const avgMinutesPerDay = daysWithFocus > 0 ? Math.round(totalMinutes / daysWithFocus) : 0;
    const avgMinutesPerSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    // Calculate tag distribution
    const tagDistribution: Record<string, number> = {};
    dailyStats.forEach(day => {
      if (day.tags) {
        Object.entries(day.tags).forEach(([tag, minutes]) => {
          tagDistribution[tag] = (tagDistribution[tag] || 0) + minutes;
        });
      }
    });

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Sort daily stats by date descending
    const sortedDays = [...dailyStats].sort((a, b) => b.date.localeCompare(a.date));
    
    for (let i = 0; i < sortedDays.length; i++) {
      const dayDate = sortedDays[i].date;
      
      // Check if this is today or yesterday (or continues streak)
      if (i === 0 && (dayDate === today || dayDate === yesterday)) {
        currentStreak++;
      } else if (i > 0) {
        const prevDate = sortedDays[i - 1].date;
        const expectedDate = new Date(new Date(prevDate).getTime() - 86400000)
          .toISOString()
          .split('T')[0];
        
        if (dayDate === expectedDate) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Get longest session
    const sessionsSnapshot = await adminDb
      .collection('sessions')
      .where('userId', '==', userId)
      .where('timestamp', '>=', rangeStart.getTime())
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const sessions = sessionsSnapshot.docs.map(doc => doc.data());
    const longestSession = sessions.reduce((max, s) => 
      (s.duration || 0) > max ? s.duration : max, 0
    );

    // Calculate weekly data for chart
    const weeklyData: { day: string; minutes: number; date: string }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = dailyStats.find(d => d.date === dateStr);
      
      weeklyData.push({
        day: dayNames[date.getDay()],
        minutes: dayData?.totalMinutes || 0,
        date: dateStr,
      });
    }

    // Build heatmap data (last 16 weeks)
    const heatmapData: { date: string; minutes: number }[] = [];
    for (let i = 112; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = dailyStats.find(d => d.date === dateStr);
      
      heatmapData.push({
        date: dateStr,
        minutes: dayData?.totalMinutes || 0,
      });
    }

    // Recent sessions
    const recentSessions = sessions.slice(0, 10).map((s, i) => ({
      id: sessionsSnapshot.docs[i].id,
      date: s.completedAt,
      duration: s.duration,
      tag: s.tag,
      taskName: s.taskName,
    }));

    return successResponse({
      summary: {
        totalMinutes,
        totalSessions,
        daysWithFocus,
        avgMinutesPerDay,
        avgMinutesPerSession,
        currentStreak,
        longestSession,
      },
      tagDistribution,
      weeklyData,
      heatmapData,
      recentSessions,
      dailyStats,
      period,
      dateRange: {
        start: rangeStart.toISOString(),
        end: rangeEnd.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return serverError('Failed to fetch analytics');
  }
}
