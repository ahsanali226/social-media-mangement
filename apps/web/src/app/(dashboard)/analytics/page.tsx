'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Heart, Share2, Award, Calendar, ExternalLink } from 'lucide-react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  // High fidelity mock data for analytics
  const summaryMetrics = [
    { label: 'Follower Growth', value: '12,480', change: '+8.4%', trend: 'up', icon: <Users className="h-5 w-5 text-indigo-400" /> },
    { label: 'Total Reach', value: '348,200', change: '+12.7%', trend: 'up', icon: <TrendingUp className="h-5 w-5 text-purple-400" /> },
    { label: 'Engagements', value: '24,850', change: '+18.1%', trend: 'up', icon: <Heart className="h-5 w-5 text-pink-400" /> },
    { label: 'Link Clicks', value: '4,120', change: '-2.4%', trend: 'down', icon: <BarChart3 className="h-5 w-5 text-cyan-400" /> },
  ];

  const topPosts = [
    {
      id: 1,
      content: '🚀 Introducing our new unified workspace orchestrator. Automate and schedule cross-platform campaigns from a single dashboard...',
      platform: 'TWITTER',
      engagement: 1420,
      shares: 184,
      clicks: 342,
      date: 'June 10, 2026',
    },
    {
      id: 2,
      content: 'Did you know? Visual content receives 94% more views than text-only updates. Here are 3 design principles for your next campaign...',
      platform: 'PINTEREST',
      engagement: 980,
      shares: 342,
      clicks: 120,
      date: 'June 8, 2026',
    },
    {
      id: 3,
      content: 'We are officially live! 🎉 Connect your channels, schedule your posts, and watch your brand reach expand in real-time. Link in bio.',
      platform: 'FACEBOOK',
      engagement: 740,
      shares: 92,
      clicks: 215,
      date: 'June 5, 2026',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Brand Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyze audience interactions, post conversions, and channel performance.
          </p>
        </div>
        <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                timeRange === range
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryMetrics.map((card, i) => (
          <div
            key={i}
            className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-xl backdrop-blur-md transition-all hover:border-indigo-500/20 hover:bg-white/[0.04]"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">{card.label}</span>
              <div className="p-2.5 rounded-xl bg-white/[0.03] group-hover:bg-indigo-500/10 transition">
                {card.icon}
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold tracking-tight text-white font-mono">
                {card.value}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  card.trend === 'up'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-xl backdrop-blur-md space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
              Engagement Over Time
            </h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              Clicks & Interactions (Daily Avg)
            </span>
          </div>

          {/* Premium Custom SVG Area Chart */}
          <div className="relative h-60 w-full bg-white/[0.005] rounded-xl border border-white/[0.02] p-2 flex flex-col justify-end">
            <svg className="w-full h-48" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="0" y1="60" x2="100" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              
              {/* Area Path */}
              <path
                d="M 0 100 C 15 70, 25 80, 40 45 C 55 20, 70 35, 85 15 C 92 10, 100 5, 100 5 L 100 100 Z"
                fill="url(#chart-glow)"
              />
              
              {/* Curve Line */}
              <path
                d="M 0 100 C 15 70, 25 80, 40 45 C 55 20, 70 35, 85 15 C 92 10, 100 5, 100 5"
                fill="none"
                stroke="url(#logo-gradient)"
                strokeWidth="1.5"
              />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-3 px-1">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </div>
        </div>

        {/* Platform Share Pie/Bar Breakdown */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-xl backdrop-blur-md space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="h-4.5 w-4.5 text-indigo-400" />
              Platform Breakdown
            </h3>
            <p className="text-xs text-slate-400">Audience actions segment</p>
          </div>

          <div className="space-y-4 my-auto pt-4">
            {[
              { name: 'Facebook', share: '46%', volume: '11,431', color: 'bg-[#1877f2]', text: 'text-[#1877f2]' },
              { name: 'Twitter / X', share: '34%', volume: '8,449', color: 'bg-white', text: 'text-white' },
              { name: 'Pinterest', share: '20%', volume: '4,970', color: 'bg-[#e60023]', text: 'text-[#e60023]' },
            ].map((p, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">{p.name}</span>
                  <span className="font-mono text-slate-400">
                    <span className="font-bold text-white">{p.volume}</span> ({p.share})
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${p.color}`} style={{ width: p.share }} />
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-500 border-t border-white/5 pt-3 mt-4 text-center">
            Updated in real-time based on active API hooks.
          </div>
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden shadow-xl backdrop-blur-md">
        <div className="border-b border-white/5 px-6 py-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-400" />
            Top Performing Posts
          </h2>
          <span className="text-xs text-slate-400 font-medium">Ranked by engagement rate</span>
        </div>
        <div className="divide-y divide-white/5">
          {topPosts.map((post) => (
            <div key={post.id} className="p-6 flex flex-col sm:flex-row items-start justify-between gap-6 hover:bg-white/[0.005] transition-colors">
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      post.platform === 'FACEBOOK'
                        ? 'bg-[#1877f2]/10 text-[#1877f2] border-[#1877f2]/10'
                        : post.platform === 'TWITTER'
                        ? 'bg-white/10 text-white border-white/10'
                        : 'bg-[#e60023]/10 text-[#e60023] border-[#e60023]/10'
                    }`}
                  >
                    {post.platform}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed break-words line-clamp-3">
                  {post.content}
                </p>
              </div>

              <div className="flex items-center gap-8 text-xs font-mono shrink-0">
                <div className="text-center">
                  <span className="block text-slate-500 text-[10px] uppercase">Engagement</span>
                  <span className="font-extrabold text-white text-md mt-0.5 block">{post.engagement}</span>
                </div>
                <div className="text-center">
                  <span className="block text-slate-500 text-[10px] uppercase">Shares</span>
                  <span className="font-extrabold text-white text-md mt-0.5 block">{post.shares}</span>
                </div>
                <div className="text-center">
                  <span className="block text-slate-500 text-[10px] uppercase">Clicks</span>
                  <span className="font-extrabold text-white text-md mt-0.5 block">{post.clicks}</span>
                </div>
                <button className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition text-slate-400 hover:text-white">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
