'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sparkles, Calendar, Layers, ArrowRight } from 'lucide-react';
import { useAuth, AuthProvider } from '@/lib/auth';

function LandingPageContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0f] text-[#f1f5f9]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-[#f1f5f9] font-sans overflow-hidden flex flex-col justify-between">
      {/* Background ambient glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-6 md:px-12 flex justify-between items-center max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            SocialSync
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition">
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/10 bg-indigo-500/5 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          AI-Powered Social Orchestra
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Harmonize Your Social Media Presence
        </h1>
        
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Compose, optimize with AI, schedule, and analyze your brand reach across Facebook, Twitter/X, and Pinterest in one unified dark-mode command center.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/register"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition active:scale-[0.98]"
          >
            Launch Free Workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-sm font-semibold transition"
          >
            Sign In with Credentials
          </Link>
        </div>

        {/* Feature widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 w-full text-left">
          {[
            { title: 'AI Assistant', desc: 'Craft tone-optimized posts and auto-generate relevant hashtags in seconds.', icon: <Sparkles className="h-5 w-5 text-indigo-400" /> },
            { title: 'Cross-Publishing', desc: 'Compose once and distribute to Facebook, Twitter, and Pinterest simultaneously.', icon: <Layers className="h-5 w-5 text-purple-400" /> },
            { title: 'Visual Calendar', desc: 'Map out campaigns using our unified monthly scheduler.', icon: <Calendar className="h-5 w-5 text-cyan-400" /> },
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] space-y-3">
              <div className="p-2 w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center">{f.icon}</div>
              <h3 className="font-bold text-white text-md">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 text-center text-xs text-slate-600">
        © 2026 SocialSync. Designed for advanced brand orchestration.
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <AuthProvider>
      <LandingPageContent />
    </AuthProvider>
  );
}
