// Health Check API
// GET: Check API status

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      sessions: {
        'GET /api/sessions': 'List user sessions',
        'POST /api/sessions': 'Create a new session',
        'GET /api/sessions/:id': 'Get a specific session',
        'PUT /api/sessions/:id': 'Update a session',
        'DELETE /api/sessions/:id': 'Delete a session',
      },
      analytics: {
        'GET /api/analytics': 'Get analytics data with period filter',
      },
      settings: {
        'GET /api/settings': 'Get user settings',
        'PUT /api/settings': 'Update user settings',
        'DELETE /api/settings': 'Reset settings to defaults',
      },
      blocker: {
        'GET /api/blocker': 'Get blocker settings',
        'PUT /api/blocker': 'Update blocker settings',
        'POST /api/blocker/sites/:domain': 'Add a site to blocklist',
        'PUT /api/blocker/sites/:domain': 'Toggle site enabled status',
        'DELETE /api/blocker/sites/:domain': 'Remove site from blocklist',
        'POST /api/blocker/bulk': 'Add preset or multiple sites',
        'DELETE /api/blocker/bulk': 'Clear all sites',
      },
      user: {
        'GET /api/user': 'Get user profile',
        'PUT /api/user': 'Update user profile',
        'DELETE /api/user': 'Delete user account and all data',
        'GET /api/user/streak': 'Get streak information',
        'POST /api/user/streak': 'Record activity',
        'GET /api/user/export': 'Export all user data',
      },
      health: {
        'GET /api/health': 'API health check',
      },
    },
  });
}
