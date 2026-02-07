"use client";

// Break Screen Component
// Shows after focus session ends with smooth transition to break

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, 
  Play, 
  SkipForward, 
  Droplets, 
  Eye, 
  Wind,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { useTimer } from '@/contexts/TimerContext';
import { useState, useEffect } from 'react';

interface BreakScreenProps {
  breakDuration?: number; // in minutes
  showStretchReminder?: boolean;
  showHydrationReminder?: boolean;
  showEyeRestReminder?: boolean;
  autoStartBreak?: boolean;
}

const WELLNESS_TIPS = [
  { icon: Droplets, text: "Drink some water 💧", tip: "Stay hydrated to maintain focus" },
  { icon: Eye, text: "Rest your eyes 👀", tip: "Look at something 20ft away for 20 seconds" },
  { icon: Wind, text: "Take deep breaths 🌬️", tip: "4 seconds in, 4 seconds out" },
];

const MOTIVATIONAL_QUOTES = [
  "Great work! You're crushing it! 🔥",
  "Another session down! You're unstoppable! 💪",
  "Focus master in action! Keep going! 🧘",
  "You're building something great! ✨",
  "Every session counts! Well done! 🎯",
];

export default function BreakScreen({
  breakDuration = 5,
  showStretchReminder = true,
  showHydrationReminder = true,
  showEyeRestReminder = true,
  autoStartBreak = false,
}: BreakScreenProps) {
  const { 
    showBreakScreen, 
    startBreak, 
    skipBreak,
    state,
  } = useTimer();
  
  const [selectedTip, setSelectedTip] = useState(0);
  const [quote] = useState(() => 
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );
  const [autoStartCountdown, setAutoStartCountdown] = useState(autoStartBreak ? 5 : null);
  const [completedTips, setCompletedTips] = useState<number[]>([]);

  // Auto-start countdown
  useEffect(() => {
    if (autoStartCountdown !== null && autoStartCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoStartCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    if (autoStartCountdown === 0) {
      handleStartBreak();
    }
  }, [autoStartCountdown]);

  // Reset when break screen opens
  useEffect(() => {
    if (showBreakScreen) {
      setCompletedTips([]);
      setAutoStartCountdown(autoStartBreak ? 5 : null);
    }
  }, [showBreakScreen, autoStartBreak]);

  const handleStartBreak = () => {
    startBreak(breakDuration);
  };

  const handleSkipBreak = () => {
    skipBreak();
  };

  const toggleTipComplete = (index: number) => {
    setCompletedTips(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const visibleTips = WELLNESS_TIPS.filter((_, i) => {
    if (i === 0 && !showHydrationReminder) return false;
    if (i === 1 && !showEyeRestReminder) return false;
    if (i === 2 && !showStretchReminder) return false;
    return true;
  });

  return (
    <AnimatePresence>
      {showBreakScreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center p-4"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/10 rounded-full"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: -10,
                }}
                animate={{
                  y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 10,
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl"
          >
            {/* Celebration icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            {/* Motivational quote */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white text-center mb-2"
            >
              Session Complete! 🎉
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-emerald-100 text-center mb-6"
            >
              {quote}
            </motion.p>

            {/* Session summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10"
            >
              <div className="flex items-center justify-between text-sm text-emerald-100">
                <span>Focused on</span>
                <span className="font-semibold text-white">{state.tag}</span>
              </div>
              {state.taskName && (
                <div className="flex items-center justify-between text-sm text-emerald-100 mt-2">
                  <span>Task</span>
                  <span className="font-medium text-white truncate max-w-[150px]">
                    {state.taskName}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Wellness tips */}
            {visibleTips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3 mb-6"
              >
                <p className="text-sm text-emerald-200 font-medium">During your break:</p>
                {visibleTips.map((tip, index) => (
                  <motion.button
                    key={index}
                    onClick={() => toggleTipComplete(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      completedTips.includes(index)
                        ? 'bg-emerald-500/30 border border-emerald-400/30'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      completedTips.includes(index)
                        ? 'bg-emerald-400'
                        : 'bg-white/10'
                    }`}>
                      {completedTips.includes(index) ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <tip.icon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-medium ${
                        completedTips.includes(index)
                          ? 'text-emerald-200 line-through'
                          : 'text-white'
                      }`}>
                        {tip.text}
                      </p>
                      <p className="text-xs text-emerald-300/70">{tip.tip}</p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <motion.button
                onClick={handleStartBreak}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-emerald-800 rounded-xl font-semibold shadow-lg shadow-black/20 hover:bg-emerald-50 transition-colors"
              >
                <Coffee className="w-5 h-5" />
                <span>
                  Start {breakDuration} min Break
                  {autoStartCountdown !== null && autoStartCountdown > 0 && (
                    <span className="ml-2 text-emerald-600">({autoStartCountdown}s)</span>
                  )}
                </span>
              </motion.button>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => {
                    setAutoStartCountdown(null);
                    handleSkipBreak();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors border border-white/10"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip Break
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    setAutoStartCountdown(null);
                    // Start next focus session immediately
                    skipBreak();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600/50 text-white rounded-xl font-medium hover:bg-emerald-600/70 transition-colors border border-emerald-500/30"
                >
                  <Play className="w-4 h-4" />
                  Continue Focus
                </motion.button>
              </div>
            </motion.div>

            {/* Cancel auto-start hint */}
            {autoStartCountdown !== null && autoStartCountdown > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-emerald-200/60 mt-4"
              >
                Click any button to cancel auto-start
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
