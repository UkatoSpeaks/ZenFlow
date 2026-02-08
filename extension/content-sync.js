// Content Script to sync ZenFlow web app state with the extension
// Runs on http://localhost:3000/*

console.log('ZenFlow Sync Active 🌿');

// Function to sync state to chrome storage
function syncToExtension(data) {
  if (data.blockedSites) {
    chrome.storage.local.set({ blockedSites: data.blockedSites });
  }
  if (data.focusState) {
    chrome.storage.local.set({ focusState: data.focusState });
  }
}

// Listen for custom events from the web app
window.addEventListener('zenflow-sync', (event) => {
  if (event.detail) {
    console.log('Syncing from ZenFlow web app...', event.detail);
    syncToExtension(event.detail);
  }
});

// Initial check for localStorage fallback
function checkInitialState() {
  try {
    const sites = localStorage.getItem('zenflow_blocked_sites');
    if (sites) {
      chrome.storage.local.set({ blockedSites: JSON.parse(sites) });
    }
  } catch (e) {
    // Ignore if not accessible
  }
}

checkInitialState();
