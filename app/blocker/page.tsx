"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Plus,
  X,
  Sparkles,
  Tv,
  Newspaper,
  Users,
  Check,
  AlertCircle,
  Chrome,
  ArrowLeft,
  Globe,
  Zap,
  TrendingUp,
  RefreshCw,
  Search,
  Trash2,
  Download,
  Upload,
  Clock,
  BarChart3,
  Target,
  Coffee,
} from "lucide-react";
import Link from "next/link";

// Storage keys
const STORAGE_KEYS = {
  BLOCKED_SITES: "zenflow_blocked_sites",
  MASTER_TOGGLE: "zenflow_blocker_enabled",
  BLOCK_MODE: "zenflow_block_mode",
  BLOCKED_ATTEMPTS: "zenflow_blocked_attempts",
  LAST_RESET_DATE: "zenflow_last_reset_date",
  TOTAL_BLOCKED: "zenflow_total_blocked",
};

// Smart presets
const PRESETS = [
  {
    id: "social",
    label: "Social Media",
    icon: Users,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    sites: ["facebook.com", "instagram.com", "twitter.com", "tiktok.com", "snapchat.com", "linkedin.com"],
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: Tv,
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-50",
    sites: ["youtube.com", "netflix.com", "twitch.tv", "reddit.com", "9gag.com", "imgur.com"],
  },
  {
    id: "news",
    label: "News & Media",
    icon: Newspaper,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    sites: ["cnn.com", "bbc.com", "news.google.com", "buzzfeed.com", "huffpost.com", "foxnews.com"],
  },
];

// Block mode options
const BLOCK_MODES = [
  { id: "focus", label: "Block only during focus sessions", description: "Sites are accessible when not focusing", icon: Target },
  { id: "always", label: "Always block", description: "24/7 blocking regardless of focus mode", icon: Shield },
  { id: "warning", label: "Show warning before opening", description: "Gentle reminder instead of hard block", icon: Coffee },
];

// Motivational messages
const MOTIVATIONAL_MESSAGES = [
  "Your focus is your superpower! 💪",
  "Less scrolling, more achieving! 🚀",
  "Deep work mode activated! 🧠",
  "You're in control of your attention! ✨",
  "Building better habits, one block at a time! 🌱",
];

// Type definitions
interface BlockedSite {
  domain: string;
  enabled: boolean;
  addedAt: number;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "info" | "warning";
}

