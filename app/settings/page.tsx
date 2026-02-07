"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  Timer,
  Heart,
  Bell,
  Database,
  LogOut,
  ChevronDown,
  Check,
  Moon,
  Maximize,
  Quote,
  Droplets,
  Eye,
  Wind,
  Volume2,
  Download,
  Trash2,
  AlertTriangle,
  ExternalLink,
  Camera,
  Mail,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSettings, ZenFlowSettings } from "@/contexts/SettingsContext";

// Duration options
const DURATION_OPTIONS = [
  { value: 25, label: "25 min", name: "Pomodoro" },
  { value: 50, label: "50 min", name: "Deep Work" },
  { value: 90, label: "90 min", name: "Flow State" },
  { value: 120, label: "120 min", name: "Marathon" },
];

const BREAK_OPTIONS = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
];

const AMBIENT_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "rain", label: "Rain" },
  { value: "forest", label: "Forest" },
  { value: "waves", label: "Waves" },
  { value: "wind", label: "Wind" },
];

// Toggle component
const Toggle = ({ enabled, onToggle, disabled = false }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onToggle}
    disabled={disabled}
    className={`relative w-12 h-7 rounded-full transition-all ${
      enabled ? "bg-zen-primary" : "bg-gray-200"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <motion.div
      animate={{ x: enabled ? 22 : 4 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
    />
  </motion.button>
);

// Dropdown component
const Dropdown = ({ 
  value, 
  options, 
  onChange,
  className = ""
}: { 
  value: string | number; 
  options: { value: string | number; label: string; name?: string }[];
  onChange: (value: string | number) => void;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all min-w-[140px]"
      >
        <span className="text-sm font-medium text-gray-900 flex-1 text-left">
          {selected?.label}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                    value === option.value ? "bg-zen-primary/5" : ""
                  }`}
                >
                  <span className={`text-sm ${value === option.value ? "text-zen-primary font-medium" : "text-gray-700"}`}>
                    {option.label}
                  </span>
                  {option.name && (
                    <span className="text-xs text-gray-400">{option.name}</span>
                  )}
                  {value === option.value && (
                    <Check className="w-4 h-4 text-zen-primary ml-auto" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Setting row component
const SettingRow = ({ 
  icon: Icon, 
  label, 
  description, 
  children 
}: { 
  icon: React.ElementType;
  label: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <div className="flex items-start gap-4 flex-1">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-gray-500" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
    <div className="flex-shrink-0 ml-4">
      {children}
    </div>
  </div>
);

// Section component
const Section = ({ 
  icon: Icon, 
  title, 
  children,
  delay = 0
}: { 
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl shadow-xl shadow-black/[0.03] border border-gray-100 overflow-hidden"
  >
    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-zen-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-zen-primary" />
      </div>
      <h2 className="font-bold text-gray-900">{title}</h2>
    </div>
    <div className="px-6">
      {children}
    </div>
  </motion.div>
);

export default function SettingsPage() {
  // Use settings context
  const { 
    settings, 
    user, 
    stats,
    isLoading, 
    updateSetting, 
    updateUser,
    exportData,
    clearHistory,
    deleteAllData,
    requestNotificationPermission,
    playSound,
  } = useSettings();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastSavedKey, setLastSavedKey] = useState<string | null>(null);

  // Show saved indicator when settings change
  const handleSettingChange = <K extends keyof ZenFlowSettings>(
    key: K,
    value: ZenFlowSettings[K]
  ) => {
    updateSetting(key, value);
    setSaved(true);
    setLastSavedKey(key);
    setTimeout(() => setSaved(false), 2000);
  };

  // Request notification permission
  useEffect(() => {
    if (settings.desktopNotifications) {
      requestNotificationPermission();
    }
  }, [settings.desktopNotifications, requestNotificationPermission]);

  // Logout
  const handleLogout = () => {
    window.location.href = "/";
  };

  // Handle delete
  const handleDelete = () => {
    deleteAllData();
    setShowDeleteConfirm(false);
    window.location.href = "/";
  };

  // Handle clear history
  const handleClearHistory = () => {
    clearHistory();
    setShowClearConfirm(false);
  };

  // Test sound
  const testSound = () => {
    playSound("notification");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-zen-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </Link>
              <h1 className="font-bold text-gray-900 text-lg">Settings</h1>
            </div>

            {/* Saved indicator */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zen-primary/10 text-zen-primary text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                  Saved
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Section */}
        <Section icon={User} title="Profile" delay={0}>
          <div className="py-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zen-primary to-emerald-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-zen-primary/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center shadow-md hover:bg-gray-50 transition-all">
                  <Camera className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => updateUser({ name: e.target.value })}
                  className="text-xl font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-zen-primary outline-none transition-all w-full"
                />
                <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.sessionCount}</p>
                <p className="text-xs text-gray-500">Sessions</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.totalFocusTime / 60)}h</p>
                <p className="text-xs text-gray-500">Focus Time</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.totalBlocked}</p>
                <p className="text-xs text-gray-500">Blocked</p>
              </div>
            </div>

            {/* Logout button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </motion.button>
          </div>
        </Section>

        {/* Focus Preferences */}
        <Section icon={Timer} title="Focus Preferences" delay={0.1}>
          <SettingRow
            icon={Timer}
            label="Default Duration"
            description="How long your focus sessions last"
          >
            <Dropdown
              value={settings.defaultDuration}
              options={DURATION_OPTIONS}
              onChange={(v) => handleSettingChange("defaultDuration", v as number)}
            />
          </SettingRow>

          <SettingRow
            icon={Timer}
            label="Auto-start Break"
            description="Start break timer when session ends"
          >
            <Toggle
              enabled={settings.autoStartBreak}
              onToggle={() => handleSettingChange("autoStartBreak", !settings.autoStartBreak)}
            />
          </SettingRow>

          <SettingRow
            icon={Timer}
            label="Auto-start Next Session"
            description="Start new session when break ends"
          >
            <Toggle
              enabled={settings.autoStartNextSession}
              onToggle={() => handleSettingChange("autoStartNextSession", !settings.autoStartNextSession)}
            />
          </SettingRow>

          <SettingRow
            icon={Maximize}
            label="Enter Fullscreen"
            description="Automatically enter fullscreen during focus"
          >
            <Toggle
              enabled={settings.enterFullscreen}
              onToggle={() => handleSettingChange("enterFullscreen", !settings.enterFullscreen)}
            />
          </SettingRow>

          <SettingRow
            icon={Moon}
            label="Dark Focus Mode"
            description="Use dark theme during focus sessions"
          >
            <Toggle
              enabled={settings.darkFocusMode}
              onToggle={() => handleSettingChange("darkFocusMode", !settings.darkFocusMode)}
            />
          </SettingRow>

          <SettingRow
            icon={Quote}
            label="Motivational Quotes"
            description="Show inspiring quotes during sessions"
          >
            <Toggle
              enabled={settings.showMotivationalQuotes}
              onToggle={() => handleSettingChange("showMotivationalQuotes", !settings.showMotivationalQuotes)}
            />
          </SettingRow>
        </Section>

        {/* Break & Wellness */}
        <Section icon={Heart} title="Break & Wellness" delay={0.2}>
          <SettingRow
            icon={Timer}
            label="Break Duration"
            description="How long your breaks last"
          >
            <Dropdown
              value={settings.breakDuration}
              options={BREAK_OPTIONS}
              onChange={(v) => handleSettingChange("breakDuration", v as number)}
            />
          </SettingRow>

          <SettingRow
            icon={Wind}
            label="Stretch Reminder"
            description="Remind to stretch during breaks"
          >
            <Toggle
              enabled={settings.stretchReminder}
              onToggle={() => handleSettingChange("stretchReminder", !settings.stretchReminder)}
            />
          </SettingRow>

          <SettingRow
            icon={Droplets}
            label="Hydration Reminder"
            description="Remind to drink water during breaks"
          >
            <Toggle
              enabled={settings.hydrationReminder}
              onToggle={() => handleSettingChange("hydrationReminder", !settings.hydrationReminder)}
            />
          </SettingRow>

          <SettingRow
            icon={Eye}
            label="Eye Rest Reminder"
            description="Remind to rest your eyes (20-20-20 rule)"
          >
            <Toggle
              enabled={settings.eyeRestReminder}
              onToggle={() => handleSettingChange("eyeRestReminder", !settings.eyeRestReminder)}
            />
          </SettingRow>

          <SettingRow
            icon={Wind}
            label="Breathing Animation"
            description="Show breathing guide during focus"
          >
            <Toggle
              enabled={settings.breathingAnimation}
              onToggle={() => handleSettingChange("breathingAnimation", !settings.breathingAnimation)}
            />
          </SettingRow>
        </Section>

        {/* Notifications & Sounds */}
        <Section icon={Bell} title="Notifications & Sounds" delay={0.3}>
          <SettingRow
            icon={Bell}
            label="Desktop Notifications"
            description="Show browser notifications"
          >
            <Toggle
              enabled={settings.desktopNotifications}
              onToggle={() => handleSettingChange("desktopNotifications", !settings.desktopNotifications)}
            />
          </SettingRow>

          <SettingRow
            icon={Volume2}
            label="Timer End Sound"
            description="Play sound when session ends"
          >
            <Toggle
              enabled={settings.timerEndSound}
              onToggle={() => handleSettingChange("timerEndSound", !settings.timerEndSound)}
            />
          </SettingRow>

          <SettingRow
            icon={Volume2}
            label="Break Sound"
            description="Play sound when break starts/ends"
          >
            <Toggle
              enabled={settings.breakSound}
              onToggle={() => handleSettingChange("breakSound", !settings.breakSound)}
            />
          </SettingRow>

          <SettingRow
            icon={Volume2}
            label="Default Ambient Sound"
            description="Background sound for focus sessions"
          >
            <Dropdown
              value={settings.defaultAmbientSound}
              options={AMBIENT_OPTIONS}
              onChange={(v) => handleSettingChange("defaultAmbientSound", v as string)}
            />
          </SettingRow>

          <SettingRow
            icon={Volume2}
            label="Sound Volume"
            description="Master volume for all sounds"
          >
            <div className="flex items-center gap-3 w-48">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.soundVolume}
                onChange={(e) => handleSettingChange("soundVolume", parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-zen-primary"
              />
              <span className="text-sm text-gray-500 w-10 text-right">
                {Math.round(settings.soundVolume * 100)}%
              </span>
              <button
                onClick={testSound}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                title="Test sound"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </SettingRow>
        </Section>

        {/* Account & Data */}
        <Section icon={Database} title="Account & Data" delay={0.4}>
          <SettingRow
            icon={Download}
            label="Export Data"
            description="Download all your ZenFlow data"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportData}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all text-sm"
            >
              Export
            </motion.button>
          </SettingRow>

          <SettingRow
            icon={Shield}
            label="Privacy Policy"
            description="How we handle your data"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all text-sm"
            >
              View
              <ExternalLink className="w-3.5 h-3.5" />
            </motion.button>
          </SettingRow>

          {/* Danger Zone */}
          <div className="py-6 border-t border-gray-100 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">Danger Zone</span>
            </div>
            
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5" />
                  <span className="font-medium">Clear History</span>
                </div>
                <span className="text-sm text-red-400">Removes all stats</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Delete All Data</span>
                </div>
                <span className="text-sm text-red-400">Cannot be undone</span>
              </motion.button>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8"
        >
          <p className="text-sm text-gray-400">
            ZenFlow v1.0.0 • Made with 🌿 for focus
          </p>
        </motion.div>
      </main>

      {/* Clear History Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-2xl z-50 w-[90%] max-w-md"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Clear History?</h3>
                <p className="text-gray-500 mb-6">
                  This will reset all your stats ({stats.sessionCount} sessions, {Math.round(stats.totalFocusTime / 60)}h focus time). Your blocklist and settings will be kept.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearHistory}
                    className="flex-1 px-4 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-2xl z-50 w-[90%] max-w-md"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete All Data?</h3>
                <p className="text-gray-500 mb-6">
                  This will permanently delete all your ZenFlow data including settings, blocklist, and history. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
                  >
                    Delete Everything
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
