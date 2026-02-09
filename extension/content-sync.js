// Content Script to sync ZenFlow web app state with the extension
// Runs on http://localhost:3000/*

console.log('ZenFlow Sync Active 🌿');

// Function to sync state to chrome storage
function syncToExtension(data) {
  if (data.blockedSites && Array.isArray(data.blockedSites)) {
    // Ensure we only store strings (domains)
    const siteStrings = data.blockedSites.map(s => typeof s === 'string' ? s : (s.domain || '')).filter(Boolean);
    chrome.storage.local.set({ blockedSites: siteStrings });
  }
  if (data.focusState) {
    chrome.storage.local.set({ focusState: data.focusState });
  }
}

// Listen for custom events from the web app
window.addEventListener('zenflow-sync', (event) => {
  if (event.detail) {
    syncToExtension(event.detail);
  }
});

// Initial check for localStorage fallback
function checkInitialState() {
  try {
    const sitesRaw = localStorage.getItem('zenflow_blocked_sites');
    if (sitesRaw) {
      const parsed = JSON.parse(sitesRaw);
      if (Array.isArray(parsed)) {
        const siteStrings = parsed.map(s => typeof s === 'string' ? s : (s.domain || '')).filter(Boolean);
        chrome.storage.local.set({ blockedSites: siteStrings });
      }
    }
  } catch (e) {
    console.error('ZenFlow context sync failed:', e);
  }
}

checkInitialState();
