"use client";

// Empty State Components
// Beautiful placeholders when there's no data

import { motion } from 'framer-motion';
import { 
  Timer, 
  BarChart3, 
  Shield, 
  Settings, 
  Flame,
  Target,
  Calendar,
  Clock,
  Sparkles,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  const ActionButton = action?.href ? Link : 'button';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      {icon && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center mb-6 text-emerald-500"
        >
          {icon}
        </motion.div>
      )}
      
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {description}
      </p>
      
      {action && (
        <ActionButton
          href={action.href || "#"}
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </ActionButton>
      )}
    </motion.div>
  );
}

// Pre-built empty states for common scenarios
export function EmptySessionsState() {
  return (
    <EmptyState
      icon={<Timer className="w-10 h-10" />}
      title="Start Your First Focus Session"
      description="Begin your productivity journey by starting a focus session. Track your time and build healthy work habits."
      action={{
        label: "Start Focusing",
        href: "/focus",
      }}
    />
  );
}

export function EmptyAnalyticsState() {
  return (
    <EmptyState
      icon={<BarChart3 className="w-10 h-10" />}
      title="No Analytics Yet"
      description="Complete some focus sessions to see your productivity stats, streaks, and progress over time."
      action={{
        label: "Start a Session",
        href: "/focus",
      }}
    />
  );
}

export function EmptyBlockerState({ onAddSite }: { onAddSite?: () => void }) {
  return (
    <EmptyState
      icon={<Shield className="w-10 h-10" />}
      title="No Blocked Sites Yet"
      description="Add distracting websites to your blocklist to stay focused during work sessions."
      action={{
        label: "Add Your First Site",
        onClick: onAddSite,
      }}
    />
  );
}

export function EmptyStreakState() {
  return (
    <EmptyState
      icon={<Flame className="w-10 h-10" />}
      title="Build Your Streak"
      description="Focus for at least one session each day to start building your streak. Consistency is key!"
      action={{
        label: "Start Today",
        href: "/focus",
      }}
    />
  );
}

export function EmptyGoalsState({ onAddGoal }: { onAddGoal?: () => void }) {
  return (
    <EmptyState
      icon={<Target className="w-10 h-10" />}
      title="Set Your First Goal"
      description="Define daily or weekly focus goals to track your progress and stay motivated."
      action={{
        label: "Create Goal",
        onClick: onAddGoal,
      }}
    />
  );
}

export function EmptyCalendarState() {
  return (
    <EmptyState
      icon={<Calendar className="w-10 h-10" />}
      title="No Sessions This Week"
      description="Your calendar will fill up as you complete focus sessions. Each session appears as a marker."
    />
  );
}

export function EmptyRecentSessionsState() {
  return (
    <EmptyState
      icon={<Clock className="w-10 h-10" />}
      title="No Recent Sessions"
      description="Your completed focus sessions will appear here. Start focusing to build your history!"
      action={{
        label: "Start Session",
        href: "/focus",
      }}
    />
  );
}

// Minimal inline empty state
export function InlineEmptyState({ 
  message, 
  icon,
  action,
}: { 
  message: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      {icon && (
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-3 text-gray-400">
          {icon}
        </div>
      )}
      <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Success state (for completed actions)
export function SuccessState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
}) {
  const ActionButton = action?.href ? Link : 'button';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center py-12 px-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30"
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>
      
      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {description}
      </p>
      
      {action && (
        <ActionButton
          href={action.href || "#"}
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
        >
          {action.label}
        </ActionButton>
      )}
    </motion.div>
  );
}

export default {
  EmptyState,
  EmptySessionsState,
  EmptyAnalyticsState,
  EmptyBlockerState,
  EmptyStreakState,
  EmptyGoalsState,
  EmptyCalendarState,
  EmptyRecentSessionsState,
  InlineEmptyState,
  SuccessState,
};
