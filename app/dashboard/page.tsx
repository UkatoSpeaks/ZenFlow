"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Clock,
  Flame,
  Calendar,
  ShieldOff,
  ChevronDown,
  Leaf,
  CloudRain,
  ListTodo,
  Shield,
  Trophy,
  Zap,
  Target,
  Coffee,
  TrendingUp,
  Volume2,
  VolumeX,
  Bell,
  X,
  Check,
  Plus,
  ExternalLink,
  LogOut,
  BarChart3,
  Shield as ShieldIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";


// Timer presets in minutes
const PRESETS = [
  { label: "25", value: 25, name: "Pomodoro" },
  { label: "50", value: 50, name: "Deep Work" },
  { label: "90", value: 90, name: "Flow State" },
];

// Session types
const SESSION_TYPES = [
  { id: "focus", label: "Focus Session", icon: Target, color: "from-zen-primary to-emerald-400" },
  { id: "deep", label: "Deep Work", icon: Zap, color: "from-violet-500 to-purple-500" },
  { id: "study", label: "Study", icon: Coffee, color: "from-amber-500 to-orange-500" },
];

// Notification data
const NOTIFICATIONS = [
  { id: 1, title: "Focus streak extended!", message: "You're on a 6-day streak. Keep it up!", time: "2m ago", read: false },
  { id: 2, title: "Weekly goal achieved", message: "You completed 20+ hours of focus time", time: "1h ago", read: false },
  { id: 3, title: "New achievement unlocked", message: "Deep Work Master - 10 sessions completed", time: "3h ago", read: true },
];

