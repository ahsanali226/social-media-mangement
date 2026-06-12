'use client';

import { useAuth, AuthProvider } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  // Set initial state based on window size on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSidebarOpen(window.innerWidth >= 768);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Close sidebar on route change on mobile viewports only
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0f] text-[#f1f5f9]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen bg-[#0a0a0f] overflow-hidden font-sans text-[#f1f5f9]">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Pane */}
      <main className={`flex-1 flex flex-col min-w-0 bg-[#0e0e15] overflow-y-auto relative transition-all duration-300 ${sidebarOpen ? 'md:pl-[260px]' : 'md:pl-0'}`}>
        {/* Mobile Navbar Header */}
        {!sidebarOpen && (
          <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0d0d14]/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <span className="text-white font-extrabold text-xs">S</span>
              </div>
              <span className="font-bold text-sm tracking-tight text-white">SocialSync</span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </header>
        )}

        {/* Desktop Floating Menu Button (only visible on desktop when sidebar is closed) */}
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="hidden md:flex fixed top-6 left-6 p-2.5 bg-[#0d0d14]/90 border border-white/10 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition z-40 shadow-lg backdrop-blur-md"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        {/* Decorative ambient background glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Dynamic Inner Page Content */}
        <div className="relative z-10 p-6 md:p-10 max-w-7xl w-full mx-auto flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  );
}
