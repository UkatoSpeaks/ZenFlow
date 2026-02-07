// Focus Sessions API
// GET: Retrieve user's focus sessions
// POST: Create a new focus session

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import {
  successResponse,
  errorResponse,
  authError,
  serverError,
  getUserIdFromRequest,
  FocusSession,
} from '@/lib/api-utils';

// GET /api/sessions - Get user's focus sessions
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const tag = searchParams.get('tag');

    // Build query
    let query = adminDb
      .collection('sessions')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(Math.min(limit, 100)); // Cap at 100

    // Apply date filters if provided
    if (startDate) {
      query = query.where('timestamp', '>=', new Date(startDate).getTime());
    }
    if (endDate) {
      query = query.where('timestamp', '<=', new Date(endDate).getTime());
    }

    const snapshot = await query.get();
    
    const sessions: FocusSession[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FocusSession[];

    // Filter by tag if provided (done client-side due to Firestore limitations)
    const filteredSessions = tag 
      ? sessions.filter(s => s.tag === tag)
      : sessions;

    return successResponse({
      sessions: filteredSessions,
      count: filteredSessions.length,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return serverError('Failed to fetch sessions');
  }
}

// POST /api/sessions - Create a new focus session
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.duration || typeof body.duration !== 'number') {
      return errorResponse('Duration is required and must be a number');
    }

    const session: Omit<FocusSession, 'id'> = {
      userId,
      duration: body.duration,
      tag: body.tag || 'Focus',
      taskName: body.taskName || '',
      completedAt: new Date().toISOString(),
      timestamp: Date.now(),
      isCompleted: body.isCompleted !== false,
    };

    // Create session document
    const docRef = await adminDb.collection('sessions').add(session);

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const dailyStatsRef = adminDb
      .collection('dailyStats')
      .doc(`${userId}_${today}`);

    await adminDb.runTransaction(async (transaction) => {
      const dailyDoc = await transaction.get(dailyStatsRef);
      
      if (dailyDoc.exists) {
        const data = dailyDoc.data()!;
        transaction.update(dailyStatsRef, {
          totalMinutes: data.totalMinutes + session.duration,
          sessionsCount: data.sessionsCount + 1,
          [`tags.${session.tag}`]: (data.tags?.[session.tag] || 0) + session.duration,
        });
      } else {
        transaction.set(dailyStatsRef, {
          userId,
          date: today,
          totalMinutes: session.duration,
          sessionsCount: 1,
          tags: { [session.tag]: session.duration },
          streak: 1,
        });
      }
    });

    // Update user profile stats
    const userRef = adminDb.collection('users').doc(userId);
    await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (userDoc.exists) {
        const data = userDoc.data()!;
        transaction.update(userRef, {
          totalSessions: (data.totalSessions || 0) + 1,
          totalFocusMinutes: (data.totalFocusMinutes || 0) + session.duration,
        });
      }
    });

    return successResponse(
      { id: docRef.id, ...session },
      'Session created successfully'
    );
  } catch (error) {
    console.error('Error creating session:', error);
    return serverError('Failed to create session');
  }
}
