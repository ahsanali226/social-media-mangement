import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SocialSync — Unified Social Media Management",
  description:
    "Compose, schedule, and analyze your brand presence across Facebook, Twitter/X, and Pinterest from one AI-powered dashboard.",
  keywords: ["social media", "dashboard", "scheduler", "AI", "Facebook", "Twitter", "Pinterest"],
  openGraph: {
    title: "SocialSync — Unified Social Media Management",
    description: "AI-powered social media orchestration for modern brands.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
