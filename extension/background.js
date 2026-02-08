// ZenFlow Extension Background Service Worker
// Handles blocking logic and sync

const APP_URL = 'http://localhost:3000';

// Default blocked sites (can be synced from app)
const DEFAULT_BLOCKED_SITES = [
  'youtube.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'reddit.com',
  'netflix.com',
];

// State
let focusState = {
  isActive: false,
  startedAt: null,
  totalDuration: 25 * 60,
  blockedSites: DEFAULT_BLOCKED_SITES,
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('ZenFlow Focus Guard installed');
  
  // Set default blocked sites
  await chrome.storage.local.set({ blockedSites: DEFAULT_BLOCKED_SITES });
  
  // Initialize empty rules
  await updateBlockingRules([]);
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startFocus':
      startFocusMode();
      break;
    case 'stopFocus':
      stopFocusMode();
      break;
    case 'getState':
      sendResponse(focusState);
      break;
    case 'updateSites':
      updateBlockedSites(message.sites);
      break;
  }
  return true;
});

// Start focus mode - enable blocking
async function startFocusMode() {
  focusState.isActive = true;
  focusState.startedAt = Date.now();
  
  // Get blocked sites from storage
  const result = await chrome.storage.local.get(['blockedSites']);
  const sites = result.blockedSites || DEFAULT_BLOCKED_SITES;
  
  // Update blocking rules
  await updateBlockingRules(sites);
  
  // Set alarm for session end
  chrome.alarms.create('focusEnd', {
    delayInMinutes: focusState.totalDuration / 60
  });
  
  console.log('Focus mode started, blocking:', sites);
}

// Stop focus mode - disable blocking
async function stopFocusMode() {
  focusState.isActive = false;
  focusState.startedAt = null;
  
  // Remove all blocking rules
  await updateBlockingRules([]);
  
  // Clear alarm
  chrome.alarms.clear('focusEnd');
  
  console.log('Focus mode stopped');
}

// Update declarativeNetRequest rules
async function updateBlockingRules(sites) {
  // Remove existing rules
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingIds = existingRules.map(rule => rule.id);
  
  if (existingIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingIds
    });
  }
  
  // If no sites or not active, just clear
  if (!sites || sites.length === 0 || !focusState.isActive) {
    return;
  }
  
  // Create new redirect rules
  const rules = sites.map((site, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        extensionPath: `/blocked.html?site=${encodeURIComponent(site)}`
      }
    },
    condition: {
      urlFilter: `*://*.${site}/*`,
      resourceTypes: ['main_frame']
    }
  }));
  
  // Add rules for non-www versions too
  const wwwRules = sites.map((site, index) => ({
    id: sites.length + index + 1,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        extensionPath: `/blocked.html?site=${encodeURIComponent(site)}`
      }
    },
    condition: {
      urlFilter: `*://${site}/*`,
      resourceTypes: ['main_frame']
    }
  }));
  
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [...rules, ...wwwRules]
  });
}

// Update blocked sites
async function updateBlockedSites(sites) {
  await chrome.storage.local.set({ blockedSites: sites });
  focusState.blockedSites = sites;
  
  if (focusState.isActive) {
    await updateBlockingRules(sites);
  }
  
  // Notify popup
  chrome.runtime.sendMessage({ action: 'sitesUpdate', sites });
}

// Handle alarm (session end)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'focusEnd') {
    await stopFocusMode();
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      // iconUrl: 'icons/icon128.png', // Commented out until icons are provided
      title: 'Focus Session Complete! 🎉',
      message: 'Great work! Time for a well-deserved break.',
      priority: 2
    });
  }
});

// Listen for storage changes (sync from web app)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.blockedSites) {
    focusState.blockedSites = changes.blockedSites.newValue;
    
    if (focusState.isActive) {
      updateBlockingRules(changes.blockedSites.newValue);
    }
  }
  
  if (namespace === 'local' && changes.focusState) {
    const newState = changes.focusState.newValue;
    focusState = { ...focusState, ...newState };
    
    if (newState.isActive && !focusState.isActive) {
      startFocusMode();
    } else if (!newState.isActive && focusState.isActive) {
      stopFocusMode();
    }
  }
});

// Keep service worker alive during focus session
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['focusState']);
  if (result.focusState?.isActive) {
    focusState = result.focusState;
    await startFocusMode();
  }
});