export default function SiteBlockerPage() {
  // State
  const [masterToggle, setMasterToggle] = useState(true);
  const [newSite, setNewSite] = useState("");
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [blockMode, setBlockMode] = useState("focus");
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [blockedAttempts, setBlockedAttempts] = useState(0);
  const [totalBlocked, setTotalBlocked] = useState(0);
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [motivationalMessage] = useState(
    MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
  );

  // Show toast notification
  const showToast = useCallback((message: string, type: "success" | "info" | "warning" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Load blocked sites
        const savedSites = localStorage.getItem(STORAGE_KEYS.BLOCKED_SITES);
        if (savedSites) {
          setBlockedSites(JSON.parse(savedSites));
        } else {
          // Default sites
          setBlockedSites([
            { domain: "youtube.com", enabled: true, addedAt: Date.now() },
            { domain: "twitter.com", enabled: true, addedAt: Date.now() },
            { domain: "instagram.com", enabled: true, addedAt: Date.now() },
            { domain: "reddit.com", enabled: true, addedAt: Date.now() },
            { domain: "facebook.com", enabled: true, addedAt: Date.now() },
          ]);
        }

        // Load master toggle
        const savedToggle = localStorage.getItem(STORAGE_KEYS.MASTER_TOGGLE);
        if (savedToggle !== null) {
          setMasterToggle(savedToggle === "true");
        }

        // Load block mode
        const savedMode = localStorage.getItem(STORAGE_KEYS.BLOCK_MODE);
        if (savedMode) {
          setBlockMode(savedMode);
        }

        // Load total blocked (lifetime)
        const savedTotal = localStorage.getItem(STORAGE_KEYS.TOTAL_BLOCKED);
        if (savedTotal) {
          setTotalBlocked(parseInt(savedTotal, 10));
        }

        // Load blocked attempts (reset daily)
        const lastResetDate = localStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE);
        const today = new Date().toDateString();
        
        if (lastResetDate !== today) {
          // Reset for new day
          localStorage.setItem(STORAGE_KEYS.BLOCKED_ATTEMPTS, "0");
          localStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, today);
          setBlockedAttempts(0);
        } else {
          const savedAttempts = localStorage.getItem(STORAGE_KEYS.BLOCKED_ATTEMPTS);
          setBlockedAttempts(savedAttempts ? parseInt(savedAttempts, 10) : 0);
        }

        // Check extension connection
        checkExtensionConnection();
      } catch (error) {
        console.error("Error loading blocker data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save blocked sites to localStorage
  useEffect(() => {
    if (!isLoading && blockedSites.length >= 0) {
      localStorage.setItem(STORAGE_KEYS.BLOCKED_SITES, JSON.stringify(blockedSites));
      notifyExtension();
    }
  }, [blockedSites, isLoading]);

  // Save master toggle to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.MASTER_TOGGLE, masterToggle.toString());
      notifyExtension();
    }
  }, [masterToggle, isLoading]);

  // Save block mode to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.BLOCK_MODE, blockMode);
      notifyExtension();
    }
  }, [blockMode, isLoading]);

  // Check for extension connection
  const checkExtensionConnection = useCallback(() => {
    const extensionMarker = document.getElementById("zenflow-extension-marker");
    let connected = false;
    
    const handleExtensionResponse = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.connected) {
        connected = true;
        setExtensionConnected(true);
      }
    };

    window.addEventListener("zenflow-extension-response", handleExtensionResponse);
    window.dispatchEvent(new CustomEvent("zenflow-extension-ping"));

    setTimeout(() => {
      window.removeEventListener("zenflow-extension-response", handleExtensionResponse);
      if (!connected) {
        const extFlag = localStorage.getItem("zenflow_extension_installed");
        setExtensionConnected(extFlag === "true" || !!extensionMarker);
      }
    }, 100);
  }, []);

  // Notify extension of settings changes
  const notifyExtension = useCallback(() => {
    const settings = {
      enabled: masterToggle,
      mode: blockMode,
      sites: blockedSites.filter(s => s.enabled).map(s => s.domain),
    };

    // Extension sync event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent("zenflow-sync", { 
        detail: {
          blockedSites: settings.sites,
          // focusState is handled by TimerContext, but we can send an update here too
        } 
      }));
    }

    window.dispatchEvent(new CustomEvent("zenflow-settings-update", { 
      detail: settings 
    }));

    localStorage.setItem("zenflow_blocker_settings", JSON.stringify(settings));
  }, [masterToggle, blockMode, blockedSites]);

  // Clean URL
  const cleanUrl = (url: string) => {
    return url
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .replace(/\/.*$/, "")
      .replace(/\/$/, "")
      .trim();
  };

  // Validate domain
  const isValidDomain = (domain: string) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain) || domain.includes(".");
  };

  // Add new site
  const addSite = () => {
    const cleaned = cleanUrl(newSite);
    
    if (!cleaned) return;
    
    if (!isValidDomain(cleaned)) {
      showToast("Please enter a valid domain", "warning");
      return;
    }

    if (blockedSites.find((s) => s.domain === cleaned)) {
      showToast("Site already in your list", "info");
      setNewSite("");
      return;
    }

    const newSiteObj: BlockedSite = {
      domain: cleaned,
      enabled: true,
      addedAt: Date.now(),
    };

    setBlockedSites([newSiteObj, ...blockedSites]);
    setNewSite("");
    setShowAddSuccess(true);
    setJustAdded(cleaned);
    showToast(`Added ${cleaned} to blocklist`, "success");
    
    setTimeout(() => {
      setShowAddSuccess(false);
      setJustAdded(null);
    }, 2000);
  };

  // Remove site
  const removeSite = (domain: string) => {
    setBlockedSites(blockedSites.filter((s) => s.domain !== domain));
    showToast(`Removed ${domain}`, "info");
  };

  // Toggle site
  const toggleSite = (domain: string) => {
    setBlockedSites(
      blockedSites.map((s) =>
        s.domain === domain ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  // Add preset
  const addPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const newSites = preset.sites
      .filter((site) => !blockedSites.find((s) => s.domain === site))
      .map((site) => ({ domain: site, enabled: true, addedAt: Date.now() }));

    if (newSites.length > 0) {
      setBlockedSites([...newSites, ...blockedSites]);
      showToast(`Added ${newSites.length} sites from ${preset.label}`, "success");
    } else {
      showToast("All sites from this pack are already added", "info");
    }
  };

  // Get count of sites already in a preset
  const getPresetAddedCount = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return 0;
    return preset.sites.filter((site) => blockedSites.find((s) => s.domain === site)).length;
  };

  // Clear all sites
  const clearAllSites = () => {
    setBlockedSites([]);
    setShowClearConfirm(false);
    showToast("All sites cleared", "info");
  };

  // Export sites
  const exportSites = () => {
    const data = JSON.stringify(blockedSites, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zenflow-blocked-sites.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Blocklist exported!", "success");
  };

  // Import sites
  const importSites = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string) as BlockedSite[];
          const newSites = imported.filter(
            (site) => !blockedSites.find((s) => s.domain === site.domain)
          );
          setBlockedSites([...newSites, ...blockedSites]);
          showToast(`Imported ${newSites.length} new sites`, "success");
        } catch {
          showToast("Invalid file format", "warning");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Simulate blocked attempt (for demo)
  const simulateBlock = () => {
    const newCount = blockedAttempts + 1;
    const newTotal = totalBlocked + 1;
    setBlockedAttempts(newCount);
    setTotalBlocked(newTotal);
    localStorage.setItem(STORAGE_KEYS.BLOCKED_ATTEMPTS, newCount.toString());
    localStorage.setItem(STORAGE_KEYS.TOTAL_BLOCKED, newTotal.toString());
  };

  // Filter sites by search
  const filteredSites = blockedSites.filter((site) =>
    site.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get time since added
  const getTimeSince = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const enabledCount = blockedSites.filter((s) => s.enabled).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="w-12 h-12 text-zen-primary" />
          </motion.div>
          <p className="text-gray-500 font-medium">Loading your blocklist...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      {/* Toast notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
                toast.type === "success" ? "bg-zen-primary text-white" :
                toast.type === "warning" ? "bg-amber-500 text-white" :
                "bg-gray-800 text-white"
              }`}
            >
              {toast.type === "success" && <Check className="w-4 h-4" />}
              {toast.type === "warning" && <AlertCircle className="w-4 h-4" />}
              {toast.type === "info" && <Sparkles className="w-4 h-4" />}
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="flex items-center gap-3">
                <motion.div 
                  animate={{ 
                    scale: masterToggle ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 2, repeat: masterToggle ? Infinity : 0 }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                    masterToggle 
                      ? "bg-gradient-to-br from-zen-primary to-emerald-400 shadow-zen-primary/30" 
                      : "bg-gray-200"
                  }`}
                >
                  <Shield className={`w-5 h-5 ${masterToggle ? "text-white" : "text-gray-400"}`} />
                </motion.div>
                <div>
                  <h1 className="font-bold text-gray-900">Site Blocker</h1>
                  <p className="text-xs text-gray-500">
                    {masterToggle ? `${enabledCount} sites blocked` : "Blocking disabled"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={importSites}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all hidden sm:flex"
                title="Import blocklist"
              >
                <Upload className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportSites}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all hidden sm:flex"
                title="Export blocklist"
              >
                <Download className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-2xl p-4 shadow-lg shadow-black/[0.03] border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-zen-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-zen-primary" />
              </div>
              <span className="text-xs text-gray-500 font-medium">Active</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{enabledCount}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-lg shadow-black/[0.03] border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">Today</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{blockedAttempts}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-lg shadow-black/[0.03] border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalBlocked}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-lg shadow-black/[0.03] border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <Globe className="w-4 h-4 text-rose-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">Sites</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{blockedSites.length}</p>
          </div>
        </motion.div>

        {/* Master Toggle Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-white rounded-2xl p-6 shadow-xl shadow-black/[0.03] border-2 transition-all ${
            masterToggle ? "border-zen-primary/30" : "border-gray-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: masterToggle ? 1 : 0.95 }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  masterToggle
                    ? "bg-gradient-to-br from-zen-primary to-emerald-400 shadow-lg shadow-zen-primary/30"
                    : "bg-gray-100"
                }`}
              >
                {masterToggle ? (
                  <ShieldCheck className="w-7 h-7 text-white" />
                ) : (
                  <ShieldOff className="w-7 h-7 text-gray-400" />
                )}
              </motion.div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {masterToggle ? "Protection Active" : "Protection Disabled"}
                </h3>
                <p className="text-sm text-gray-500">
                  {masterToggle
                    ? motivationalMessage
                    : "Enable to start blocking distractions"}
                </p>
              </div>
            </div>

            {/* Toggle switch */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setMasterToggle(!masterToggle);
                showToast(
                  !masterToggle ? "Protection enabled! 🛡️" : "Protection disabled",
                  !masterToggle ? "success" : "info"
                );
              }}
              className={`relative w-16 h-9 rounded-full transition-all ${
                masterToggle ? "bg-zen-primary" : "bg-gray-200"
              }`}
            >
              <motion.div
                animate={{ x: masterToggle ? 28 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1.5 w-6 h-6 bg-white rounded-full shadow-md"
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Add Website Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-6 shadow-xl shadow-black/[0.03] border border-gray-100"
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-zen-primary" />
            Add Website
          </h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSite()}
                placeholder="Enter domain (e.g., youtube.com)"
                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zen-primary/20 focus:border-zen-primary transition-all"
              />
              <AnimatePresence>
                {showAddSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <div className="w-6 h-6 rounded-full bg-zen-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addSite}
              disabled={!newSite.trim()}
              className="px-6 py-3.5 bg-gradient-to-r from-zen-primary to-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-zen-primary/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Smart Presets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-xl shadow-black/[0.03] border border-gray-100"
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Quick Add Packs
            <span className="text-xs font-normal text-gray-400 ml-1">One-click add</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESETS.map((preset) => {
              const addedCount = getPresetAddedCount(preset.id);
              const allAdded = addedCount === preset.sites.length;
              
              return (
                <motion.button
                  key={preset.id}
                  whileHover={{ scale: allAdded ? 1 : 1.02, y: allAdded ? 0 : -2 }}
                  whileTap={{ scale: allAdded ? 1 : 0.98 }}
                  onClick={() => !allAdded && addPreset(preset.id)}
                  disabled={allAdded}
                  className={`relative overflow-hidden flex items-center gap-3 p-4 rounded-xl border transition-all group ${
                    allAdded 
                      ? "bg-gray-50 border-gray-100 cursor-default" 
                      : `${preset.bgColor} border-transparent hover:shadow-lg`
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${preset.color} flex items-center justify-center shadow-lg`}
                  >
                    <preset.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{preset.label}</p>
                    <p className="text-xs text-gray-500">
                      {allAdded ? "All added ✓" : `${preset.sites.length - addedCount} sites`}
                    </p>
                  </div>
                  {!allAdded && (
                    <motion.div
                      initial={{ opacity: 0.5 }}
                      whileHover={{ opacity: 1, scale: 1.1 }}
                      className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </motion.div>
                  )}
                  {allAdded && (
                    <div className="w-8 h-8 rounded-full bg-zen-primary/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-zen-primary" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Blocked Sites List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-6 shadow-xl shadow-black/[0.03] border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-400" />
              Blocked Sites
              <span className="text-sm font-normal text-gray-400">
                ({enabledCount}/{blockedSites.length})
              </span>
            </h3>
            
            <div className="flex items-center gap-2">
              {blockedSites.length > 3 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          {blockedSites.length > 5 && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sites..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zen-primary/20 text-sm"
              />
            </div>
          )}

          {blockedSites.length === 0 ? (
            <div className="text-center py-12">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4"
              >
                <Shield className="w-10 h-10 text-gray-300" />
              </motion.div>
              <p className="text-gray-500 font-medium">No sites blocked yet</p>
              <p className="text-sm text-gray-400 mt-1">Add sites above or use a quick pack</p>
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No sites match &ldquo;{searchQuery}&rdquo;</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredSites.map((site, index) => (
                  <motion.div
                    key={site.domain}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      backgroundColor: justAdded === site.domain ? "rgb(16 185 129 / 0.1)" : "transparent"
                    }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      site.enabled
                        ? "bg-gray-50 border-gray-100 hover:border-zen-primary/30"
                        : "bg-gray-50/50 border-gray-100"
                    }`}
                  >
                    {/* Toggle button */}
                    <button
                      onClick={() => toggleSite(site.domain)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        site.enabled
                          ? "bg-zen-primary border-zen-primary"
                          : "bg-transparent border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {site.enabled && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>

                    {/* Site favicon placeholder */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      site.enabled ? "bg-white" : "bg-gray-100"
                    }`}>
                      <Globe className={`w-4 h-4 ${site.enabled ? "text-gray-400" : "text-gray-300"}`} />
                    </div>

                    {/* Site info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${
                        site.enabled ? "text-gray-900" : "text-gray-400 line-through"
                      }`}>
                        {site.domain}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeSince(site.addedAt)}
                      </p>
                    </div>

                    {/* Remove button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => removeSite(site.domain)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Block Mode Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-xl shadow-black/[0.03] border border-gray-100"
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            Block Mode
          </h3>
          <div className="space-y-3">
            {BLOCK_MODES.map((mode) => (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setBlockMode(mode.id);
                  showToast(`Block mode: ${mode.label}`, "info");
                }}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                  blockMode === mode.id
                    ? "border-zen-primary/30 bg-zen-primary/5"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    blockMode === mode.id
                      ? "bg-zen-primary/20"
                      : "bg-gray-100"
                  }`}
                >
                  <mode.icon className={`w-5 h-5 ${blockMode === mode.id ? "text-zen-primary" : "text-gray-400"}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${blockMode === mode.id ? "text-gray-900" : "text-gray-700"}`}>
                    {mode.label}
                  </p>
                  <p className="text-sm text-gray-500">{mode.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    blockMode === mode.id
                      ? "border-zen-primary bg-zen-primary"
                      : "border-gray-300"
                  }`}
                >
                  {blockMode === mode.id && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Extension Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={`rounded-2xl p-6 border-2 ${
            extensionConnected
              ? "bg-zen-primary/5 border-zen-primary/20"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  extensionConnected ? "bg-zen-primary/20" : "bg-amber-100"
                }`}
              >
                {extensionConnected ? (
                  <Chrome className="w-6 h-6 text-zen-primary" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold ${extensionConnected ? "text-gray-900" : "text-amber-900"}`}>
                    Browser Extension
                  </h3>
                  {extensionConnected && (
                    <span className="px-2 py-0.5 rounded-full bg-zen-primary/20 text-zen-primary text-xs font-medium">
                      Connected
                    </span>
                  )}
                </div>
                <p className={`text-sm ${extensionConnected ? "text-gray-500" : "text-amber-700"}`}>
                  {extensionConnected
                    ? "ZenFlow extension is active"
                    : "Install for actual site blocking"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={checkExtensionConnection}
                className={`p-2 rounded-lg transition-all ${extensionConnected ? "text-gray-400 hover:bg-gray-100" : "text-amber-600 hover:bg-amber-100"}`}
                title="Check connection"
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>
              
              {!extensionConnected && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30"
                >
                  Install
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Demo button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center pt-4 pb-8"
        >
          <button
            onClick={simulateBlock}
            className="text-xs text-gray-400 hover:text-zen-primary transition-colors"
          >
            + Simulate blocked attempt
          </button>
        </motion.div>
      </main>

      {/* Clear confirmation modal */}
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
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Clear all sites?</h3>
                <p className="text-gray-500 mb-6">
                  This will remove all {blockedSites.length} sites from your blocklist. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearAllSites}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
                  >
                    Clear All
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
