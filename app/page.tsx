"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Play,
  ArrowRight,
  Shield,
  BarChart3,
  Heart,
  Check,
  Leaf,
  Sparkles,
  TrendingUp,
  Bell,
  Zap,
  Menu,
  X,
  Star,
  TabletSmartphone,
  BellRing,
  BrainCog,
  ScrollText,
  Timer,
  Battery,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zen overflow-x-hidden">
      <Header />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DashboardSection />
      <SocialProofSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}

/* ==================== HEADER ==================== */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = ["Features", "Method", "Pricing"];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-black/[0.03] border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="zen-container">
          <nav className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-zen-primary rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-zen-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-zen-primary/25">
                  <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-foreground">Zen</span>
                  <span className="bg-gradient-to-r from-zen-primary to-emerald-400 bg-clip-text text-transparent">
                    Flow
                  </span>
                </span>
                <span className="text-[10px] text-zen-muted font-medium tracking-widest uppercase -mt-0.5 hidden sm:block">
                  Focus & Flow
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="relative px-5 py-2 text-sm font-medium text-zen-secondary hover:text-foreground transition-colors group"
                >
                  {item}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-zen-primary to-emerald-400 rounded-full group-hover:w-8 transition-all duration-300" />
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:block text-sm font-medium text-zen-secondary hover:text-foreground transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              
              <Link
                href="/signup"
                className="relative inline-flex items-center gap-2 bg-gradient-to-r from-zen-primary to-emerald-400 text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-lg shadow-zen-primary/25 hover:shadow-xl hover:shadow-zen-primary/30 hover:scale-[1.02] transition-all duration-200"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-20 z-40 md:hidden"
          >
            <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-xl">
              <div className="zen-container py-6">
                <div className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-foreground px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      {item}
                    </a>
                  ))}
                  <div className="h-px bg-gray-200 my-2" />
                  <Link
                    href="/login"
                    className="text-lg font-medium text-zen-secondary px-4 py-2"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ==================== HERO SECTION ==================== */
