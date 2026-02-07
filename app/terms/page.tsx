"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Leaf, Shield, FileText, Scale } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  const lastUpdated = "February 7, 2026";

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing or using ZenFlow ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service. We reserve the right to modify these terms at any time, and your continued use of the Service constitutes acceptance of any changes.`
    },
    {
      title: "2. Description of Service",
      content: `ZenFlow is a productivity and focus management application designed to help users improve their concentration, manage their time effectively, and track their productivity progress. The Service includes features such as focus timers, analytics, site blocking, and wellness reminders.`
    },
    {
      title: "3. User Accounts",
      content: `To access certain features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating your account and to update this information as needed.`
    },
    {
      title: "4. User Conduct",
      content: `You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to: use the Service in any way that violates applicable laws; attempt to gain unauthorized access to other user accounts or our systems; interfere with or disrupt the Service or servers; or use the Service to transmit harmful code or content.`
    },
    {
      title: "5. Intellectual Property",
      content: `The Service and its original content, features, and functionality are owned by ZenFlow and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on the Service without our express written permission.`
    },
    {
      title: "6. Data and Privacy",
      content: `Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to the collection and use of information as described in our Privacy Policy. We are committed to protecting your personal data and maintaining your privacy.`
    },
    {
      title: "7. Subscription and Payments",
      content: `Certain features of the Service may require a paid subscription. Payment terms will be presented at the time of purchase. Subscriptions automatically renew unless cancelled before the renewal date. Refunds are provided in accordance with our refund policy.`
    },
    {
      title: "8. Disclaimer of Warranties",
      content: `The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free. We disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.`
    },
    {
      title: "9. Limitation of Liability",
      content: `To the maximum extent permitted by law, ZenFlow shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the twelve months preceding the claim.`
    },
    {
      title: "10. Termination",
      content: `We reserve the right to terminate or suspend your account at any time, with or without cause or notice. Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive.`
    },
    {
      title: "11. Contact Us",
      content: `If you have any questions about these Terms of Service, please contact us at support@zenflow.app. We will make every effort to respond to your inquiry promptly.`
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-500">
              Last updated: {lastUpdated}
            </p>
          </div>

          {/* Quick summary */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-10">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Scale className="w-6 h-6 text-zen-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Quick Summary</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  By using ZenFlow, you agree to use our service responsibly and legally. 
                  We provide a focus and productivity tool &quot;as is&quot; and protect your data 
                  according to our Privacy Policy. You own your data, and we respect your privacy.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {section.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Questions about our terms? Contact us at{" "}
              <a href="mailto:support@zenflow.app" className="text-zen-primary hover:underline">
                support@zenflow.app
              </a>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
