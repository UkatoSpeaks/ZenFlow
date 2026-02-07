// User Profile API
// GET: Retrieve user's profile
// PUT: Update user's profile
// DELETE: Delete user account and all data

import { NextRequest } from 'next/server';
import { adminDb, adminAuthService } from '@/lib/firebase-admin';
import {
  successResponse,
  errorResponse,
  authError,
  serverError,
  getUserIdFromRequest,
  UserProfile,
} from '@/lib/api-utils';

// GET /api/user - Get user's profile
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const docRef = adminDb.collection('users').doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Try to get user info from Firebase Auth
      try {
        const authUser = await adminAuthService.getUser(userId);
        
        // Create profile from auth data
        const newProfile: UserProfile = {
          userId,
          email: authUser.email || '',
          displayName: authUser.displayName || 'User',
          photoURL: authUser.photoURL || undefined,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          totalSessions: 0,
          totalFocusMinutes: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalBlockedAttempts: 0,
        };
        
        await docRef.set(newProfile);
        return successResponse(newProfile);
      } catch {
        return errorResponse('User profile not found', 404);
      }
    }

    return successResponse(doc.data() as UserProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return serverError('Failed to fetch user profile');
  }
}

// PUT /api/user - Update user's profile
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const body = await request.json();
    
    const allowedFields = ['displayName', 'photoURL'];
    const updates: Partial<UserProfile> = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'displayName') {
          if (typeof body[field] !== 'string' || body[field].length < 1 || body[field].length > 50) {
            return errorResponse('displayName must be a string between 1 and 50 characters');
          }
        }
        if (field === 'photoURL') {
          if (body[field] !== null && typeof body[field] !== 'string') {
            return errorResponse('photoURL must be a string or null');
          }
        }
        (updates as Record<string, unknown>)[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields to update');
    }

    const docRef = adminDb.collection('users').doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('User profile not found. Please reload the page.', 404);
    }

    await docRef.update(updates);

    // Also update Firebase Auth profile if displayName changed
    if (updates.displayName) {
      try {
        await adminAuthService.updateUser(userId, {
          displayName: updates.displayName,
        });
      } catch (error) {
        console.error('Error updating auth profile:', error);
        // Continue even if auth update fails
      }
    }

    const updatedDoc = await docRef.get();
    return successResponse(updatedDoc.data() as UserProfile, 'Profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    return serverError('Failed to update user profile');
  }
}

// DELETE /api/user - Delete user account and all data
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    // Delete all user data in a batch
    const batch = adminDb.batch();

    // Delete user profile
    batch.delete(adminDb.collection('users').doc(userId));
    
    // Delete user settings
    batch.delete(adminDb.collection('settings').doc(userId));
    
    // Delete blocker settings
    batch.delete(adminDb.collection('blockerSettings').doc(userId));

    // Query and delete all sessions
    const sessionsSnapshot = await adminDb
      .collection('sessions')
      .where('userId', '==', userId)
      .get();
    
    sessionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Query and delete all daily stats
    const dailyStatsSnapshot = await adminDb
      .collection('dailyStats')
      .where('userId', '==', userId)
      .get();
    
    dailyStatsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Execute batch delete
    await batch.commit();

    // Delete Firebase Auth account
    try {
      await adminAuthService.deleteUser(userId);
    } catch (error) {
      console.error('Error deleting auth account:', error);
      // Data is already deleted, so we continue
    }

    return successResponse({ userId }, 'Account and all data deleted successfully');
  } catch (error) {
    console.error('Error deleting user account:', error);
    return serverError('Failed to delete user account');
  }
}
