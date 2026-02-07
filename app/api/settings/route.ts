// User Settings API
// GET: Retrieve user's settings
// PUT: Update user's settings

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import {
  successResponse,
  errorResponse,
  authError,
  serverError,
  getUserIdFromRequest,
  UserSettings,
  DEFAULT_SETTINGS,
} from '@/lib/api-utils';

// GET /api/settings - Get user's settings
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const docRef = adminDb.collection('settings').doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Return default settings if none exist
      const defaultSettings: UserSettings = {
        userId,
        ...DEFAULT_SETTINGS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Create default settings in database
      await docRef.set(defaultSettings);
      
      return successResponse(defaultSettings);
    }

    return successResponse(doc.data() as UserSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return serverError('Failed to fetch settings');
  }
}

// PUT /api/settings - Update user's settings
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const body = await request.json();
    
    // Validate settings
    const allowedFields = [
      'defaultDuration',
      'autoStartBreak',
      'autoStartNextSession',
      'enterFullscreen',
      'darkFocusMode',
      'showMotivationalQuotes',
      'breakDuration',
      'stretchReminder',
      'hydrationReminder',
      'eyeRestReminder',
      'breathingAnimation',
      'desktopNotifications',
      'timerEndSound',
      'breakSound',
      'defaultAmbientSound',
      'soundVolume',
      'displayName',
      'photoURL',
    ];

    const updates: Partial<UserSettings> = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Type validation
        if (field === 'defaultDuration' || field === 'breakDuration') {
          if (typeof body[field] !== 'number' || body[field] < 1 || body[field] > 240) {
            return errorResponse(`${field} must be a number between 1 and 240`);
          }
        }
        if (field === 'soundVolume') {
          if (typeof body[field] !== 'number' || body[field] < 0 || body[field] > 1) {
            return errorResponse('soundVolume must be a number between 0 and 1');
          }
        }
        if (field === 'defaultAmbientSound') {
          const validSounds = ['off', 'rain', 'forest', 'waves', 'wind'];
          if (!validSounds.includes(body[field])) {
            return errorResponse(`defaultAmbientSound must be one of: ${validSounds.join(', ')}`);
          }
        }
        
        (updates as Record<string, unknown>)[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields to update');
    }

    updates.updatedAt = new Date().toISOString();

    const docRef = adminDb.collection('settings').doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Create settings with defaults + updates
      const newSettings: UserSettings = {
        userId,
        ...DEFAULT_SETTINGS,
        ...updates,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await docRef.set(newSettings);
      return successResponse(newSettings, 'Settings created successfully');
    }

    await docRef.update(updates);

    const updatedDoc = await docRef.get();
    return successResponse(updatedDoc.data() as UserSettings, 'Settings updated successfully');
  } catch (error) {
    console.error('Error updating settings:', error);
    return serverError('Failed to update settings');
  }
}

// DELETE /api/settings - Reset settings to defaults
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const docRef = adminDb.collection('settings').doc(userId);
    
    const defaultSettings: UserSettings = {
      userId,
      ...DEFAULT_SETTINGS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await docRef.set(defaultSettings);
    
    return successResponse(defaultSettings, 'Settings reset to defaults');
  } catch (error) {
    console.error('Error resetting settings:', error);
    return serverError('Failed to reset settings');
  }
}