// Blocked sites data
const BLOCKED_SITES = [
  { name: "twitter.com", blocked: true },
  { name: "youtube.com", blocked: true },
  { name: "reddit.com", blocked: true },
  { name: "instagram.com", blocked: false },
  { name: "tiktok.com", blocked: true },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [sessionType, setSessionType] = useState(SESSION_TYPES[0]);
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio ref for rain sounds
  const rainAudioRef = useRef<HTMLAudioElement | null>(null);

  // UI state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showBlockSites, setShowBlockSites] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rainPlaying, setRainPlaying] = useState(false);
  const [rainVolume, setRainVolume] = useState(0.5);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [blockedSites, setBlockedSites] = useState(BLOCKED_SITES);
  const [newTask, setNewTask] = useState("");
  const [audioLoading, setAudioLoading] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, text: "Complete project proposal", done: false },
    { id: 2, text: "Review code changes", done: true },
    { id: 3, text: "Prepare presentation", done: false },
  ]);

  // Rain sound URLs (multiple fallbacks - using reliable CDN sources)
  const RAIN_SOUNDS = [
    "https://cdn.freesound.org/previews/531/531947_6142149-lq.mp3",
    "https://cdn.freesound.org/previews/346/346642_4939433-lq.mp3", 
    "https://upload.wikimedia.org/wikipedia/commons/4/4e/Rain_on_a_window.ogg",
  ];

  // Initialize audio on first play (better for browser autoplay policies)
  const initAndPlayRain = async () => {
    if (!rainAudioRef.current) {
      setAudioLoading(true);
      const audio = new Audio();
      audio.loop = true;
      audio.volume = rainVolume;
      
      // Try each URL until one works
      for (const url of RAIN_SOUNDS) {
        try {
          audio.src = url;
          await audio.play();
          rainAudioRef.current = audio;
          setRainPlaying(true);
          setAudioLoading(false);
          return;
        } catch {
          console.log(`Failed to load: ${url}, trying next...`);
        }
      }
      
      // If all URLs fail, show error
      setAudioLoading(false);
      alert("Could not load rain sounds. Please check your internet connection.");
      return;
    }
    
    // Audio already loaded, just play/pause
    if (rainPlaying) {
      rainAudioRef.current.pause();
      setRainPlaying(false);
    } else {
      try {
        await rainAudioRef.current.play();
        setRainPlaying(true);
      } catch (err) {
        console.error("Playback failed:", err);
      }
    }
  };

  // Update volume when changed
  useEffect(() => {
    if (rainAudioRef.current) {
      rainAudioRef.current.volume = rainVolume;
    }
  }, [rainVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rainAudioRef.current) {
        rainAudioRef.current.pause();
        rainAudioRef.current = null;
      }
    };
  }, []);

  // Toggle rain sounds
  const toggleRainSounds = () => {
    initAndPlayRain();
  };

  // Stats
  const [stats, setStats] = useState({
    todayFocus: "2h 40m",
    streak: 5,
    sessionsToday: 4,
    blocksToday: 23,
  });

  const recentSessions = [
    { name: "Coding", duration: "50m", time: "2:30 PM", color: "from-blue-500 to-indigo-500", icon: "💻" },
    { name: "Study", duration: "25m", time: "1:00 PM", color: "from-violet-500 to-purple-500", icon: "📚" },
    { name: "Reading", duration: "30m", time: "11:30 AM", color: "from-emerald-500 to-teal-500", icon: "📖" },
    { name: "Deep Work", duration: "90m", time: "9:00 AM", color: "from-amber-500 to-orange-500", icon: "⚡" },
    { name: "Planning", duration: "15m", time: "8:30 AM", color: "from-rose-500 to-pink-500", icon: "📋" },
  ];

  const weeklyData = [
    { day: "Mon", hours: 3.5, percent: 70 },
    { day: "Tue", hours: 4.2, percent: 84 },
    { day: "Wed", hours: 2.8, percent: 56 },
    { day: "Thu", hours: 5.1, percent: 100 },
    { day: "Fri", hours: 3.9, percent: 78 },
    { day: "Sat", hours: 2.1, percent: 42 },
    { day: "Sun", hours: 2.6, percent: 52 },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Update stats when session completes
      setStats(prev => ({
        ...prev,
        sessionsToday: prev.sessionsToday + 1,
      }));
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handlePresetChange = (index: number) => {
    setSelectedPreset(index);
    const newMinutes = PRESETS[index].value;
    setTimerMinutes(newMinutes);
    setTimeLeft(newMinutes * 60);
    setIsRunning(false);
  };

  const handleReset = () => {
    setTimeLeft(timerMinutes * 60);
    setIsRunning(false);
  };

  const handleStartFocus = () => {
    setIsRunning(!isRunning);
  };

  const markNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const toggleSiteBlock = (name: string) => {
    setBlockedSites(prev => prev.map(s => s.name === name ? { ...s, blocked: !s.blocked } : s));
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks(prev => [...prev, { id: Date.now(), text: newTask, done: false }]);
      setNewTask("");
    }
  };

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const progress = ((timerMinutes * 60 - timeLeft) / (timerMinutes * 60)) * 100;
  const circumference = 2 * Math.PI * 120;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-zen-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-zen-primary/50 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-zen-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-zen-primary/30">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">ZenFlow</span>
            </Link>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
                  className="relative p-2.5 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 hover:text-gray-900 transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => markNotificationRead(notif.id)}
                            className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-zen-primary/5' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              {!notif.read && <div className="w-2 h-2 rounded-full bg-zen-primary mt-2" />}
                              <div className={!notif.read ? '' : 'ml-5'}>
                                <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                                <p className="text-gray-500 text-sm">{notif.message}</p>
                                <p className="text-gray-400 text-xs mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Settings */}
              <div className="relative">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); }}
                  className="p-2.5 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 hover:text-gray-900 transition-all"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Quick Settings</h3>
                      </div>
                      <div className="p-2">
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <span className="text-gray-700">Sound Effects</span>
                          <div 
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`w-10 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-zen-primary' : 'bg-gray-200'}`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform mt-0.5 ${soundEnabled ? 'translate-x-4.5 ml-0.5' : 'ml-0.5'}`} />
                          </div>
                        </button>
                        <Link href="/settings" onClick={() => setShowSettings(false)}>
                          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
                            <span>Profile</span>
                            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                          </button>
                        </Link>
                        <Link href="/settings" onClick={() => setShowSettings(false)}>
                          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
                            <span>All Settings</span>
                            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                          </button>
                        </Link>
                        <div className="h-px bg-gray-100 my-1" />
                        <Link href="/analytics" onClick={() => setShowSettings(false)}>
                          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
                            <BarChart3 className="w-4 h-4 text-gray-400" />
                            <span>Analytics</span>
                          </button>
                        </Link>
                        <Link href="/blocker" onClick={() => setShowSettings(false)}>
                          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span>Site Blocker</span>
                          </button>
                        </Link>
                        <div className="h-px bg-gray-100 my-1" />
                        <button 
                          onClick={async () => { 
                            setShowSettings(false);
                            await logout(); 
                            router.push('/'); 
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-red-500"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Avatar */}
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "Profile"} 
                  className="w-10 h-10 rounded-xl shadow-lg cursor-pointer"
                />
              ) : (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/30 cursor-pointer"
                >
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "A"}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {getGreeting()}, {user?.displayName?.split(' ')[0] || 'there'}
            </h1>
            <motion.span 
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              className="text-3xl"
            >
              👋
            </motion.span>
          </div>
          <p className="text-gray-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate()}
          </p>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={Clock}
            label="Today's Focus"
            value={stats.todayFocus}
            color="from-zen-primary to-emerald-400"
            trend="+12%"
            delay={0}
          />
          <StatCard
            icon={Flame}
            label="Streak"
            value={`${stats.streak} days`}
            color="from-orange-500 to-amber-400"
            badge="🔥"
            delay={0.1}
          />
          <StatCard
            icon={Calendar}
            label="Sessions"
            value={`${stats.sessionsToday} today`}
            color="from-violet-500 to-purple-400"
            delay={0.2}
          />
          <StatCard
            icon={ShieldOff}
            label="Blocked"
            value={`${stats.blocksToday} sites`}
            color="from-rose-500 to-pink-400"
            delay={0.3}
          />
        </motion.div>

        {/* Main Timer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl shadow-black/[0.03] border border-white/50 mb-8 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-zen-primary/5 via-transparent to-violet-500/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-zen-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative max-w-xl mx-auto text-center">
            {/* Session Type Selector */}
            <div className="relative inline-block mb-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSessionDropdown(!showSessionDropdown)}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r ${sessionType.color} text-white shadow-lg hover:shadow-xl transition-all text-sm font-semibold`}
              >
                <sessionType.icon className="w-4 h-4" />
                <span>{sessionType.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSessionDropdown ? 'rotate-180' : ''}`} />
              </motion.button>
              
              <AnimatePresence>
                {showSessionDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-10"
                  >
                    {SESSION_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => {
                          if (type.id === "deep") {
                            // Navigate to Deep Work focus page
                            router.push("/focus");
                          } else {
                            setSessionType(type);
                            setShowSessionDropdown(false);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                          sessionType.id === type.id ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                          <type.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className={`text-gray-900 ${sessionType.id === type.id ? 'font-semibold' : ''}`}>
                          {type.label}
                        </span>
                        {type.id === "deep" && (
                          <span className="ml-auto text-xs text-violet-500 font-medium">Zen Mode →</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Timer Display */}
            <div className="relative mb-10">
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 mx-auto">
                {isRunning && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${sessionType.color} rounded-full blur-2xl opacity-20 animate-pulse`} />
                )}
                
                <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
                  <circle
                    cx="140"
                    cy="140"
                    r="120"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="12"
                  />
                  <circle
                    cx="140"
                    cy="140"
                    r="120"
                    fill="none"
                    stroke="url(#timerGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress / 100)}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span 
                    key={timeLeft}
                    initial={{ scale: 1.05, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl sm:text-7xl font-bold text-gray-900 tracking-tight font-mono"
                  >
                    {formatTime(timeLeft)}
                  </motion.span>
                  <span className={`text-sm font-medium mt-2 px-3 py-1 rounded-full ${isRunning ? 'bg-zen-primary/10 text-zen-primary' : 'bg-gray-100 text-gray-500'}`}>
                    {isRunning ? "✨ Focus time" : "Ready to focus"}
                  </span>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center justify-center gap-3 mb-10">
              {PRESETS.map((preset, index) => (
                <motion.button
                  key={preset.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePresetChange(index)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    selectedPreset === index
                      ? "bg-gradient-to-r from-zen-primary to-emerald-400 text-white shadow-lg shadow-zen-primary/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {preset.label}m
                </motion.button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleReset}
                className="p-4 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartFocus}
                className={`flex items-center gap-3 px-10 py-5 bg-gradient-to-r ${sessionType.color} text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-xl transition-all`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-6 h-6" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    <span>Start Focus</span>
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-4 rounded-2xl transition-all ${soundEnabled ? 'bg-zen-primary/10 text-zen-primary' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Session History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-black/[0.02] border border-white/50"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Recent Sessions</h3>
                <button className="text-sm text-zen-primary font-medium hover:underline">View all</button>
              </div>
              <div className="space-y-2">
                {recentSessions.map((session, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.02)' }}
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${session.color} flex items-center justify-center text-lg shadow-lg`}>
                        {session.icon}
                      </div>
                      <div>
                        <span className="text-gray-900 font-medium block">{session.name}</span>
                        <span className="text-xs text-gray-500">{session.time}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{session.duration}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Streak Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 shadow-xl shadow-orange-500/20 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center"
                    >
                      <Flame className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-white text-xl">6 Day Streak!</h3>
                      <p className="text-white/80 text-sm">You&apos;re on fire 🔥</p>
                    </div>
                  </div>
                  <Trophy className="w-10 h-10 text-white/30" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/80">Today&apos;s Goal</span>
                    <span className="font-bold text-white">80%</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "80%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Weekly Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-black/[0.02] border border-white/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">This Week</h3>
                <div className="flex items-center gap-2 text-sm text-zen-primary font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>+18% vs last week</span>
                </div>
              </div>
              <div className="flex items-end justify-between gap-3 h-36 mb-4">
                {weeklyData.map((day, index) => {
                  const isToday = index === 4;
                  return (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${day.percent}%` }}
                        transition={{ duration: 0.6, delay: 0.1 * index, ease: "easeOut" }}
                        className={`w-full rounded-xl cursor-pointer transition-all hover:opacity-80 ${
                          isToday
                            ? "bg-gradient-to-t from-zen-primary to-emerald-400 shadow-lg shadow-zen-primary/30"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      />
                      <span className={`text-xs font-medium ${isToday ? 'text-zen-primary' : 'text-gray-500'}`}>{day.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-gray-500 text-sm">Total this week</span>
                <span className="font-bold text-gray-900 text-lg">24.2 hours</span>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-black/[0.02] border border-white/50"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartFocus}
                  className="flex items-center gap-3 p-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-zen-primary to-emerald-400 text-white shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Focus</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddTask(true)}
                  className="flex items-center gap-3 p-4 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <ListTodo className="w-5 h-5" />
                  <span>Add Task</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/blocker')}
                  className="flex items-center gap-3 p-4 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Shield className="w-5 h-5" />
                  <span>Block Sites</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/analytics')}
                  className="flex items-center gap-3 p-4 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Analytics</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleRainSounds}
                  className={`flex items-center gap-3 p-4 rounded-xl text-sm font-semibold transition-all ${rainPlaying ? 'bg-blue-500 text-white' : audioLoading ? 'bg-blue-300 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  disabled={audioLoading}
                >
                  <CloudRain className={`w-5 h-5 ${audioLoading ? 'animate-pulse' : ''}`} />
                  <span>{audioLoading ? 'Loading...' : rainPlaying ? 'Stop Rain' : 'Rain Sounds'}</span>
                </motion.button>
              </div>

              {/* Volume slider when rain is playing */}
              <AnimatePresence>
                {rainPlaying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <CloudRain className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 min-w-[60px]">Volume</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={rainVolume}
                        onChange={(e) => setRainVolume(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <span className="text-sm text-gray-500 min-w-[40px] text-right">{Math.round(rainVolume * 100)}%</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddTask(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
                <button onClick={() => setShowAddTask(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  placeholder="Add a new task..."
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zen-primary/20"
                />
                <button
                  onClick={addTask}
                  className="p-3 bg-zen-primary text-white rounded-xl hover:bg-zen-primary/90"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${task.done ? 'bg-gray-50' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.done ? 'bg-zen-primary border-zen-primary' : 'border-gray-300'}`}>
                      {task.done && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`flex-1 ${task.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block Sites Modal */}
      <AnimatePresence>
        {showBlockSites && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBlockSites(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Block Sites</h2>
                <button onClick={() => setShowBlockSites(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                {blockedSites.map((site) => (
                  <div
                    key={site.name}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">{site.name}</span>
                    </div>
                    <button
                      onClick={() => toggleSiteBlock(site.name)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        site.blocked
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {site.blocked ? 'Blocked' : 'Allowed'}
                    </button>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 p-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-600 transition-colors">
                + Add new site
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
  badge,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  trend?: string;
  badge?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl shadow-black/[0.02] border border-white/50 cursor-pointer group overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity`} />
      
      <div className="relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-gray-900">{value}</p>
            {badge && <span className="text-lg">{badge}</span>}
            {trend && (
              <span className="text-xs font-semibold text-zen-primary bg-zen-primary/10 px-2 py-0.5 rounded-full">
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
