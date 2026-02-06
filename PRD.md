# 🌿 ZenFlow – Digital Detox & Focus Tracker
(A calm productivity app for deep work)

---

# 1. Product Overview

ZenFlow is a modern web-based productivity application that helps remote workers, students, and developers reduce distractions, enter deep work sessions, and maintain healthy focus habits.

The app blocks distracting websites, tracks focused time, provides analytics, and suggests micro-breaks to prevent burnout.

The product emphasizes:
- calm design
- minimal interface
- wellness-first experience
- distraction-free workflow

Theme: Mint / soft green (nature-inspired, relaxing UI)

---

# 2. Goals

## Primary Goals
- Help users focus deeply
- Reduce digital distractions
- Track productive hours
- Encourage healthy work habits

## Secondary Goals
- Build daily focus streaks
- Provide actionable insights
- Create a premium SaaS product
- Support cross-device usage

---

# 3. Target Users

## Personas

### Remote Worker
Needs structured focus time and fewer distractions.

### Student
Wants Pomodoro + study tracking.

### Developer / Creator
Needs long deep-work sessions and site blocking.

---

# 4. Core Features (MVP)

## 4.1 Focus Timer
- Start / Pause / Resume timer
- Presets: 25m, 50m, 90m
- Custom duration
- Sound notification
- Auto break suggestion

---

## 4.2 Deep Work Session Tracking
- Log session duration
- Tag sessions (Study, Coding, Reading, etc.)
- Daily/weekly/monthly totals
- Session history

---

## 4.3 Distraction Blocker (Chrome Extension)
- Block selected websites
- Block only during focus session
- Whitelist sites
- Warning popup when trying to open blocked site

---

## 4.4 Dashboard
- Total focus time today
- Weekly chart
- Session history list
- Streak counter
- Quick start focus button

---

## 4.5 Micro-Break Reminders
- Stretch reminder
- Hydration reminder
- Eye rest reminder
- Breathing exercise

---

# 5. Phase 2 Features

- Task manager integration
- Streak system with XP
- Ambient sounds (rain, white noise)
- Goals & targets
- Achievements/badges
- Dark mode
- Cloud sync

---

# 6. Future / Premium Features

- Desktop app (Electron)
- System-level app blocking
- AI focus coach suggestions
- Team focus rooms
- Mobile app
- Subscription plans

---

# 7. Design Requirements

## Theme
Calm, minimal, mint green wellness aesthetic.

## Color Palette
Primary: #10B981
Primary Dark: #059669
Background: #F6FFF9
Card: #FFFFFF
Border: #E5E7EB
Text: #0F172A

## Style Rules
- large whitespace
- soft shadows only
- rounded corners (16–24px)
- minimal borders
- pastel colors
- clean typography
- no visual noise

---

# 8. Pages & Layout

## Landing Page
- Hero section
- Features grid
- How it works
- Testimonials
- Pricing
- CTA buttons

## Dashboard
- Focus stats
- Timer card
- Charts
- History
- Streaks

## Focus Mode
- Fullscreen minimal timer
- Quote or breathing animation
- No navigation

## Analytics
- Weekly/monthly charts
- Heatmap
- Trends

## Settings
- Blocked websites
- Timer settings
- Break settings
- Sound options
- Theme toggle

---

# 9. Tech Stack

## Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Framer Motion
- shadcn/ui

## Backend (BaaS)
- Firebase

## Firebase Services Used
- Firebase Authentication
- Firestore (Database)
- Firebase Hosting (optional)
- Firebase Cloud Functions (future)
- Firebase Analytics (optional)

## Charts
- Recharts

## State Management
- Zustand

## Extension
- Chrome Extension (Manifest v3)

## Deployment
- Vercel (frontend)
- Firebase (auth + db)

---

# 10. Database Schema (Firestore Structure)

Firestore (NoSQL, document-based)

---

## users (collection)
Document ID = userId

Fields:
- name
- email
- photoURL
- createdAt
- dailyGoal
- weeklyGoal
- settings

---

## sessions (collection)
Each document = 1 focus session

Fields:
- userId (reference)
- startTime
- endTime
- duration
- tag
- createdAt

---

## blockedSites (collection)
Document per user

Fields:
- userId
- domains: [ "youtube.com", "instagram.com" ]

---

## streaks (collection)
Document per user

Fields:
- userId
- currentStreak
- longestStreak
- lastActiveDate

---

## goals (collection)
Fields:
- userId
- dailyTargetMinutes
- weeklyTargetMinutes

---

## tasks (optional future)
Fields:
- userId
- title
- completed
- createdAt

---

# 11. Authentication Flow

Using Firebase Auth:
- Google login
- Email/password login
- Persistent sessions
- Auto user creation

Flow:
Login → Firebase Auth → store user in Firestore → dashboard

---

# 12. Success Metrics

- Daily active users
- Avg focus time per day
- Weekly retention
- Streak completion rate
- Blocked distraction attempts

---

# 13. Non-Goals (MVP)

Not included initially:
- Mobile app
- Team collaboration
- Payments
- AI coaching
- Desktop app

---

# 14. Timeline

Phase 1 (2–3 weeks)
- Timer
- Tracking
- Dashboard
- Chrome blocker
- Firebase auth + Firestore

Phase 2 (2–3 weeks)
- Tasks
- Streaks
- Sounds
- Goals

Phase 3
- Desktop app
- AI features
- Monetization

---

# 15. Brand

Name: ZenFlow (working title)
Tone: Calm, mindful, friendly
Tagline: “Focus deeply. Work calmly.”
