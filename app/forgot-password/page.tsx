"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Leaf,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { resetPassword, error, clearError } = useAuth();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch {
      // Error is handled by the context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-zen-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-gradient-to-br from-zen-primary to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-zen-primary/30"
            >
              <Leaf className="w-7 h-7 text-white" />
            </motion.div>
            <span className="text-2xl font-bold text-gray-900">ZenFlow</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          {/* Back link */}
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reset your password
            </h1>
            <p className="text-gray-500">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {/* Success state */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-16 h-16 bg-zen-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-zen-primary" />
              </motion.div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-zen-primary font-semibold hover:text-emerald-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-zen-primary/20 focus:border-zen-primary transition-all"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-zen-primary to-emerald-400 text-white font-semibold rounded-2xl shadow-lg shadow-zen-primary/30 hover:shadow-xl hover:shadow-zen-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Send reset link"
                  )}
                </motion.button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
