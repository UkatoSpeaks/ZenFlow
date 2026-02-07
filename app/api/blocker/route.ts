// Site Blocker API
// GET: Retrieve user's blocked sites and settings
// PUT: Update blocker settings

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import {
  successResponse,
  errorResponse,
  authError,
  serverError,
  getUserIdFromRequest,
  BlockerSettings,
  BlockedSite,
  DEFAULT_BLOCKER_SETTINGS,
} from '@/lib/api-utils';

// GET /api/blocker - Get user's blocker settings
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const docRef = adminDb.collection('blockerSettings').doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Return default settings if none exist
      const defaultSettings: BlockerSettings = {
        userId,
        ...DEFAULT_BLOCKER_SETTINGS,
        updatedAt: new Date().toISOString(),
      };
      
      // Create default settings in database
      await docRef.set(defaultSettings);
      
      return successResponse(defaultSettings);
    }

    return successResponse(doc.data() as BlockerSettings);
  } catch (error) {
    console.error('Error fetching blocker settings:', error);
    return serverError('Failed to fetch blocker settings');
  }
}

// PUT /api/blocker - Update blocker settings
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const body = await request.json();
    
    const updates: Partial<BlockerSettings> = {};

    // Validate and update master toggle
    if (body.masterToggle !== undefined) {
      if (typeof body.masterToggle !== 'boolean') {
        return errorResponse('masterToggle must be a boolean');
      }
      updates.masterToggle = body.masterToggle;
    }

    // Validate and update block mode
    if (body.blockMode !== undefined) {
      const validModes = ['focus', 'always', 'warning'];
      if (!validModes.includes(body.blockMode)) {
        return errorResponse(`blockMode must be one of: ${validModes.join(', ')}`);
      }
      updates.blockMode = body.blockMode;
    }

    // Validate and update blocked sites
    if (body.blockedSites !== undefined) {
      if (!Array.isArray(body.blockedSites)) {
        return errorResponse('blockedSites must be an array');
      }
      
      // Validate each site
      const validatedSites: BlockedSite[] = [];
      for (const site of body.blockedSites) {
        if (!site.domain || typeof site.domain !== 'string') {
          return errorResponse('Each blocked site must have a domain string');
        }
        
        validatedSites.push({
          domain: site.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, ''),
          enabled: site.enabled !== false,
          addedAt: site.addedAt || Date.now(),
        });
      }
      
      updates.blockedSites = validatedSites;
    }

    // Update blocked attempts counter
    if (body.incrementBlockedAttempts === true) {
      const docRef = adminDb.collection('blockerSettings').doc(userId);
      const doc = await docRef.get();
      const currentCount = doc.exists ? (doc.data()?.totalBlockedAttempts || 0) : 0;
      updates.totalBlockedAttempts = currentCount + 1;
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields to update');
    }

    updates.updatedAt = new Date().toISOString();

    const docRef = adminDb.collection('blockerSettings').doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      const newSettings: BlockerSettings = {
        userId,
        ...DEFAULT_BLOCKER_SETTINGS,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await docRef.set(newSettings);
      return successResponse(newSettings, 'Blocker settings created successfully');
    }

    await docRef.update(updates);

    const updatedDoc = await docRef.get();
    return successResponse(updatedDoc.data() as BlockerSettings, 'Blocker settings updated successfully');
  } catch (error) {
    console.error('Error updating blocker settings:', error);
    return serverError('Failed to update blocker settings');
  }
}
