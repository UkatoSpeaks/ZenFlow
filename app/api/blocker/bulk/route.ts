// Bulk Add Sites API
// POST: Add multiple sites at once (for presets)

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

// Site preset definitions
const PRESETS: Record<string, string[]> = {
  social: ['facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com', 'snapchat.com', 'linkedin.com'],
  entertainment: ['youtube.com', 'netflix.com', 'twitch.tv', 'reddit.com', '9gag.com', 'imgur.com'],
  news: ['cnn.com', 'bbc.com', 'news.google.com', 'buzzfeed.com', 'huffpost.com', 'foxnews.com'],
};

// POST /api/blocker/bulk - Add multiple sites or a preset
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const body = await request.json();
    
    let sitesToAdd: string[] = [];

    // Check if preset is requested
    if (body.preset) {
      const presetSites = PRESETS[body.preset.toLowerCase()];
      if (!presetSites) {
        return errorResponse(`Invalid preset. Available: ${Object.keys(PRESETS).join(', ')}`);
      }
      sitesToAdd = presetSites;
    } else if (body.sites && Array.isArray(body.sites)) {
      sitesToAdd = body.sites.map((s: string) => 
        s.toLowerCase()
          .replace(/^(https?:\/\/)?(www\.)?/, '')
          .replace(/\/.*$/, '')
          .trim()
      ).filter((s: string) => s && s.includes('.'));
    } else {
      return errorResponse('Either preset or sites array is required');
    }

    if (sitesToAdd.length === 0) {
      return errorResponse('No valid sites to add');
    }

    const docRef = adminDb.collection('blockerSettings').doc(userId);
    const doc = await docRef.get();

    let settings: BlockerSettings;
    
    if (!doc.exists) {
      settings = {
        userId,
        ...DEFAULT_BLOCKER_SETTINGS,
        updatedAt: new Date().toISOString(),
      };
    } else {
      settings = doc.data() as BlockerSettings;
    }

    // Filter out sites that already exist
    const existingDomains = new Set(settings.blockedSites.map(s => s.domain));
    const newSites: BlockedSite[] = sitesToAdd
      .filter(domain => !existingDomains.has(domain))
      .map(domain => ({
        domain,
        enabled: true,
        addedAt: Date.now(),
      }));

    if (newSites.length === 0) {
      return successResponse(
        { added: 0, total: settings.blockedSites.length },
        'All sites are already in your blocklist'
      );
    }

    // Add new sites
    settings.blockedSites = [...newSites, ...settings.blockedSites];
    settings.updatedAt = new Date().toISOString();

    await docRef.set(settings);

    return successResponse(
      { 
        added: newSites.length, 
        sites: newSites.map(s => s.domain),
        total: settings.blockedSites.length 
      },
      `Added ${newSites.length} sites to blocklist`
    );
  } catch (error) {
    console.error('Error bulk adding sites:', error);
    return serverError('Failed to add sites');
  }
}

// DELETE /api/blocker/bulk - Clear all sites
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const docRef = adminDb.collection('blockerSettings').doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return successResponse({ cleared: 0 }, 'No sites to clear');
    }

    const settings = doc.data() as BlockerSettings;
    const clearedCount = settings.blockedSites.length;

    settings.blockedSites = [];
    settings.updatedAt = new Date().toISOString();

    await docRef.update({
      blockedSites: [],
      updatedAt: settings.updatedAt,
    });

    return successResponse(
      { cleared: clearedCount },
      `Cleared ${clearedCount} sites from blocklist`
    );
  } catch (error) {
    console.error('Error clearing sites:', error);
    return serverError('Failed to clear sites');
  }
}
