import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "ZenFlow – Digital Detox & Focus Tracker",
    template: "%s | ZenFlow",
  },
  description:
    "Focus deeply. Work calmly. ZenFlow helps you reduce distractions, track productive hours, and maintain healthy focus habits with a calm, mindful experience.",
  keywords: [
    "focus timer",
    "pomodoro",
    "productivity",
    "digital detox",
    "deep work",
    "focus tracker",
    "distraction blocker",
    "wellness",
    "mindfulness",
    "remote work",
  ],
  authors: [{ name: "ZenFlow" }],
  creator: "ZenFlow",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ZenFlow",
    title: "ZenFlow – Digital Detox & Focus Tracker",
    description:
      "Focus deeply. Work calmly. Reduce distractions and track your productive hours.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZenFlow – Digital Detox & Focus Tracker",
    description: "Focus deeply. Work calmly.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#10B981" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
