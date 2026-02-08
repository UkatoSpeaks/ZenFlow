// ZenFlow Extension Popup Script
// Upgraded version with progress ring and better state management

// DOM Elements
const popupContainer = document.getElementById('popupContainer');
const statusDot = document.getElementById('statusDot');
const statusLabel = document.getElementById('statusLabel');
const focusToggle = document.getElementById('focusToggle');
const timerText = document.getElementById('timerText');
const timerRing = document.getElementById('timerRing');
const timerMode = document.getElementById('timerMode');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const blockedCount = document.getElementById('blockedCount');
const blockedInfo = document.getElementById('blockedInfo');
const openDashboard = document.getElementById('openDashboard');
const syncStatus = document.getElementById('syncStatus');

// Ring setup
const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
timerRing.style.strokeDasharray = `${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`;

// App URL
const APP_URL = 'http://localhost:3000';

// State
let state = {
  isActive: false,
  timeRemaining: 25 * 60,
  totalDuration: 25 * 60,
  blockedSites: [],
  startedAt: null,
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadState();
  updateUI();
  
  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.focusState) {
      state = { ...state, ...changes.focusState.newValue };
      updateUI();
    }
  });

  // Tick timer
  setInterval(tick, 1000);
});

async function loadState() {
  const result = await chrome.storage.local.get(['focusState', 'blockedSites']);
  if (result.focusState) {
    state = { ...state, ...result.focusState };
    if (state.isActive && state.startedAt) {
      const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      state.timeRemaining = Math.max(0, state.totalDuration - elapsed);
    }
  }
  if (result.blockedSites) {
    state.blockedSites = result.blockedSites;
  }
}

function updateUI() {
  // Container class
  if (state.isActive) {
    popupContainer.classList.add('focus-active');
    statusDot.classList.add('active');
    statusLabel.textContent = 'Focus Mode: ON';
    startBtn.style.display = 'none';
    stopBtn.style.display = 'flex';
    timerMode.textContent = 'Focusing';
  } else {
    popupContainer.classList.remove('focus-active');
    statusDot.classList.remove('active');
    statusLabel.textContent = 'Focus Mode: OFF';
    startBtn.style.display = 'flex';
    stopBtn.style.display = 'none';
    timerMode.textContent = 'Ready';
  }

  // Toggle state
  focusToggle.checked = state.isActive;
  
  // Timer text
  timerText.textContent = formatTime(state.timeRemaining);
  
  // Progress ring
  updateProgressRing();

  // Blocked sites
  const count = state.blockedSites.length;
  blockedCount.textContent = `Blocking ${count} site${count !== 1 ? 's' : ''}`;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateProgressRing() {
  const progress = state.timeRemaining / state.totalDuration;
  const offset = RING_CIRCUMFERENCE * (1 - progress);
  timerRing.style.strokeDashoffset = isNaN(offset) ? 0 : offset;
}

function tick() {
  if (state.isActive && state.timeRemaining > 0) {
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    state.timeRemaining = Math.max(0, state.totalDuration - elapsed);
    
    timerText.textContent = formatTime(state.timeRemaining);
    updateProgressRing();

    if (state.timeRemaining <= 0) {
      handleComplete();
    }
  }
}

async function handleComplete() {
  state.isActive = false;
  await chrome.storage.local.set({ focusState: state });
  updateUI();
}

// Events
focusToggle.addEventListener('change', async () => {
  if (focusToggle.checked) {
    startSession();
  } else {
    stopSession();
  }
});

startBtn.addEventListener('click', startSession);
stopBtn.addEventListener('click', stopSession);

async function startSession() {
  state.isActive = true;
  state.startedAt = Date.now();
  state.totalDuration = 25 * 60;
  state.timeRemaining = state.totalDuration;
  
  await chrome.storage.local.set({ focusState: state });
  chrome.runtime.sendMessage({ action: 'startFocus' });
  updateUI();
}

async function stopSession() {
  state.isActive = false;
  state.startedAt = null;
  state.timeRemaining = 25 * 60;
  
  await chrome.storage.local.set({ focusState: state });
  chrome.runtime.sendMessage({ action: 'stopFocus' });
  updateUI();
}

blockedInfo.addEventListener('click', () => {
  chrome.tabs.create({ url: `${APP_URL}/blocker` });
});

openDashboard.addEventListener('click', () => {
  chrome.tabs.create({ url: `${APP_URL}/dashboard` });
});
