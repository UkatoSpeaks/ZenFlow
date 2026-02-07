// Export Data API
// GET: Export all user data as JSON

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import {
  authError,
  serverError,
  getUserIdFromRequest,
} from '@/lib/api-utils';
import { NextResponse } from 'next/server';

// GET /api/user/export - Export all user data
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    // Fetch all user data
    const [
      userDoc,
      settingsDoc,
      blockerDoc,
      sessionsSnapshot,
      dailyStatsSnapshot,
    ] = await Promise.all([
      adminDb.collection('users').doc(userId).get(),
      adminDb.collection('settings').doc(userId).get(),
      adminDb.collection('blockerSettings').doc(userId).get(),
      adminDb.collection('sessions').where('userId', '==', userId).orderBy('timestamp', 'desc').get(),
      adminDb.collection('dailyStats').where('userId', '==', userId).orderBy('date', 'desc').get(),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: userDoc.exists ? userDoc.data() : null,
      settings: settingsDoc.exists ? settingsDoc.data() : null,
      blockerSettings: blockerDoc.exists ? blockerDoc.data() : null,
      sessions: sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })),
      dailyStats: dailyStatsSnapshot.docs.map(doc => doc.data()),
      metadata: {
        totalSessions: sessionsSnapshot.size,
        totalDays: dailyStatsSnapshot.size,
        totalMinutes: dailyStatsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().totalMinutes || 0), 0),
      },
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="zenflow-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return serverError('Failed to export data');
  }
}
