// ZenFlow Extension Background Service Worker
// Handles blocking logic and sync (Stateless Implementation)

const APP_URL = 'http://localhost:3000';

// Default blocked sites
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

// Helper to get current state from storage
async function getExtensionState() {
  const result = await chrome.storage.local.get(['focusState', 'blockedSites']);
  return {
    isActive: result.focusState?.isActive || false,
    startedAt: result.focusState?.startedAt || null,
    totalDuration: result.focusState?.totalDuration || 25 * 60,
    blockedSites: result.blockedSites || DEFAULT_BLOCKED_SITES
  };
}

// Helper to normalize domain from any URL string
function normalizeDomain(input) {
  if (!input) return '';
  
  // Handle if input is an object from the web app
  let domain = typeof input === 'string' ? input : (input.domain || '');
  
  if (!domain || typeof domain !== 'string') return '';
  
  domain = domain.trim().toLowerCase();
  domain = domain.replace(/^(https?:\/\/)/, ''); // Remove protocol
  domain = domain.split('/')[0]; // Remove path
  domain = domain.replace(/^www\./, ''); // Remove www.
  return domain;
}

// Queue for blocking rule updates to prevent race conditions
let isUpdating = false;

// Update declarativeNetRequest rules
async function updateBlockingRules() {
  if (isUpdating) return;
  isUpdating = true;

  try {
    const state = await getExtensionState();
    
    // Get existing dynamic rules to remove them
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingIds = existingRules.map(rule => rule.id);
    
    // Prepare new rules if active
    let rulesToAdd = [];
    if (state.isActive && state.blockedSites && state.blockedSites.length > 0) {
      // Filter out invalid entries and duplicates
      const uniqueSites = [...new Set(state.blockedSites.map(normalizeDomain).filter(Boolean))];
      
      rulesToAdd = uniqueSites.map((site, index) => ({
        id: 2000 + index, // IDs starting from 2000 to avoid any conflict
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { extensionPath: `/blocked.html?site=${encodeURIComponent(site)}` }
        },
        condition: {
          urlFilter: `||${site}^`,
          resourceTypes: ['main_frame', 'sub_frame']
        }
      }));
    }

    // Atomic update
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingIds,
      addRules: rulesToAdd
    });

    console.log(`ZenFlow: ${rulesToAdd.length > 0 ? `Applied ${rulesToAdd.length} rules` : 'Cleared all rules'}`);
  } catch (error) {
    console.error('ZenFlow DNR Update Error:', error);
  } finally {
    setTimeout(() => { isUpdating = false; }, 200);
  }
}

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('ZenFlow: Extension installed/updated - Mode:', details.reason);
  const result = await chrome.storage.local.get(['blockedSites']);
  if (!result.blockedSites) {
    await chrome.storage.local.set({ blockedSites: DEFAULT_BLOCKED_SITES });
  }
  await updateBlockingRules();
});

// Handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startFocus') {
    startFocusMode().then(() => sendResponse({ success: true }));
    return true;
  } else if (message.action === 'stopFocus') {
    stopFocusMode().then(() => sendResponse({ success: true }));
    return true;
  } else if (message.action === 'getState') {
    getExtensionState().then(state => sendResponse(state));
    return true;
  }
});

// Start focus mode
async function startFocusMode() {
  const state = await getExtensionState();
  await chrome.storage.local.set({ 
    focusState: { ...state, isActive: true, startedAt: Date.now() } 
  });
  
  chrome.alarms.create('focusEnd', {
    delayInMinutes: state.totalDuration / 60
  });
}

// Stop focus mode
async function stopFocusMode() {
  const state = await getExtensionState();
  await chrome.storage.local.set({ 
    focusState: { ...state, isActive: false, startedAt: null } 
  });
  
  chrome.alarms.clear('focusEnd');
}

// Alarm logic
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'focusEnd') {
    await stopFocusMode();
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Focus Session Complete! 🎉',
      message: 'Great work! Time for a well-deserved break.'
    });
  }
});

// Storage sync listener
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && (changes.blockedSites || changes.focusState)) {
    updateBlockingRules().catch(console.error);
  }
});
