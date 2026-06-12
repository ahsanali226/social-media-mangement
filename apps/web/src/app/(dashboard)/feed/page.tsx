'use client';

import { useState, useEffect, Suspense } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Share2,
  Search,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Info,
  CheckCircle,
  HelpCircle,
  Plus
} from 'lucide-react';

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <span className={`${className} font-serif font-extrabold text-[#e60023]`}>P</span>
  );
}

function SocialFeedContent() {
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'FACEBOOK' | 'TWITTER' | 'PINTEREST'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getSocialFeed();
      if (res.success) {
        setFeedItems(res.data);
      } else {
        setError('Could not connect to unified social feed.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading social feeds.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = feedItems
    .filter((item) => {
      if (filter === 'ALL') return true;
      return item.platform === filter;
    })
    .filter((item) => {
      if (!searchQuery) return true;
      return item.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
             item.accountName.toLowerCase().includes(searchQuery.toLowerCase());
    });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Social Live Feed
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            View live updates, engagement stats, and user activity from all connected social accounts.
          </p>
        </div>
        <button
          onClick={fetchFeed}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-xs font-semibold text-slate-300 transition active:scale-[0.98]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/10 bg-red-500/5 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Info notice about Sandbox Mode */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 text-indigo-300 text-xs leading-relaxed">
        <Info className="h-4.5 w-4.5 flex-shrink-0 text-indigo-400 mt-0.5" />
        <div>
          <p className="font-semibold text-white mb-1">Sandbox Live Simulation</p>
          <p>
            When active API credentials expire or are set to read-only, SocialSync uses a simulated live sandbox for demonstration. 
            Simulated posts carry a <span className="text-purple-400 font-semibold">Simulated</span> tag, while posts fetched from fully authorized API tokens carry a <span className="text-emerald-400 font-semibold">Live</span> tag.
          </p>
        </div>
      </div>

      {/* Filters & Search bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Platform Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/5">
          {(['ALL', 'FACEBOOK', 'TWITTER', 'PINTEREST'] as const).map((platform) => (
            <button
              key={platform}
              onClick={() => setFilter(platform)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                filter === platform
                  ? 'bg-white/5 border border-white/10 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {platform === 'ALL' ? 'All Channels' : platform.charAt(0) + platform.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feed messages..."
            className="w-full rounded-xl border border-white/5 bg-white/[0.02] pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none ring-1 ring-white/10 focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Main Feed Container */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-sm">Fetching social media updates...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-16 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Feed Updates</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            No posts were found on the connected social channels. Link your accounts or create new posts to start building your feed history!
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/accounts"
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-xl font-semibold text-sm transition"
            >
              Connect Accounts
            </Link>
            <Link
              href="/compose"
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold text-sm transition"
            >
              Compose Post
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => {
            let platIcon = null;
            let themeColor = '';
            if (item.platform === 'FACEBOOK') {
              platIcon = <FacebookIcon className="h-4 w-4 text-[#1877f2]" />;
              themeColor = 'border-[#1877f2]/10';
            } else if (item.platform === 'TWITTER') {
              platIcon = <TwitterIcon className="h-4 w-4 text-white" />;
              themeColor = 'border-white/10';
            } else {
              platIcon = <PinterestIcon className="h-4 w-4 text-[#e60023]" />;
              themeColor = 'border-[#e60023]/10';
            }

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white/[0.01] hover:bg-white/[0.02] p-6 shadow-xl backdrop-blur-md transition duration-300 ${themeColor}`}
              >
                <div>
                  {/* Account / Platform Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                        alt={item.accountName}
                        className="h-10 w-10 rounded-full border border-white/10 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{item.accountName}</span>
                          <div className="p-1 rounded bg-white/[0.03] flex items-center">{platIcon}</div>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        item.isSimulated
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/10'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${item.isSimulated ? 'bg-purple-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
                      {item.isSimulated ? 'Simulated' : 'Live'}
                    </span>
                  </div>

                  {/* Feed Content Text */}
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words mb-4">
                    {item.content}
                  </p>

                  {/* Attached Media Image */}
                  {item.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/5 mb-4 bg-black/20">
                      <img
                        src={item.mediaUrl}
                        alt="Attached media"
                        className="w-full max-h-60 object-cover hover:scale-[1.01] transition duration-500"
                      />
                    </div>
                  )}
                </div>

                {/* Engagement Stats footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 hover:text-rose-400 transition cursor-pointer">
                      <Heart className="h-4 w-4" />
                      {item.engagement.likes}
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-indigo-400 transition cursor-pointer">
                      <MessageCircle className="h-4 w-4" />
                      {item.engagement.comments}
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-emerald-400 transition cursor-pointer">
                      <Share2 className="h-4 w-4" />
                      {item.engagement.shares}
                    </span>
                  </div>

                  {item.originalUrl && (
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-white transition"
                    >
                      View Post
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SocialFeedPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex justify-center items-center py-20 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4"></div>
        <p className="text-sm">Setting up social feed...</p>
      </div>
    }>
      <SocialFeedContent />
    </Suspense>
  );
}
