// Individual Blocked Site API
// POST: Add a site to blocklist
// DELETE: Remove a site from blocklist

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

interface RouteParams {
  params: Promise<{ domain: string }>;
}

// POST /api/blocker/sites/[domain] - Add a site to blocklist
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const { domain: rawDomain } = await params;
    
    // Clean the domain
    const domain = decodeURIComponent(rawDomain)
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .replace(/\/.*$/, '')
      .trim();

    if (!domain || !domain.includes('.')) {
      return errorResponse('Invalid domain format');
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

    // Check if site already exists
    const existingIndex = settings.blockedSites.findIndex(s => s.domain === domain);
    
    if (existingIndex !== -1) {
      return errorResponse('Site is already in your blocklist');
    }

    // Add new site
    const newSite: BlockedSite = {
      domain,
      enabled: true,
      addedAt: Date.now(),
    };

    settings.blockedSites.unshift(newSite);
    settings.updatedAt = new Date().toISOString();

    await docRef.set(settings);

    return successResponse(
      { site: newSite, totalSites: settings.blockedSites.length },
      `Added ${domain} to blocklist`
    );
  } catch (error) {
    console.error('Error adding site:', error);
    return serverError('Failed to add site to blocklist');
  }
}

// PUT /api/blocker/sites/[domain] - Toggle a site's enabled status
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const { domain: rawDomain } = await params;
    const domain = decodeURIComponent(rawDomain).toLowerCase();

    const body = await request.json();
    const enabled = body.enabled;

    if (typeof enabled !== 'boolean') {
      return errorResponse('enabled must be a boolean');
    }

    const docRef = adminDb.collection('blockerSettings').doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Blocker settings not found');
    }

    const settings = doc.data() as BlockerSettings;
    const siteIndex = settings.blockedSites.findIndex(s => s.domain === domain);

    if (siteIndex === -1) {
      return errorResponse('Site not found in blocklist');
    }

    settings.blockedSites[siteIndex].enabled = enabled;
    settings.updatedAt = new Date().toISOString();

    await docRef.update({
      blockedSites: settings.blockedSites,
      updatedAt: settings.updatedAt,
    });

    return successResponse(
      { site: settings.blockedSites[siteIndex] },
      `${domain} ${enabled ? 'enabled' : 'disabled'}`
    );
  } catch (error) {
    console.error('Error toggling site:', error);
    return serverError('Failed to toggle site');
  }
}

// DELETE /api/blocker/sites/[domain] - Remove a site from blocklist
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return authError();
    }

    const { domain: rawDomain } = await params;
    const domain = decodeURIComponent(rawDomain).toLowerCase();

    const docRef = adminDb.collection('blockerSettings').doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Blocker settings not found');
    }

    const settings = doc.data() as BlockerSettings;
    const siteIndex = settings.blockedSites.findIndex(s => s.domain === domain);

    if (siteIndex === -1) {
      return errorResponse('Site not found in blocklist');
    }

    settings.blockedSites.splice(siteIndex, 1);
    settings.updatedAt = new Date().toISOString();

    await docRef.update({
      blockedSites: settings.blockedSites,
      updatedAt: settings.updatedAt,
    });

    return successResponse(
      { domain, totalSites: settings.blockedSites.length },
      `Removed ${domain} from blocklist`
    );
  } catch (error) {
    console.error('Error removing site:', error);
    return serverError('Failed to remove site from blocklist');
  }
}
