"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  ChevronDown, 
  Volume2, 
  VolumeX,
  Sparkles,
  Coffee,
  Droplets,
  Wind,
  TreePine,
  Waves,
  Plus,
  Check,
  Moon,
  Sun,
  Keyboard,
} from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/contexts/SettingsContext";

// Session presets
const PRESETS = [
  { label: "25", value: 25, name: "Pomodoro" },
  { label: "50", value: 50, name: "Deep Work" },
  { label: "90", value: 90, name: "Flow State" },
  { label: "120", value: 120, name: "Marathon" },
];

// Ambient sounds - using Web Audio API (no external files needed)
const AMBIENT_SOUNDS = [
  { id: "rain", label: "Rain", icon: Droplets },
  { id: "forest", label: "Forest", icon: TreePine },
  { id: "waves", label: "Waves", icon: Waves },
  { id: "wind", label: "Wind", icon: Wind },
];

// Motivational quotes
const QUOTES = [
  { text: "The mind is everything. What you think, you become.", author: "Buddha" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Deep work is the ability to focus without distraction.", author: "Cal Newport" },
  { text: "Where focus goes, energy flows.", author: "Tony Robbins" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "The successful warrior is the average man with laser focus.", author: "Bruce Lee" },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
];

// Break activities
const BREAK_ACTIVITIES = [
  { emoji: "💧", label: "Hydrate", desc: "Drink some water" },
  { emoji: "🧘", label: "Stretch", desc: "Release tension" },
  { emoji: "👀", label: "Rest Eyes", desc: "Look at something distant" },
  { emoji: "🚶", label: "Walk", desc: "Move your body" },
  { emoji: "🌬️", label: "Breathe", desc: "Take deep breaths" },
];

export default function DeepWorkPage() {
  // Get settings from context
  const { 
    settings, 
    incrementStat, 
    playSound, 
    sendNotification,
    isLoading: settingsLoading 
  } = useSettings();

  // Timer state - use settings defaults
  const [duration, setDuration] = useState(settings.defaultDuration);
  const [timeLeft, setTimeLeft] = useState(settings.defaultDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [breakDuration] = useState(settings.breakDuration);
  const [breakTimeLeft, setBreakTimeLeft] = useState(settings.breakDuration * 60);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Task state
  const [task, setTask] = useState("Deep Work Session");
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const taskInputRef = useRef<HTMLInputElement>(null);

  // Sound state - using Web Audio API
  const [activeSound, setActiveSound] = useState<string | null>(
    settings.defaultAmbientSound !== "off" ? settings.defaultAmbientSound : null
  );
  const [volume, setVolume] = useState(settings.soundVolume);
  const [showSoundPanel, setShowSoundPanel] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // UI state
  const [darkMode, setDarkMode] = useState(settings.darkFocusMode);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  // Format time
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isBreak && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning && !isBreak) {
      setIsRunning(false);
      setSessionComplete(true);
      setSessionsCompleted((prev) => prev + 1);
      
      // Track stats
      incrementStat("sessionCount", 1);
      incrementStat("totalFocusTime", duration);
      
      // Save session to history for analytics
      try {
        const today = new Date().toISOString().split("T")[0];
        const session = {
          id: `${today}-${Date.now()}`,
          date: today,
          duration,
          tag: task,
          timestamp: Date.now(),
        };
        
        // Save to session history
        const savedSessions = localStorage.getItem("zenflow_session_history");
        const sessions = savedSessions ? JSON.parse(savedSessions) : [];
        sessions.unshift(session);
        localStorage.setItem("zenflow_session_history", JSON.stringify(sessions.slice(0, 100)));
        
        // Update daily focus
        const savedDaily = localStorage.getItem("zenflow_daily_focus");
        const dailyFocus = savedDaily ? JSON.parse(savedDaily) : {};
        if (!dailyFocus[today]) {
          dailyFocus[today] = { date: today, minutes: 0, sessions: 0 };
        }
        dailyFocus[today].minutes += duration;
        dailyFocus[today].sessions += 1;
        localStorage.setItem("zenflow_daily_focus", JSON.stringify(dailyFocus));
      } catch (error) {
        console.error("Error saving session:", error);
      }
      
      // Play completion sound
      playSound("timer");
      
      // Send notification
      sendNotification(
        "🎉 Session Complete!",
        `Great job! You focused for ${duration} minutes.`
      );
      
      // Auto-start break if enabled
      if (settings.autoStartBreak) {
        setTimeout(() => {
          setIsBreak(true);
          setIsRunning(true);
        }, 1000);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, isBreak, duration, task, incrementStat, playSound, sendNotification, settings.autoStartBreak]);

  // Break timer logic  
  useEffect(() => {
    if (isBreak && isRunning && breakTimeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setBreakTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (breakTimeLeft === 0 && isBreak) {
      setIsRunning(false);
      setIsBreak(false);
      setSessionComplete(false);
      setTimeLeft(duration * 60);
      setBreakTimeLeft(breakDuration * 60);
      
      // Play break end sound
      playSound("break");
      
      // Send notification
      sendNotification(
        "⏰ Break Over!",
        "Time to get back to focus mode."
      );
      
      // Auto-start next session if enabled
      if (settings.autoStartNextSession) {
        setIsRunning(true);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isBreak, isRunning, breakTimeLeft, duration, breakDuration, playSound, sendNotification, settings.autoStartNextSession]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingTask) return;
      
      switch (e.code) {
        case "Space":
          e.preventDefault();
          toggleTimer();
          break;
        case "KeyR":
          if (!e.metaKey && !e.ctrlKey) resetTimer();
          break;
        case "KeyM":
          toggleSound();
          break;
        case "Escape":
          if (showSoundPanel) setShowSoundPanel(false);
          if (showPresets) setShowPresets(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditingTask, showSoundPanel, showPresets, activeSound]);

  // Handle start/pause
  const toggleTimer = () => {
    if (sessionComplete && !isBreak) {
      // Start break
      setIsBreak(true);
      setIsRunning(true);
    } else {
      const newIsRunning = !isRunning;
      setIsRunning(newIsRunning);
      
      // Handle fullscreen
      if (settings.enterFullscreen && newIsRunning && !document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      }
    }
  };

  // Handle reset
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setIsBreak(false);
    setSessionComplete(false);
    setBreakTimeLeft(breakDuration * 60);
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Handle preset change
  const changePreset = (value: number) => {
    setDuration(value);
    setTimeLeft(value * 60);
    setShowPresets(false);
    setIsRunning(false);
  };

  // Skip break
  const skipBreak = () => {
    setIsBreak(false);
    setSessionComplete(false);
    setTimeLeft(duration * 60);
    setBreakTimeLeft(breakDuration * 60);
  };

  // Create noise buffer for ambient sounds
  const createNoiseBuffer = (context: AudioContext, seconds: number = 2) => {
    const bufferSize = context.sampleRate * seconds;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  };

  // Start ambient sound using Web Audio API
  const startAmbientSound = (soundType: string) => {
    // Create audio context if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    
    const context = audioContextRef.current;
    
    // Create noise source
    const noiseBuffer = createNoiseBuffer(context, 2);
    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    // Create gain node for volume
    const gainNode = context.createGain();
    gainNode.gain.value = volume * 0.5; // Reduce overall volume
    
    // Create filter based on sound type
    const filter = context.createBiquadFilter();
    
    switch (soundType) {
      case "rain":
        // Brown noise - warm, deep rain
        filter.type = "lowpass";
        filter.frequency.value = 1000;
        filter.Q.value = 1;
        break;
      case "forest":
        // Pink noise - birdy, rustling leaves
        filter.type = "bandpass";
        filter.frequency.value = 800;
        filter.Q.value = 0.5;
        break;
      case "waves":
        // Low rumbling waves
        filter.type = "lowpass";
        filter.frequency.value = 400;
        filter.Q.value = 2;
        break;
      case "wind":
        // High whooshing wind
        filter.type = "highpass";
        filter.frequency.value = 300;
        filter.Q.value = 0.5;
        break;
      default:
        filter.type = "lowpass";
        filter.frequency.value = 800;
    }
    
    // Connect: noise -> filter -> gain -> destination
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Start playback
    noise.start();
    
    // Store references
    noiseNodeRef.current = noise;
    gainNodeRef.current = gainNode;
  };

  // Stop ambient sound
  const stopAmbientSound = () => {
    if (noiseNodeRef.current) {
      noiseNodeRef.current.stop();
      noiseNodeRef.current.disconnect();
      noiseNodeRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
  };

  // Toggle sound
  const toggleSound = (soundId?: string) => {
    const targetSound = soundId || activeSound || "rain";
    
    if (activeSound === targetSound) {
      // Stop current sound
      stopAmbientSound();
      setActiveSound(null);
      return;
    }

    // Stop any existing sound first
    stopAmbientSound();

    // Start new sound
    try {
      startAmbientSound(targetSound);
      setActiveSound(targetSound);
    } catch (err) {
      console.error("Audio failed:", err);
    }
  };

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume * 0.5;
    }
  }, [volume]);

  // Cleanup audio
  useEffect(() => {
    return () => {
      stopAmbientSound();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Focus task input
  useEffect(() => {
    if (isEditingTask && taskInputRef.current) {
      taskInputRef.current.focus();
      taskInputRef.current.select();
    }
  }, [isEditingTask]);

  // Calculate progress
  const totalSeconds = isBreak ? breakDuration * 60 : duration * 60;
  const currentTime = isBreak ? breakTimeLeft : timeLeft;
  const progress = ((totalSeconds - currentTime) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 140;

  // Get milestone message
  const getMilestone = () => {
    const percentComplete = 100 - (timeLeft / (duration * 60)) * 100;
    if (percentComplete >= 75) return "Almost there! 🏁";
    if (percentComplete >= 50) return "Halfway done! 💪";
    if (percentComplete >= 25) return "Great start! ✨";
    return null;
  };

  const bgClass = darkMode 
    ? "from-gray-950 via-gray-900 to-gray-950" 
    : "from-emerald-50 via-white to-teal-50";
  
  const textClass = darkMode ? "text-white" : "text-gray-900";
  const mutedClass = darkMode ? "text-white/40" : "text-gray-400";
  const cardClass = darkMode ? "bg-white/5 border-white/10" : "bg-white/80 border-gray-200";

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${bgClass} overflow-hidden transition-colors duration-500`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-1/4 left-1/4 w-96 h-96 ${darkMode ? 'bg-zen-primary/5' : 'bg-zen-primary/10'} rounded-full blur-3xl`}
        />
        <motion.div
          animate={{ 
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute bottom-1/4 right-1/4 w-80 h-80 ${darkMode ? 'bg-violet-500/5' : 'bg-violet-500/10'} rounded-full blur-3xl`}
        />
        
        {/* Subtle stars (dark mode only) */}
        {darkMode && (
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.1 }}
                animate={{ opacity: [0.1, 0.5, 0.1] }}
                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Header controls */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-50">
        {/* Left controls */}
        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSoundPanel(!showSoundPanel)}
              className={`p-3 rounded-xl transition-all ${
                activeSound 
                  ? "bg-zen-primary/20 text-zen-primary" 
                  : `${darkMode ? 'text-white/30 hover:text-white/60 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`
              }`}
            >
              {activeSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </motion.button>

            <AnimatePresence>
              {showSoundPanel && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className={`absolute top-full left-0 mt-2 p-4 rounded-2xl ${cardClass} backdrop-blur-xl border shadow-2xl w-64 z-50`}
                >
                  <p className={`text-xs font-medium ${mutedClass} uppercase tracking-wider mb-3`}>Ambient Sounds</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {AMBIENT_SOUNDS.map((sound) => (
                      <button
                        key={sound.id}
                        onClick={() => toggleSound(sound.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${
                          activeSound === sound.id
                            ? "bg-zen-primary text-white"
                            : `${darkMode ? 'bg-white/5 text-white/70 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                        }`}
                      >
                        <sound.icon className="w-4 h-4" />
                        {sound.label}
                      </button>
                    ))}
                  </div>
                  
                  {activeSound && (
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <VolumeX className={`w-4 h-4 ${mutedClass}`} />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-zen-primary"
                        />
                        <Volume2 className={`w-4 h-4 ${mutedClass}`} />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-xl transition-all ${darkMode ? 'text-white/30 hover:text-white/60 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          {/* Keyboard shortcuts */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShortcuts(!showShortcuts)}
            className={`p-3 rounded-xl transition-all hidden sm:block ${darkMode ? 'text-white/30 hover:text-white/60 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          >
            <Keyboard className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Sessions counter */}
          {sessionsCompleted > 0 && (
            <div className={`px-4 py-2 rounded-xl ${cardClass} border flex items-center gap-2`}>
              <Sparkles className="w-4 h-4 text-zen-primary" />
              <span className={`text-sm font-medium ${textClass}`}>{sessionsCompleted} session{sessionsCompleted > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Exit */}
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-xl transition-all ${darkMode ? 'text-white/30 hover:text-white/60 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Keyboard shortcuts panel */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`absolute top-20 left-6 p-4 rounded-2xl ${cardClass} backdrop-blur-xl border shadow-2xl z-50`}
          >
            <p className={`text-xs font-medium ${mutedClass} uppercase tracking-wider mb-3`}>Shortcuts</p>
            <div className="space-y-2">
              {[
                { key: "Space", action: "Play / Pause" },
                { key: "R", action: "Reset" },
                { key: "M", action: "Toggle Sound" },
                { key: "Esc", action: "Close Panels" },
              ].map((shortcut) => (
                <div key={shortcut.key} className="flex items-center gap-3">
                  <kbd className={`px-2 py-1 rounded text-xs font-mono ${darkMode ? 'bg-white/10 text-white/60' : 'bg-gray-200 text-gray-600'}`}>
                    {shortcut.key}
                  </kbd>
                  <span className={`text-sm ${mutedClass}`}>{shortcut.action}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative h-full flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {/* Session Complete - Celebration Screen */}
          {sessionComplete && !isBreak && !isRunning ? (
            <motion.div
              key="celebration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center max-w-lg relative"
            >
              {/* Floating celebration particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0,
                      y: 100,
                      x: Math.random() * 200 - 100,
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      y: -200,
                      x: Math.random() * 100 - 50,
                    }}
                    transition={{ 
                      duration: 3 + Math.random() * 2,
                      delay: i * 0.15,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                    className="absolute left-1/2 top-1/2"
                  >
                    {["✨", "🌟", "⭐", "💫", "🎯", "🌿"][i % 6]}
                  </motion.div>
                ))}
              </div>

              {/* Glowing orb behind emoji */}
              <div className="relative inline-block mb-8">
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 w-32 h-32 mx-auto bg-gradient-to-br from-zen-primary to-emerald-400 rounded-full blur-3xl"
                />
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="relative text-8xl"
                >
                  🎉
                </motion.div>
              </div>

              {/* Success message */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`text-4xl md:text-5xl font-bold ${textClass} mb-4`}
              >
                Amazing work!
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-xl ${mutedClass} mb-2`}
              >
                You focused for <span className="text-zen-primary font-semibold">{duration} minutes</span>
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`text-sm ${mutedClass} mb-10`}
              >
                🔥 {sessionsCompleted} session{sessionsCompleted > 1 ? "s" : ""} completed today
              </motion.p>

              {/* Break suggestion card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`${darkMode ? "bg-white/5" : "bg-gradient-to-br from-emerald-50 to-teal-50"} backdrop-blur-xl rounded-3xl p-8 mb-8 border ${darkMode ? "border-white/10" : "border-emerald-100"}`}
              >
                <div className="flex items-center justify-center gap-2 mb-5">
                  <Coffee className={`w-5 h-5 ${darkMode ? "text-amber-400" : "text-amber-600"}`} />
                  <p className={`font-semibold ${textClass}`}>Time for a {breakDuration} minute break</p>
                </div>
                
                {/* Wellness activities */}
                <div className="flex items-center justify-center gap-6 mb-2">
                  {BREAK_ACTIVITIES.slice(0, 4).map((activity, index) => (
                    <motion.div 
                      key={activity.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex flex-col items-center gap-1"
                    >
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, delay: index * 0.3, repeat: Infinity }}
                        className="text-2xl"
                      >
                        {activity.emoji}
                      </motion.div>
                      <span className={`text-xs ${mutedClass}`}>{activity.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center justify-center gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleTimer}
                  className="px-8 py-4 bg-gradient-to-r from-zen-primary to-emerald-400 text-white font-semibold rounded-2xl shadow-xl shadow-zen-primary/30 flex items-center gap-2"
                >
                  <Coffee className="w-5 h-5" />
                  Start Break
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={skipBreak}
                  className={`px-8 py-4 ${cardClass} border ${textClass} font-semibold rounded-2xl hover:border-zen-primary/30 transition-all`}
                >
                  Skip Break
                </motion.button>
              </motion.div>
            </motion.div>
          ) : isBreak ? (
            /* Break Mode - Calm Timer */
            <motion.div
              key="break-timer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center max-w-lg"
            >
              {/* Break mode header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3 mb-8"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Coffee className={`w-6 h-6 ${darkMode ? "text-amber-400" : "text-amber-500"}`} />
                </motion.div>
                <span className={`text-lg font-semibold ${darkMode ? "text-amber-400" : "text-amber-600"}`}>
                  Break Time
                </span>
              </motion.div>

              {/* Circular break timer */}
              <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto mb-8">
                {/* Soft pulsing glow */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`absolute inset-0 ${darkMode ? "bg-amber-500/20" : "bg-amber-400/30"} rounded-full blur-3xl`}
                />

                <svg className="w-full h-full -rotate-90" viewBox="0 0 320 320">
                  {/* Background circle */}
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    fill="none"
                    stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="160"
                    cy="160"
                    r="140"
                    fill="none"
                    stroke="url(#breakGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (breakTimeLeft / (breakDuration * 60))}
                    animate={{ strokeDashoffset: circumference * (breakTimeLeft / (breakDuration * 60)) }}
                    transition={{ duration: 0.5, ease: "linear" }}
                  />
                  <defs>
                    <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#FBBF24" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Timer text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className={`text-7xl md:text-8xl font-extralight ${textClass} tracking-tight font-mono`}
                  >
                    {formatTime(breakTimeLeft)}
                  </motion.span>
                  <span className={`text-sm mt-3 ${isRunning ? (darkMode ? "text-amber-400" : "text-amber-600") : mutedClass} uppercase tracking-widest`}>
                    {isRunning ? "Relax..." : "Paused"}
                  </span>
                </div>
              </div>

              {/* Rotating wellness tip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center justify-center gap-3 mb-8 p-4 rounded-2xl ${darkMode ? "bg-white/5" : "bg-amber-50"}`}
              >
                <motion.span
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-2xl"
                >
                  {BREAK_ACTIVITIES[Math.floor((breakDuration * 60 - breakTimeLeft) / 60) % BREAK_ACTIVITIES.length]?.emoji || "🌿"}
                </motion.span>
                <span className={`text-sm ${mutedClass}`}>
                  {BREAK_ACTIVITIES[Math.floor((breakDuration * 60 - breakTimeLeft) / 60) % BREAK_ACTIVITIES.length]?.desc || "Take a moment to relax"}
                </span>
              </motion.div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTimer}
                  className={`p-5 rounded-2xl ${isRunning ? (darkMode ? "bg-amber-500" : "bg-amber-500") : "bg-zen-primary"} text-white shadow-lg`}
                >
                  {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setBreakTimeLeft(prev => Math.min(prev + 300, 30 * 60));
                  }}
                  className={`px-5 py-4 rounded-2xl ${cardClass} border ${textClass} font-medium`}
                >
                  +5 min
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={skipBreak}
                  className={`p-5 rounded-2xl ${cardClass} border ${textClass}`}
                >
                  <X className="w-7 h-7" />
                </motion.button>
              </div>

              {/* Breathing indicator at bottom */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-16 left-1/2 -translate-x-1/2"
              >
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`w-3 h-3 rounded-full ${darkMode ? "bg-amber-400" : "bg-amber-500"}`}
                  />
                  <span className={`text-xs tracking-[0.2em] uppercase ${mutedClass}`}>
                    Breathe slowly
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* Focus Mode */
            <motion.div
              key="focus"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center w-full max-w-lg pb-32"
            >
              {/* Task name - editable */}
              <div className="mb-8">
                {isEditingTask ? (
                  <input
                    ref={taskInputRef}
                    type="text"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    onBlur={() => setIsEditingTask(false)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditingTask(false)}
                    className={`bg-transparent text-center text-lg font-medium ${textClass} border-b-2 border-zen-primary outline-none w-64`}
                  />
                ) : (
                  <button
                    onClick={() => !isRunning && setIsEditingTask(true)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${cardClass} border ${textClass} hover:border-zen-primary/50 transition-all`}
                  >
                    <span className="text-sm font-medium">{task}</span>
                    {!isRunning && <Plus className="w-3 h-3 rotate-45" />}
                  </button>
                )}
              </div>

              {/* Timer ring */}
              <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto mb-10">
                {/* Breathing glow when running */}
                {isRunning && (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.08, 1],
                      opacity: [0.15, 0.25, 0.15]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    className="absolute inset-0 bg-zen-primary rounded-full blur-3xl"
                  />
                )}

                <svg className="w-full h-full -rotate-90" viewBox="0 0 320 320">
                  {/* Background circle */}
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    fill="none"
                    stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                    strokeWidth="6"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="160"
                    cy="160"
                    r="140"
                    fill="none"
                    stroke="url(#focusGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress / 100)}
                    initial={false}
                    animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
                    transition={{ duration: 0.5, ease: "linear" }}
                  />
                  <defs>
                    <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Timer text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    key={currentTime}
                    className={`text-7xl md:text-8xl font-extralight ${textClass} tracking-tight font-mono`}
                  >
                    {formatTime(currentTime)}
                  </motion.span>
                  
                  {/* Status or milestone */}
                  <span className={`text-sm mt-3 ${isRunning ? 'text-zen-primary' : mutedClass} uppercase tracking-widest`}>
                    {isRunning ? (getMilestone() || "Focusing...") : "Ready"}
                  </span>
                </div>
              </div>

              {/* Duration presets */}
              {!isRunning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 mb-10"
                >
                  {PRESETS.map((preset) => (
                    <motion.button
                      key={preset.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => changePreset(preset.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        duration === preset.value
                          ? "bg-zen-primary text-white shadow-lg shadow-zen-primary/30"
                          : `${cardClass} border ${mutedClass} hover:border-zen-primary/30`
                      }`}
                    >
                      {preset.label}m
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                {/* Reset */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={resetTimer}
                  className={`p-4 rounded-2xl ${cardClass} border ${mutedClass} hover:text-zen-primary transition-all`}
                >
                  <RotateCcw className="w-6 h-6" />
                </motion.button>

                {/* Start/Pause */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTimer}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-zen-primary to-emerald-400 text-white shadow-2xl shadow-zen-primary/40 flex items-center justify-center"
                >
                  {isRunning ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </motion.button>

                {/* Spacer for symmetry */}
                <div className="w-14 h-14" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breathing circle - during focus (only if enabled in settings) */}
        {isRunning && !isBreak && !sessionComplete && settings.breathingAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="w-4 h-4 rounded-full bg-gradient-to-br from-zen-primary to-emerald-400"
              />
              <span className={`text-xs tracking-[0.2em] uppercase ${mutedClass}`}>Breathe</span>
            </div>
          </motion.div>
        )}

        {/* Quote - when idle (only if enabled in settings) */}
        {!isRunning && !sessionComplete && !isBreak && settings.showMotivationalQuotes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center max-w-md px-6"
          >
            <p className={`${mutedClass} text-sm italic mb-1`}>
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className={`${mutedClass} text-xs`}>— {quote.author}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
