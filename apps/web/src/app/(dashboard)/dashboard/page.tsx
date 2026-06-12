'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Calendar, Layers, Activity, Link as LinkIcon, Send, Sparkles, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      } else {
        setError('Failed to load dashboard metrics.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4"></div>
        <p className="text-sm">Fetching workspace insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 text-red-400">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p className="text-sm font-semibold">{error}</p>
        <button onClick={fetchStats} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Posts', value: stats?.totalPosts || 0, icon: <Layers className="h-5 w-5 text-indigo-400" />, desc: 'All composed posts' },
    { label: 'Scheduled', value: stats?.scheduledPosts || 0, icon: <Calendar className="h-5 w-5 text-purple-400" />, desc: 'Posts queued for publish' },
    { label: 'Connected Channels', value: stats?.connectedAccounts || 0, icon: <LinkIcon className="h-5 w-5 text-cyan-400" />, desc: 'Linked platform channels' },
    { label: 'Avg Engagement', value: `${stats?.engagementRate || 0}%`, icon: <Activity className="h-5 w-5 text-emerald-400" />, desc: 'Combined engagement rate' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Workspace Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time analytics and orchestrations across your social networks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/compose"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            Create Post
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-xl backdrop-blur-md transition-all hover:border-indigo-500/20 hover:bg-white/[0.04]"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition">
                {card.label}
              </span>
              <div className="p-2.5 rounded-xl bg-white/[0.03] group-hover:bg-indigo-500/10 transition">
                {card.icon}
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                {card.value}
              </span>
              <span className="block text-xs text-slate-500 mt-1.5">{card.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Scheduled Queue & Recent Posts */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upcoming Schedule */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-400" />
                Upcoming Schedule
              </h2>
              <Link href="/schedule" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                View Calendar
              </Link>
            </div>
            <div className="p-6 divide-y divide-white/5">
              {stats?.upcomingPosts?.length > 0 ? (
                stats.upcomingPosts.map((post: any) => (
                  <div key={post.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm text-slate-300 line-clamp-2 pr-4">{post.content}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>
                          📅 {new Date(post.scheduledAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {post.platforms.map((p: any) => (
                            <span
                              key={p.id}
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{
                                backgroundColor:
                                  p.account.platform === 'FACEBOOK'
                                    ? '#1877f2'
                                    : p.account.platform === 'TWITTER'
                                    ? '#ffffff'
                                    : '#e60023',
                              }}
                              title={p.account.accountName}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/10">
                      Scheduled
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No scheduled posts found. Get started by composing a new post!
                </div>
              )}
            </div>
          </div>

          {/* Recent History */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden shadow-xl backdrop-blur-md">
            <div className="border-b border-white/5 px-6 py-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-indigo-400" />
                Recent Outbox
              </h2>
            </div>
            <div className="p-6 divide-y divide-white/5">
              {stats?.recentPosts?.length > 0 ? (
                stats.recentPosts.map((post: any) => (
                  <div key={post.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm text-slate-300 line-clamp-2 pr-4">{post.content}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>
                          Created {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {post.platforms.map((p: any) => (
                            <span
                              key={p.id}
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{
                                backgroundColor:
                                  p.account.platform === 'FACEBOOK'
                                    ? '#1877f2'
                                    : p.account.platform === 'TWITTER'
                                    ? '#ffffff'
                                    : '#e60023',
                              }}
                              title={p.account.accountName}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        post.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'
                          : post.status === 'FAILED'
                          ? 'bg-red-500/10 text-red-400 border-red-500/10'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/10'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No post history available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Platform Status / Quick Tips */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick AI Prompt Panel */}
          <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-indigo-500/5 to-purple-500/5 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-indigo-400 mb-3">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-md font-bold text-white">AI Assistant Insight</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate visual hooks and structured copy using our custom templates. Hop on the{' '}
              <Link href="/compose" className="text-indigo-400 font-semibold hover:underline">
                composer tab
              </Link>{' '}
              and trigger the AI panel to craft platform-optimized content in seconds.
            </p>
          </div>

          {/* Quick Activity Stats Graphic */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-sm font-bold text-white mb-4">Engagement Distribution</h3>
            <div className="space-y-4">
              {[
                { label: 'Facebook', value: '45%', color: 'bg-[#1877f2]' },
                { label: 'Twitter / X', value: '35%', color: 'bg-slate-200' },
                { label: 'Pinterest', value: '20%', color: 'bg-[#e60023]' },
              ].map((plat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{plat.label}</span>
                    <span className="font-semibold text-white font-mono">{plat.value}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${plat.color}`} style={{ width: plat.value }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
