// ZenFlow - Blocked Page Logic

const QUOTES = [
    { text: "Your focus is your superpower. Don't let it be stolen.", author: "ZenFlow" },
    { text: "Deciding what not to do is as important as deciding what to do.", author: "Steve Jobs" },
    { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
    { text: "Focusing is about saying no.", author: "Steve Jobs" },
    { text: "Deep work is the bridge between goal setting and goal achievement.", author: "ZenFlow" }
];

document.addEventListener('DOMContentLoaded', () => {
    console.log('ZenFlow: Blocked page script loaded');

    // Random quote fallback
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const quoteEl = document.getElementById('quoteText');
    const authorEl = document.getElementById('quoteAuthor');
    if (quoteEl) quoteEl.textContent = `"${randomQuote.text}"`;
    if (authorEl) authorEl.textContent = `— ${randomQuote.author}`;

    // Site name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const encodedSite = urlParams.get('site');
    const siteNameEl = document.getElementById('siteName');
    const site = encodedSite ? decodeURIComponent(encodedSite) : null;
    
    if (site && siteNameEl) {
        console.log('ZenFlow: Blocking site:', site);
        siteNameEl.textContent = site;
    }

    const progressCircle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 45;
    if (progressCircle) {
        progressCircle.style.strokeDasharray = circumference;
    }

    function setProgress(percent) {
        if (!progressCircle) return;
        const offset = circumference - (percent / 100 * circumference);
        progressCircle.style.strokeDashoffset = offset;
    }

    // Actions
    const backBtn = document.getElementById('goBack');
    if (backBtn) {
        backBtn.onclick = () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.close();
            }
        };
    }

    const endBtn = document.getElementById('endSession');
    if (endBtn) {
        endBtn.onclick = () => {
            if (confirm('Take a deep breath. Are you sure you want to end your focus session early?')) {
                chrome.runtime.sendMessage({ action: 'stopFocus' }, () => {
                    const redirectUrl = site ? `https://${site}` : 'https://google.com';
                    window.location.href = redirectUrl;
                });
            }
        };
    }

    function updateTimer() {
        chrome.storage.local.get(['focusState'], (result) => {
            const state = result.focusState;
            const timerEl = document.getElementById('timer');
            if (!timerEl) return;
            
            if (state && state.isActive) {
                let remaining = 0;
                
                // 1. Try calculation from startedAt (local extension start)
                if (state.startedAt) {
                    const now = Date.now();
                    const elapsed = Math.floor((now - state.startedAt) / 1000);
                    remaining = Math.max(0, (state.totalDuration || 25 * 60) - elapsed);
                } 
                // 2. Fallback to timeRemaining (synced from web app)
                else if (state.timeRemaining !== undefined) {
                    remaining = state.timeRemaining;
                } 
                
                const mins = Math.floor(remaining / 60);
                const secs = remaining % 60;
                timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                
                const total = state.totalDuration || 25 * 60;
                const progressPercent = (remaining / total) * 100;
                setProgress(progressPercent);

                if (remaining <= 0) {
                    const redirectUrl = site ? `https://${site}` : null;
                    if (redirectUrl) window.location.href = redirectUrl;
                }
            } else {
                // If session ended, redirect back to the site
                console.log('ZenFlow: Focus session not active, redirecting...');
                const redirectUrl = site ? `https://${site}` : null;
                if (redirectUrl) window.location.href = redirectUrl;
            }
        });
    }

    setInterval(updateTimer, 1000);
    updateTimer();
});
