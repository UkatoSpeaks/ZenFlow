"use client";

// Error Handling Components
// Graceful error states and error boundary

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  WifiOff, 
  AlertTriangle, 
  RefreshCw, 
  Home,
  LogIn,
  Server,
  ShieldOff,
  Bug,
} from 'lucide-react';
import Link from 'next/link';

// Error types
export type ErrorType = 'network' | 'auth' | 'server' | 'notFound' | 'forbidden' | 'generic';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeLink?: boolean;
  className?: string;
}

const ERROR_CONFIGS: Record<ErrorType, { icon: React.ElementType; title: string; message: string; color: string }> = {
  network: {
    icon: WifiOff,
    title: "Connection Lost",
    message: "Please check your internet connection and try again.",
    color: "text-amber-500",
  },
  auth: {
    icon: LogIn,
    title: "Authentication Required",
    message: "Please sign in to access this page.",
    color: "text-blue-500",
  },
  server: {
    icon: Server,
    title: "Server Error",
    message: "Something went wrong on our end. Please try again later.",
    color: "text-red-500",
  },
  notFound: {
    icon: AlertTriangle,
    title: "Not Found",
    message: "The page or resource you're looking for doesn't exist.",
    color: "text-gray-500",
  },
  forbidden: {
    icon: ShieldOff,
    title: "Access Denied",
    message: "You don't have permission to access this resource.",
    color: "text-red-500",
  },
  generic: {
    icon: Bug,
    title: "Something Went Wrong",
    message: "An unexpected error occurred. Please try again.",
    color: "text-gray-500",
  },
};

export function ErrorState({
  type = 'generic',
  title,
  message,
  onRetry,
  showHomeLink = true,
  className = "",
}: ErrorStateProps) {
  const config = ERROR_CONFIGS[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className={`w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 ${config.color}`}
      >
        <Icon className="w-10 h-10" />
      </motion.div>
      
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
        {title || config.title}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {message || config.message}
      </p>
      
      <div className="flex items-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
        
        {showHomeLink && (
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        )}
        
        {type === 'auth' && (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        )}
      </div>
    </motion.div>
  );
}

// Inline error message
export function InlineError({ 
  message, 
  onRetry,
  className = "",
}: { 
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl ${className}`}>
      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
      <p className="text-sm text-red-700 dark:text-red-300 flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-red-600 dark:text-red-400 font-medium hover:underline flex-shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// Network status indicator
export function NetworkStatus({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white py-2 px-4 text-center text-sm font-medium"
    >
      <WifiOff className="w-4 h-4 inline-block mr-2" />
      You're offline. Some features may not work.
    </motion.div>
  );
}

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <ErrorState
            type="generic"
            title="Something went wrong"
            message={this.state.error?.message || "An unexpected error occurred"}
            onRetry={this.handleRetry}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook to track network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Full page error
export function FullPageError({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <ErrorState
        type="generic"
        title={title}
        message={message}
        onRetry={onRetry}
        showHomeLink={true}
      />
    </div>
  );
}

export default {
  ErrorState,
  InlineError,
  NetworkStatus,
  ErrorBoundary,
  useNetworkStatus,
  FullPageError,
};
