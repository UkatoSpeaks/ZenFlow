/**
 * ZenFlow Application Constants
 * Centralized configuration values
 */

// Timer presets (in minutes)
export const TIMER_PRESETS = {
  SHORT: 25,
  MEDIUM: 50,
  LONG: 90,
} as const;

// Default timer duration (in minutes)
export const DEFAULT_TIMER_DURATION = TIMER_PRESETS.SHORT;

// Break durations (in minutes)
export const BREAK_DURATIONS = {
  SHORT: 5,
  LONG: 15,
} as const;

// Session tags for categorizing focus time
export const SESSION_TAGS = [
  { id: "coding", label: "Coding", icon: "Code", color: "#10B981" },
  { id: "studying", label: "Studying", icon: "BookOpen", color: "#3B82F6" },
  { id: "reading", label: "Reading", icon: "Book", color: "#8B5CF6" },
  { id: "writing", label: "Writing", icon: "PenLine", color: "#F59E0B" },
  { id: "designing", label: "Designing", icon: "Palette", color: "#EC4899" },
  { id: "meeting", label: "Meeting", icon: "Users", color: "#06B6D4" },
  { id: "planning", label: "Planning", icon: "Target", color: "#EF4444" },
  { id: "other", label: "Other", icon: "Folder", color: "#64748B" },
] as const;

// Default blocked sites
export const DEFAULT_BLOCKED_SITES = [
  "youtube.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "instagram.com",
  "reddit.com",
  "tiktok.com",
  "netflix.com",
  "discord.com",
];

// Break reminders
export const BREAK_REMINDERS = {
  STRETCH: {
    id: "stretch",
    label: "Time to stretch!",
    description: "Stand up and stretch your body for 30 seconds.",
    icon: "PersonStanding",
  },
  HYDRATE: {
    id: "hydrate",
    label: "Stay hydrated!",
    description: "Take a moment to drink some water.",
    icon: "Droplet",
  },
  EYES: {
    id: "eyes",
    label: "Rest your eyes",
    description: "Look at something 20 feet away for 20 seconds.",
    icon: "Eye",
  },
  BREATHE: {
    id: "breathe",
    label: "Take a breath",
    description: "Deep breathing: 4 seconds in, 4 seconds hold, 4 seconds out.",
    icon: "Wind",
  },
} as const;

// Goal defaults
export const GOAL_DEFAULTS = {
  DAILY_MINUTES: 120, // 2 hours
  WEEKLY_MINUTES: 600, // 10 hours
} as const;

// Navigation links
export const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/focus", label: "Focus", icon: "Timer" },
  { href: "/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/settings", label: "Settings", icon: "Settings" },
] as const;

// Landing page navigation
export const LANDING_NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#pricing", label: "Pricing" },
] as const;

// Sound notification types
export const SOUNDS = {
  TIMER_END: "/sounds/timer-end.wav",
  BREAK_START: "/sounds/break-start.wav",
  NOTIFICATION: "/sounds/notification.wav",
} as const;

// Animation variants for Framer Motion
export const ANIMATION_VARIANTS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  slideInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  stagger: {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
} as const;

// Transition presets
export const TRANSITIONS = {
  smooth: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  bounce: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  slow: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
} as const;
