"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Flame,
  Target,
  Timer,
  TrendingUp,
  Sparkles,
  ChevronDown,
  Zap,
  Sun,
  Moon,
  Coffee,
  Brain,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  Star,
  Heart,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// Storage keys
const STORAGE_KEYS = {
  SESSIONS: "zenflow_session_history",
  DAILY_FOCUS: "zenflow_daily_focus",
};

// Types
interface Session {
  id: string;
  date: string;
  duration: number;
  tag: string;
  timestamp: number;
}

interface DailyFocus {
  date: string;
  minutes: number;
  sessions: number;
}

// Sample data generator removed for production

const TIME_PERIODS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

// Custom tooltip for chart
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value?: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl text-sm shadow-2xl border border-white/10">
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-zen-primary text-lg font-bold">{payload[0].value} min</p>
      </div>
    );
  }
  return null;
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Premium stat card with animated gradient
const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  gradient = "from-zen-primary to-emerald-400",
  bgGradient = "from-emerald-50 to-teal-50",
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | null;
  gradient?: string;
  bgGradient?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 100 }}
    whileHover={{ y: -4, scale: 1.02 }}
    className={`relative overflow-hidden bg-gradient-to-br ${bgGradient} rounded-2xl p-5 border border-white/50 shadow-xl shadow-black/[0.03]`}
  >
    {/* Animated background orb */}
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} blur-2xl`}
    />
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <motion.div 
          whileHover={{ rotate: 10, scale: 1.1 }}
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        {trend && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2 }}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              trend === "up" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}
          >
            {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {subValue}
          </motion.div>
        )}
      </div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.1 }}
        className="text-3xl font-bold text-gray-900"
      >
        {value}
      </motion.p>
      <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
      {!trend && subValue && (
        <p className="text-xs text-zen-primary mt-2 font-semibold">{subValue}</p>
      )}
    </div>
  </motion.div>
);

// Premium heatmap
const FocusHeatmap = ({ dailyFocus }: { dailyFocus: Record<string, DailyFocus> }) => {
  const today = new Date();
  const weeks: { date: Date; minutes: number }[][] = [];
  
  for (let week = 15; week >= 0; week--) {
    const weekData: { date: Date; minutes: number }[] = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (week * 7 + (6 - day)));
      const dateStr = date.toISOString().split("T")[0];
      weekData.push({
        date,
        minutes: dailyFocus[dateStr]?.minutes || 0,
      });
    }
    weeks.push(weekData);
  }

  const getIntensity = (minutes: number) => {
    if (minutes === 0) return "bg-gray-100 dark:bg-gray-800";
    if (minutes < 30) return "bg-emerald-200";
    if (minutes < 60) return "bg-emerald-300";
    if (minutes < 120) return "bg-emerald-400";
    if (minutes < 180) return "bg-emerald-500";
    return "bg-emerald-600";
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-3">
      {/* Month labels */}
      <div className="flex gap-1 pl-8">
        {weeks.map((week, i) => {
          const firstDay = week[0].date;
          const showMonth = i === 0 || firstDay.getDate() <= 7;
          return (
            <div key={i} className="w-4 text-xs text-gray-400">
              {showMonth && i % 4 === 0 ? months[firstDay.getMonth()] : ""}
            </div>
          );
        })}
      </div>
      
      <div className="flex gap-1">
        <div className="flex flex-col justify-between text-xs text-gray-400 pr-2 py-0.5">
          {days.map((day, i) => (
            <span key={i} className="h-4 leading-4 text-right">{i % 2 === 0 ? day : ""}</span>
          ))}
        </div>
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: weekIndex * 0.02 + dayIndex * 0.01 }}
                  whileHover={{ scale: 1.4, zIndex: 10 }}
                  className={`w-4 h-4 rounded-[4px] ${getIntensity(day.minutes)} cursor-pointer transition-all shadow-sm hover:shadow-lg relative group`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                    <div className="font-semibold">{day.date.toLocaleDateString()}</div>
                    <div className="text-zen-primary">{day.minutes > 0 ? `${day.minutes} min` : "No focus"}</div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-gray-900" />
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Insight card with animation
const InsightCard = ({
  icon: Icon,
  title,
  value,
  color = "text-zen-primary",
  bgColor = "bg-zen-primary/10",
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  color?: string;
  bgColor?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.02, x: 4 }}
    className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
  >
    <motion.div 
      whileHover={{ rotate: 10 }}
      className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}
    >
      <Icon className={`w-5 h-5 ${color}`} />
    </motion.div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="font-bold text-gray-900 text-lg">{value}</p>
    </div>
    <ArrowUpRight className="w-4 h-4 text-gray-300" />
  </motion.div>
);

// Session item with animation
const SessionItem = ({
  session,
  index,
}: {
  session: Session;
  index: number;
}) => {
  const tagColors: Record<string, string> = {
    "Coding": "from-blue-500 to-indigo-500",
    "Study": "from-violet-500 to-purple-500",
    "Reading": "from-emerald-500 to-teal-500",
    "Deep Work": "from-amber-500 to-orange-500",
    "Planning": "from-rose-500 to-pink-500",
    "Writing": "from-cyan-500 to-sky-500",
  };
  
  const tagEmojis: Record<string, string> = {
    "Coding": "💻",
    "Study": "📚",
    "Reading": "📖",
    "Deep Work": "⚡",
    "Planning": "📋",
    "Writing": "✍️",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: 4, backgroundColor: "rgba(16, 185, 129, 0.05)" }}
      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-zen-primary/30 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tagColors[session.tag] || "from-gray-400 to-gray-500"} flex items-center justify-center text-xl shadow-lg`}
        >
          {tagEmojis[session.tag] || "🎯"}
        </motion.div>
        <div>
          <p className="font-semibold text-gray-900 group-hover:text-zen-primary transition-colors">{session.tag}</p>
          <p className="text-sm text-gray-400">
            {new Date(session.date).toLocaleDateString("en-US", { 
              weekday: "short", 
              month: "short", 
              day: "numeric" 
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900 text-lg">{formatDuration(session.duration)}</p>
        <p className="text-xs text-gray-400">session</p>
      </div>
    </motion.div>
  );
};

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { stats } = useSettings();
  const [period, setPeriod] = useState("week");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const sessionsQuery = query(
      collection(db, "sessions"),
      where("userId", "==", user.uid),
      orderBy("startTime", "desc")
    );

    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const sessionList: Session[] = snapshot.docs.map(doc => {
        const data = doc.data();
        const date = data.startTime.toDate ? data.startTime.toDate() : new Date(data.startTime);
        return {
          id: doc.id,
          date: date.toISOString().split("T")[0],
          duration: Math.floor(data.duration / 60), // convert seconds to minutes
          tag: data.tag,
          timestamp: date.getTime(),
        };
      });
      setSessions(sessionList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, router]);

  const dailyFocus = useMemo(() => {
    const daily: Record<string, DailyFocus> = {};
    sessions.forEach(s => {
      if (!daily[s.date]) {
        daily[s.date] = { date: s.date, minutes: 0, sessions: 0 };
      }
      daily[s.date].minutes += s.duration;
      daily[s.date].sessions += 1;
    });
    return daily;
  }, [sessions]);

  const calculatedStats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const todayFocus = dailyFocus[todayStr]?.minutes || 0;
    
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    let weekTotal = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      weekTotal += dailyFocus[dateStr]?.minutes || 0;
    }

    let streak = 0;
    const checkDate = new Date(today);
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (dailyFocus[dateStr]?.minutes > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const recentSessions = sessions.slice(0, 30);
    const avgSession = recentSessions.length > 0
      ? Math.round(recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length)
      : 0;

    const goal = todayFocus >= 120 ? 100 : Math.round((todayFocus / 120) * 100);

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    let lastWeekTotal = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(lastWeekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      lastWeekTotal += dailyFocus[dateStr]?.minutes || 0;
    }

    const weekChange = lastWeekTotal > 0 
      ? Math.round(((weekTotal - lastWeekTotal) / lastWeekTotal) * 100)
      : 0;

    return { todayFocus, weekTotal, streak, avgSession, goal, weekChange };
  }, [dailyFocus, sessions]);

  const weeklyChartData = useMemo(() => {
    const today = new Date();
    const data = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayIndex = date.getDay();
      const isToday = i === 0;
      
      data.push({
        day: dayNames[dayIndex],
        minutes: dailyFocus[dateStr]?.minutes || 0,
        date: dateStr,
        isToday,
      });
    }
    
    return data;
  }, [dailyFocus]);

  const insights = useMemo(() => {
    const result = [];

    const morningFocus = sessions.filter(s => {
      const hour = new Date(s.timestamp).getHours();
      return hour >= 6 && hour < 12;
    }).length;
    const afternoonFocus = sessions.filter(s => {
      const hour = new Date(s.timestamp).getHours();
      return hour >= 12 && hour < 18;
    }).length;
    const eveningFocus = sessions.filter(s => {
      const hour = new Date(s.timestamp).getHours();
      return hour >= 18 || hour < 6;
    }).length;

    let bestTime = "6 AM - 12 PM";
    let bestIcon = Sun;
    let bestColor = "text-amber-500";
    let bestBg = "bg-amber-100";
    if (afternoonFocus > morningFocus && afternoonFocus > eveningFocus) {
      bestTime = "12 PM - 6 PM";
      bestIcon = Coffee;
      bestColor = "text-orange-500";
      bestBg = "bg-orange-100";
    } else if (eveningFocus > morningFocus && eveningFocus > afternoonFocus) {
      bestTime = "6 PM - 12 AM";
      bestIcon = Moon;
      bestColor = "text-indigo-500";
      bestBg = "bg-indigo-100";
    }

    result.push({
      icon: bestIcon,
      title: "Peak Performance",
      value: bestTime,
      color: bestColor,
      bgColor: bestBg,
    });

    const longestSession = sessions.reduce((max, s) => s.duration > max ? s.duration : max, 0);
    result.push({
      icon: Zap,
      title: "Personal Record",
      value: formatDuration(longestSession),
      color: "text-violet-500",
      bgColor: "bg-violet-100",
    });

    if (calculatedStats.weekChange !== 0) {
      result.push({
        icon: TrendingUp,
        title: "Weekly Trend",
        value: `${calculatedStats.weekChange > 0 ? "+" : ""}${calculatedStats.weekChange}%`,
        color: calculatedStats.weekChange > 0 ? "text-green-500" : "text-red-500",
        bgColor: calculatedStats.weekChange > 0 ? "bg-green-100" : "bg-red-100",
      });
    }

    const tagCounts: Record<string, number> = {};
    sessions.forEach(s => {
      tagCounts[s.tag] = (tagCounts[s.tag] || 0) + s.duration;
    });
    const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
    if (topTag) {
      result.push({
        icon: Brain,
        title: "Favorite Activity",
        value: topTag[0],
        color: "text-blue-500",
        bgColor: "bg-blue-100",
      });
    }

    result.push({
      icon: Award,
      title: "Total Lifetime",
      value: formatDuration(stats.totalFocusTime || Object.values(dailyFocus).reduce((sum, d) => sum + d.minutes, 0)),
      color: "text-pink-500",
      bgColor: "bg-pink-100",
    });

    return result;
  }, [sessions, calculatedStats.weekChange, stats.totalFocusTime, dailyFocus]);

  const recentSessions = useMemo(() => sessions.slice(0, 8), [sessions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-10 h-10 text-zen-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-zen-primary/5 to-emerald-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/20 to-violet-100/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-xl bg-white text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 shadow-sm transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-zen-primary" />
                  <h1 className="font-bold text-gray-900 text-xl">Analytics</h1>
                </div>
                <p className="text-xs text-gray-500">Track your focus journey</p>
              </div>
            </div>

            {/* Period Filter */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 shadow-sm transition-all text-sm font-semibold text-gray-700"
              >
                <Calendar className="w-4 h-4 text-zen-primary" />
                {TIME_PERIODS.find(p => p.value === period)?.label}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showPeriodDropdown ? "rotate-180" : ""}`} />
              </motion.button>

              <AnimatePresence>
                {showPeriodDropdown && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setShowPeriodDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden"
                    >
                      {TIME_PERIODS.map((p) => (
                        <motion.button
                          key={p.value}
                          whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.05)", x: 4 }}
                          onClick={() => {
                            setPeriod(p.value);
                            setShowPeriodDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3 ${
                            period === p.value ? "text-zen-primary font-semibold bg-zen-primary/5" : "text-gray-600"
                          }`}
                        >
                          {period === p.value && <div className="w-2 h-2 rounded-full bg-zen-primary" />}
                          <span className={period !== p.value ? "ml-5" : ""}>{p.label}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-zen-primary" />
            <h2 className="font-semibold text-gray-700">Overview</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={Clock}
              label="Today's Focus"
              value={formatDuration(calculatedStats.todayFocus)}
              gradient="from-zen-primary to-emerald-400"
              bgGradient="from-emerald-50 to-teal-50"
              delay={0}
            />
            <StatCard
              icon={Calendar}
              label="This Week"
              value={formatDuration(calculatedStats.weekTotal)}
              trend={calculatedStats.weekChange !== 0 ? (calculatedStats.weekChange > 0 ? "up" : "down") : null}
              subValue={calculatedStats.weekChange !== 0 ? `${Math.abs(calculatedStats.weekChange)}%` : undefined}
              gradient="from-blue-500 to-indigo-500"
              bgGradient="from-blue-50 to-indigo-50"
              delay={0.05}
            />
            <StatCard
              icon={Flame}
              label="Current Streak"
              value={`${calculatedStats.streak} days`}
              gradient="from-orange-500 to-amber-500"
              bgGradient="from-orange-50 to-amber-50"
              delay={0.1}
            />
            <StatCard
              icon={Target}
              label="Daily Goal"
              value={`${calculatedStats.goal}%`}
              subValue="2h target"
              gradient="from-violet-500 to-purple-500"
              bgGradient="from-violet-50 to-purple-50"
              delay={0.15}
            />
            <StatCard
              icon={Timer}
              label="Avg Session"
              value={formatDuration(calculatedStats.avgSession)}
              gradient="from-pink-500 to-rose-500"
              bgGradient="from-pink-50 to-rose-50"
              delay={0.2}
            />
          </div>
        </motion.div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-black/[0.03] border border-gray-100 p-6 mb-8 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zen-primary to-emerald-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Weekly Focus</h2>
                <p className="text-sm text-gray-500">Minutes focused per day</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-zen-primary to-emerald-400" />
              <span className="text-gray-500">Focus time</span>
            </div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(value) => `${value}m`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#colorGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-black/[0.03] border border-gray-100 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Focus Activity</h2>
                <p className="text-sm text-gray-500">Your consistency over time</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Less</span>
              <div className="flex gap-1">
                {["bg-gray-100", "bg-emerald-200", "bg-emerald-300", "bg-emerald-400", "bg-emerald-500", "bg-emerald-600"].map((c, i) => (
                  <div key={i} className={`w-4 h-4 rounded-[4px] ${c}`} />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
          
          <div className="overflow-x-auto pb-2">
            <FocusHeatmap dailyFocus={dailyFocus} />
          </div>
        </motion.div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-black/[0.03] border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Recent Sessions</h2>
                <p className="text-sm text-gray-500">Your focus history</p>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {recentSessions.length > 0 ? (
                recentSessions.map((session, index) => (
                  <SessionItem key={session.id} session={session} index={index} />
                ))
              ) : (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Clock className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-gray-400 font-medium">No sessions yet</p>
                  <p className="text-sm text-gray-300">Start a focus session to see history</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-black/[0.03] border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Insights</h2>
                <p className="text-sm text-gray-500">Patterns & achievements</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {insights.map((insight, index) => (
                <InsightCard
                  key={index}
                  icon={insight.icon}
                  title={insight.title}
                  value={insight.value}
                  color={insight.color}
                  bgColor={insight.bgColor}
                  delay={0.45 + index * 0.05}
                />
              ))}
            </div>

            {/* Motivational Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-zen-primary to-emerald-500 text-white"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/10 rounded-full"
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">Keep it up!</span>
                </div>
                <p className="text-white/90 text-sm">
                  {calculatedStats.streak > 3 
                    ? `Amazing ${calculatedStats.streak}-day streak! You're building unstoppable momentum.`
                    : calculatedStats.todayFocus > 60
                    ? "Great focus today! Every session brings you closer to your goals."
                    : "Every minute of focus counts. Small steps lead to big achievements!"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center py-10 mt-8"
        >
          <p className="text-sm text-gray-400">
            🔒 All data stored locally on your device
          </p>
        </motion.div>
      </main>
    </div>
  );
}
