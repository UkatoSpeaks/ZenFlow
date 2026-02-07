"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Leaf, Shield, Eye, Lock, Database, Bell, Trash2, Users } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  const lastUpdated = "February 7, 2026";

  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: `We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes:`,
      list: [
        "Account information (name, email, profile picture)",
        "Focus session data (duration, categories, timestamps)",
        "App preferences and settings",
        "Device information for analytics and troubleshooting"
      ]
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: `We use the information we collect to:`,
      list: [
        "Provide, maintain, and improve our services",
        "Track your focus progress and generate insights",
        "Send you notifications and reminders (if enabled)",
        "Respond to your comments and questions",
        "Protect against fraud and abuse"
      ]
    },
    {
      icon: Lock,
      title: "Data Security",
      content: `We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. Your data is encrypted in transit and at rest using industry-standard protocols.`
    },
    {
      icon: Users,
      title: "Information Sharing",
      content: `We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:`,
      list: [
        "With your consent or at your direction",
        "With service providers who assist in our operations",
        "To comply with legal obligations",
        "To protect our rights and safety"
      ]
    },
    {
      icon: Bell,
      title: "Cookies and Tracking",
      content: `We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings. We use:`,
      list: [
        "Essential cookies for authentication and security",
        "Analytics cookies to understand usage patterns",
        "Preference cookies to remember your settings"
      ]
    },
    {
      icon: Trash2,
      title: "Data Retention and Deletion",
      content: `We retain your data for as long as your account is active or as needed to provide services. You can request deletion of your data at any time through your account settings or by contacting us. Upon deletion request, we will remove your personal data within 30 days.`
    },
    {
      icon: Shield,
      title: "Your Rights",
      content: `Depending on your location, you may have the following rights regarding your personal data:`,
      list: [
        "Access and receive a copy of your data",
        "Correct inaccurate or incomplete data",
        "Request deletion of your data",
        "Object to or restrict processing",
        "Data portability",
        "Withdraw consent at any time"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-zen-primary to-emerald-400 rounded-xl flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">ZenFlow</span>
            </Link>
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-zen-primary to-emerald-400 rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-500">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-10">
            <p className="text-gray-700 leading-relaxed">
              At ZenFlow, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our application. 
              We are committed to protecting your personal data and being transparent about what we do with it.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-zen-primary/10 rounded-xl flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-zen-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                      {section.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-3">
                      {section.content}
                    </p>
                    {section.list && (
                      <ul className="space-y-2">
                        {section.list.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-600">
                            <span className="w-1.5 h-1.5 bg-zen-primary rounded-full mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact section */}
          <div className="mt-12 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Questions About Your Privacy?
            </h2>
            <p className="text-gray-600 mb-4">
              If you have any questions or concerns about our Privacy Policy, please contact us.
            </p>
            <a 
              href="mailto:privacy@zenflow.app"
              className="inline-flex items-center gap-2 text-zen-primary font-semibold hover:text-emerald-600"
            >
              privacy@zenflow.app
            </a>
          </div>

          {/* Footer links */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              See also:{" "}
              <Link href="/terms" className="text-zen-primary hover:underline">
                Terms of Service
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