function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8FFF3] via-[#F0FDF7] to-white" />
        
        {/* Animated gradient orbs - using CSS animations for performance */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-zen-primary/25 via-emerald-300/15 to-transparent rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-teal-300/20 to-transparent rounded-full blur-3xl animate-float-slower" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-t from-emerald-200/25 to-transparent rounded-full blur-3xl animate-float-slow" />

        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="zen-container relative">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-zen-primary/20 mb-10 shadow-lg shadow-zen-primary/5"
          >
            <Sparkles className="w-4 h-4 text-zen-primary animate-spin-slow" />
            <span className="text-sm font-semibold text-zen-primary tracking-wide uppercase">
              Your Flow State Awaits
            </span>
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          </motion.div>

          {/* Headlines */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]">
              <span className="block text-foreground mb-2">Focus deeply.</span>
              <span className="block bg-gradient-to-r from-zen-primary via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Work calmly.
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-zen-secondary max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            The all-in-one digital detox companion designed to reclaim your
            time, sharpen your focus, and restore your digital balance.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            {/* Primary CTA */}
            <Link
              href="/signup"
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-zen-primary to-emerald-400 text-white font-semibold px-10 py-5 rounded-full shadow-xl shadow-zen-primary/25 hover:shadow-2xl hover:shadow-zen-primary/30 hover:scale-[1.02] transition-all duration-200 text-lg"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-zen-primary to-emerald-400 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity -z-10" />
              Start Your Journey
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>

            {/* Secondary CTA */}
            <Link
              href="#demo"
              className="inline-flex items-center gap-3 bg-white text-foreground font-semibold px-10 py-5 rounded-full border-2 border-gray-200 hover:border-zen-primary/30 hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl text-lg group"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zen-primary/10 text-zen-primary group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 ml-0.5" />
              </span>
              Watch Demo
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex items-center justify-center gap-6 mt-12"
          >
            <div className="flex -space-x-3">
              {[
                '#10B981',
                '#3B82F6', 
                '#8B5CF6',
                '#EC4899',
                '#F59E0B'
              ].map((color, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${color}40, ${color}70)`,
                  }}
                />
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-zen-secondary">
                <span className="font-semibold text-foreground">50,000+</span> focused minds
              </p>
            </div>
          </motion.div>

          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative mt-20 md:mt-28 mx-auto"
          >
            {/* Phone Container */}
            <div className="relative max-w-[320px] mx-auto animate-float">
              {/* Phone Frame */}
              <div className="relative bg-gray-900 rounded-[48px] p-3 shadow-2xl shadow-black/30">
                {/* Camera notch */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-20 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-800" />
                  <div className="w-3 h-3 rounded-full bg-gray-800 ring-1 ring-gray-700" />
                </div>
                
                {/* Phone Screen */}
                <div className="bg-gradient-to-b from-[#F0FDF4] to-white rounded-[40px] overflow-hidden relative" style={{ aspectRatio: '9/19' }}>
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-7 py-3 pt-10">
                    <span className="text-sm font-semibold text-foreground">9:41</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        <div className="w-1 h-2 bg-foreground rounded-full" />
                        <div className="w-1 h-3 bg-foreground rounded-full" />
                        <div className="w-1 h-2 bg-foreground rounded-full" />
                        <div className="w-1 h-4 bg-foreground rounded-full" />
                      </div>
                      <div className="w-6 h-3 bg-foreground rounded-sm relative ml-1">
                        <div className="absolute right-[-2px] top-1/2 -translate-y-1/2 w-[3px] h-[6px] bg-foreground rounded-r-sm" />
                      </div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="px-5 pt-1">
                    {/* App Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zen-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-zen-primary/30">
                          <Leaf className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-foreground">ZenFlow</span>
                          <p className="text-[10px] text-zen-muted">Focus & Flow</p>
                        </div>
                      </div>
                      <div className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-gray-500" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-zen-primary rounded-full border-2 border-[#F0FDF4]" />
                      </div>
                    </div>

                    {/* Timer Display */}
                    <div className="text-center mb-5">
                      <p className="text-xs text-zen-secondary mb-2.5 font-medium">Deep Focus Session</p>
                      <div className="relative w-36 h-36 mx-auto">
                        {/* Background ring */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="6"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="url(#timerGradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray="264"
                            strokeDashoffset="66"
                            className="animate-progress"
                          />
                          <defs>
                            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10B981" />
                              <stop offset="100%" stopColor="#34D399" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div>
                            <div className="text-3xl font-bold text-foreground">25:00</div>
                            <div className="text-[10px] text-zen-muted uppercase tracking-wider">
                              remaining
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-2.5 mb-4">
                      <div className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                        <div className="text-[10px] text-zen-muted mb-0.5">Today</div>
                        <div className="text-base font-bold text-foreground">2h 45m</div>
                      </div>
                      <div className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                        <div className="text-[10px] text-zen-muted mb-0.5">Streak</div>
                        <div className="text-base font-bold text-foreground flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />7
                        </div>
                      </div>
                    </div>

                    {/* Start Button */}
                    <button className="w-full bg-gradient-to-r from-zen-primary to-emerald-400 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-zen-primary/25 text-sm">
                      Start Focus Session
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -left-4 md:-left-28 top-1/4 hidden md:block animate-float-card">
              <div className="bg-white rounded-2xl p-4 shadow-xl shadow-black/8 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">Productivity up!</div>
                    <div className="text-xs text-zen-muted">+23% this week</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 md:-right-24 top-1/3 hidden md:block animate-float-card-delayed">
              <div className="bg-white rounded-2xl p-4 shadow-xl shadow-black/8 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">Goal reached!</div>
                    <div className="text-xs text-zen-muted">4h focus today</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -left-2 md:-left-16 bottom-1/4 hidden md:block animate-float-card-slow">
              <div className="bg-white rounded-2xl p-3 shadow-xl shadow-black/8 border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">7 day streak!</div>
                    <div className="text-xs text-zen-muted">Keep it up 🔥</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[400px] h-[400px] border border-zen-primary/10 rounded-full animate-spin-very-slow" />
            </div>
            <div className="absolute -z-10 inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[500px] h-[500px] border border-dashed border-zen-primary/5 rounded-full animate-spin-reverse-slow" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ==================== PROBLEM SECTION ==================== */
function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const problems = [
    {
      icon: TabletSmartphone,
      title: "Social media distractions",
      description: "One quick scroll turns into an hour. Your focus doesn't stand a chance against endless feeds.",
      emoji: "📱",
      color: "from-red-500 to-rose-500",
      bgColor: "from-red-50 to-rose-50",
      borderColor: "border-red-100",
    },
    {
      icon: Timer,
      title: "No focus tracking",
      description: "You work all day but can't tell where your time went. Deep work feels like a myth.",
      emoji: "⏰",
      color: "from-amber-500 to-orange-500",
      bgColor: "from-amber-50 to-orange-50",
      borderColor: "border-amber-100",
    },
    {
      icon: Battery,
      title: "Burnout",
      description: "Always connected, never recharged. You're exhausted but can't seem to unplug.",
      emoji: "🔋",
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-50 to-violet-50",
      borderColor: "border-purple-100",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-white relative overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #EF4444 1px, transparent 0)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="zen-container relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-medium mb-6"
          >
            Sound familiar? 🤔
          </motion.span>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            <span className="block">Too many tabs?</span>
            <span className="block text-zen-secondary">Constant notifications?</span>
            <span className="block bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
              Hard to focus?
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-zen-secondary leading-relaxed">
            You're not alone. The modern digital world is designed to grab your attention—and never let go.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.2 + index * 0.15,
              }}
              className={`relative group`}
            >
              <div className={`h-full bg-gradient-to-br ${problem.bgColor} rounded-3xl p-8 border ${problem.borderColor} hover:shadow-xl hover:shadow-black/5 hover:-translate-y-2 transition-all duration-300`}>
                {/* X mark */}
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <span className="text-red-500 font-bold text-lg">✕</span>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${problem.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <problem.icon className="w-8 h-8 text-white" />
                </div>

                {/* Emoji accent */}
                <div className="text-4xl mb-4">{problem.emoji}</div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {problem.title}
                </h3>
                <p className="text-zen-secondary leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center mt-16"
        >
          <p className="text-xl md:text-2xl font-medium text-foreground mb-2">
            It doesn&apos;t have to be this way.
          </p>
          <p className="text-zen-secondary text-lg">
            There&apos;s a better path to <span className="text-zen-primary font-semibold">focus and flow</span>.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ==================== FEATURES SECTION ==================== */
function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Timer,
      title: "Focus Timer",
      description: "Pomodoro-style sessions that help you enter deep focus mode effortlessly.",
      iconBg: "from-zen-primary to-emerald-400",
    },
    {
      icon: Shield,
      title: "Website Blocker",
      description: "Block distracting sites and apps during focus sessions automatically.",
      iconBg: "from-blue-500 to-indigo-500",
    },
    {
      icon: BarChart3,
      title: "Deep Work Tracking",
      description: "See exactly where your time goes with beautiful, insightful analytics.",
      iconBg: "from-violet-500 to-purple-500",
    },
    {
      icon: Heart,
      title: "Smart Breaks",
      description: "Gentle reminders to rest, breathe, and recharge between sessions.",
      iconBg: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-24 md:py-32 bg-gradient-to-b from-white to-gray-50/50 relative"
    >
      <div className="zen-container relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zen-primary/10 text-zen-primary text-sm font-semibold mb-6">
            <Check className="w-4 h-4" />
            Everything you need
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
            Built for focus,{" "}
            <span className="bg-gradient-to-r from-zen-primary to-emerald-400 bg-clip-text text-transparent">
              designed for calm
            </span>
          </h2>
          <p className="text-lg text-zen-secondary">
            Simple, powerful tools to help you work deeper and feel better.
          </p>
        </motion.div>

        {/* Features Grid - 2x2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              className="group"
            >
              <div className="h-full bg-white rounded-2xl p-6 border border-gray-100 hover:border-zen-primary/20 hover:shadow-xl hover:shadow-zen-primary/5 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <Check className="w-4 h-4 text-zen-primary" />
                    </div>
                    <p className="text-zen-secondary text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== HOW IT WORKS SECTION ==================== */
function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const steps = [
    {
      number: "01",
      title: "Start a focus session",
      description: "Choose your duration and hit start. That's it.",
      icon: Play,
      color: "from-zen-primary to-emerald-400",
    },
    {
      number: "02",
      title: "We block distractions",
      description: "Automatically silence the noise so you can work.",
      icon: Shield,
      color: "from-blue-500 to-indigo-500",
    },
    {
      number: "03",
      title: "Track your progress",
      description: "See your focus time grow day by day.",
      icon: BarChart3,
      color: "from-violet-500 to-purple-500",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-white relative overflow-hidden"
    >
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white" />

      <div className="zen-container relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-foreground text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-zen-primary" />
            Simple as 1-2-3
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            How it works
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line - desktop only */}
          <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-zen-primary via-blue-500 to-violet-500 opacity-20" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                }}
                className="text-center"
              >
                {/* Step Number & Icon */}
                <div className="relative inline-flex flex-col items-center mb-6">
                  {/* Background circle */}
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl mb-4`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  {/* Number badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-100">
                    <span className="text-sm font-bold text-foreground">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-zen-secondary">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-foreground text-white font-semibold px-8 py-4 rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
          >
            Get started for free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ==================== DASHBOARD SECTION ==================== */
function DashboardSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const checkItems = [
    "Real-time attention heatmaps",
    "Automated \"Do Not Disturb\" sync",
    "Sync across your phone, tablet, and desktop with ease.",
  ];

  return (
    <section
      ref={sectionRef}
      id="method"
      className="py-24 md:py-32 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="zen-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/10 border border-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-zen-muted mb-1">Weekly Focus Overview</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-bold text-foreground">
                      4h 12m
                    </span>
                    <span className="text-sm text-zen-primary font-medium bg-zen-primary/10 px-2 py-0.5 rounded-full">
                      +12%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zen-primary/10 to-emerald-50 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-zen-primary" />
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zen-secondary">Daily Goal</span>
                    <span className="font-medium text-foreground">85%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "85%" } : {}}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-zen-primary to-emerald-400 rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zen-secondary">Weekly Sessions</span>
                    <span className="font-medium text-foreground">24/30</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "80%" } : {}}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Achievement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100"
              >
                <div className="w-10 h-10 rounded-xl bg-zen-primary flex items-center justify-center shadow-lg shadow-zen-primary/30">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    You&apos;ve successfully avoided 14 distractions today.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-6">
              Your dashboard for
              <br />
              <span className="bg-gradient-to-r from-zen-primary to-emerald-400 bg-clip-text text-transparent">
                mental clarity.
              </span>
            </h2>
            <p className="text-lg text-zen-secondary mb-8 leading-relaxed">
              Everything you need to maintain screentime awareness. We don&apos;t just block
              apps. We help you understand your cognitive rhythms to build
              lasting habits.
            </p>

            {/* Check Items */}
            <ul className="space-y-4">
              {checkItems.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zen-primary/20 to-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-zen-primary" />
                  </div>
                  <span className="text-zen-secondary">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ==================== SOCIAL PROOF SECTION ==================== */
function SocialProofSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const testimonials = [
    {
      quote: "Helped me focus 3x better while coding. I finally finish my tasks without getting lost in YouTube.",
      name: "Alex Chen",
      role: "Software Developer",
      avatar: "AC",
      color: "from-blue-500 to-indigo-500",
    },
    {
      quote: "My screen time dropped by 4 hours a day. ZenFlow gave me my evenings back.",
      name: "Sarah Miller",
      role: "UX Designer",
      avatar: "SM",
      color: "from-rose-500 to-pink-500",
    },
    {
      quote: "The focus timer changed everything. I wrote my entire book draft in 3 months.",
      name: "James Wilson",
      role: "Writer & Creator",
      avatar: "JW",
      color: "from-violet-500 to-purple-500",
    },
  ];

  const stats = [
    { value: "50K+", label: "Focused minds" },
    { value: "2M+", label: "Hours of deep work" },
    { value: "4.9", label: "App Store rating" },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      <div className="zen-container relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zen-primary/10 text-zen-primary text-sm font-semibold mb-6">
            <Heart className="w-4 h-4" />
            Loved by thousands
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
            Real people,{" "}
            <span className="bg-gradient-to-r from-zen-primary to-emerald-400 bg-clip-text text-transparent">
              real results
            </span>
          </h2>
          <p className="text-lg text-zen-secondary">
            Join thousands who&apos;ve reclaimed their focus and transformed their digital habits.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mb-16"
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-zen-primary to-emerald-400 bg-clip-text text-transparent mb-1"
              >
                {stat.value}
              </motion.div>
              <p className="text-sm md:text-base text-zen-secondary">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.3 + index * 0.1,
              }}
              className="group"
            >
              <div className="h-full bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-black/[0.03] hover:shadow-xl hover:shadow-black/[0.05] hover:-translate-y-1 transition-all duration-300">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-zen-muted text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-16 text-zen-muted"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm">Privacy-first</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span className="text-sm">No ads, ever</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            <span className="text-sm">Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ==================== PRICING SECTION ==================== */
function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const plans = [
    {
      name: "Essential",
      price: "$0",
      period: "forever",
      description: "Perfect for individuals starting their detox journey.",
      features: [
        "3 focus presets",
        "Basic hour tracking",
        "Desktop app",
      ],
      cta: "Start for Free",
      popular: false,
    },
    {
      name: "Pro Focus",
      price: "$8",
      period: "/month",
      description: "Unlock full productivity and deep focus features.",
      features: [
        "Unlimited focus presets",
        "Advanced analytics + insights",
        "Cross-device sync",
        "Custom website blocking rules",
      ],
      cta: "Upgrade",
      popular: true,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="py-24 md:py-32 bg-white"
    >
      <div className="zen-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-zen-primary uppercase tracking-wider mb-4">
            <span className="w-8 h-0.5 bg-zen-primary rounded-full" />
            Pricing
            <span className="w-8 h-0.5 bg-zen-primary rounded-full" />
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Simple pricing for a clearer mind
          </h2>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
              }}
              className={`relative h-full rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? "bg-white border-zen-primary/30 shadow-xl shadow-zen-primary/10"
                  : "bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 bg-gradient-to-r from-zen-primary to-emerald-400 text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-lg shadow-zen-primary/30">
                    Recommended
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-zen-secondary">{plan.period}</span>
                </div>
                <p className="text-zen-secondary mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-zen-primary/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-zen-primary" />
                    </div>
                    <span className="text-zen-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-2xl font-semibold transition-all duration-200 hover:scale-[1.02] ${
                  plan.popular
                    ? "bg-gradient-to-r from-zen-primary to-emerald-400 text-white shadow-lg shadow-zen-primary/30 hover:shadow-xl hover:shadow-zen-primary/40"
                    : "bg-white text-foreground border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== FINAL CTA SECTION ==================== */
function FinalCTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 relative overflow-hidden"
    >
      {/* Mint gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E8FFF3] via-[#D1FAE5] to-[#A7F3D0]" />
      
      {/* Decorative orbs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-zen-primary/20 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl animate-float-slower" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/30 rounded-full blur-3xl" />

      <div className="zen-container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-xl shadow-zen-primary/20 mb-8"
          >
            <Leaf className="w-10 h-10 text-zen-primary" />
          </motion.div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-6">
            Ready to focus better?
          </h2>
          
          <p className="text-lg md:text-xl text-zen-secondary mb-10 max-w-xl mx-auto">
            Join 50,000+ people who&apos;ve transformed their relationship with technology.
          </p>

          {/* Big CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/signup"
              className="group relative inline-flex items-center gap-3 bg-foreground text-white font-bold text-lg md:text-xl px-10 md:px-14 py-5 md:py-6 rounded-full shadow-2xl shadow-black/20 hover:shadow-3xl hover:scale-[1.02] transition-all duration-200"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 rounded-full" />
              <span className="relative">Start Free Today</span>
              <span className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
          </motion.div>

          {/* Trust note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 text-sm text-zen-secondary"
          >
            Free forever • No credit card required • Setup in 2 minutes
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

/* ==================== FOOTER ==================== */
function Footer() {
  const footerLinks = {
    Product: ["Features", "Integrations", "Pricing"],
    Company: ["About", "Privacy", "Terms"],
    Social: ["Twitter", "LinkedIn", "Instagram"],
  };

  return (
    <footer className="py-16 bg-gray-50 border-t border-gray-100">
      <div className="zen-container">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zen-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-zen-primary/30">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">Zen</span>
                <span className="text-xl font-bold bg-gradient-to-r from-zen-primary to-emerald-400 bg-clip-text text-transparent">Flow</span>
              </div>
            </Link>
            <p className="text-zen-secondary max-w-xs leading-relaxed">
              Empowering individuals to find their focus in a distracted world. Focus deeply. Work calmly.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-zen-secondary hover:text-zen-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zen-muted">
            © 2026 ZenFlow, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-zen-muted">
            <Leaf className="w-4 h-4 text-zen-primary" />
            <span>Made with mindfulness</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
