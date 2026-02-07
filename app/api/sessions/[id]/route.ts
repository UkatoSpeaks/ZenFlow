// Individual Session API
// GET: Retrieve a specific session
// PUT: Update a session
// DELETE: Delete a session

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import {
  successResponse,
  errorResponse,
  authError,
  notFoundError,
  serverError,
  getUserIdFromRequest,
} from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/sessions/[id] - Get a specific session
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const { id } = await params;
    const docRef = adminDb.collection('sessions').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return notFoundError('Session');
    }

    const session = doc.data()!;
    
    // Verify ownership
    if (session.userId !== userId) {
      return authError();
    }

    return successResponse({ id: doc.id, ...session });
  } catch (error) {
    console.error('Error fetching session:', error);
    return serverError('Failed to fetch session');
  }
}

// PUT /api/sessions/[id] - Update a session
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const { id } = await params;
    const body = await request.json();

    const docRef = adminDb.collection('sessions').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return notFoundError('Session');
    }

    const session = doc.data()!;
    
    // Verify ownership
    if (session.userId !== userId) {
      return authError();
    }

    // Only allow updating certain fields
    const allowedUpdates = ['tag', 'taskName', 'isCompleted'];
    const updates: Record<string, unknown> = {};
    
    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields to update');
    }

    await docRef.update(updates);

    return successResponse(
      { id, ...session, ...updates },
      'Session updated successfully'
    );
  } catch (error) {
    console.error('Error updating session:', error);
    return serverError('Failed to update session');
  }
}

// DELETE /api/sessions/[id] - Delete a session
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const { id } = await params;
    const docRef = adminDb.collection('sessions').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return notFoundError('Session');
    }

    const session = doc.data()!;
    
    // Verify ownership
    if (session.userId !== userId) {
      return authError();
    }

    await docRef.delete();

    return successResponse({ id }, 'Session deleted successfully');
  } catch (error) {
    console.error('Error deleting session:', error);
    return serverError('Failed to delete session');
  }
}
