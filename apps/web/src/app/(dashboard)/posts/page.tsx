'use client';

import { useState, useEffect, Suspense } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  Calendar, 
  Layers, 
  Trash2, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Search,
  ExternalLink,
  ShieldCheck
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

function PostsPageContent() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PUBLISHED, SCHEDULED, FAILED, DRAFT
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getPosts();
      if (res.success) {
        setPosts(res.data);
      } else {
        setError('Failed to fetch posts outbox.');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading post archives.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNow = async (postId: string) => {
    if (!confirm('Are you sure you want to publish this post immediately to its selected platforms?')) {
      return;
    }
    setActioningId(postId);
    try {
      const res = await api.publishPost(postId);
      if (res.success) {
        // Fetch posts again to reflect new status
        await fetchPosts();
      } else {
        alert('Failed to publish post.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred while publishing.');
    } finally {
      setActioningId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action is permanent.')) {
      return;
    }
    try {
      const res = await api.deletePost(postId);
      if (res.success) {
        setPosts(posts.filter((p) => p.id !== postId));
      } else {
        alert('Failed to delete post.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred while deleting.');
    }
  };

  const filteredPosts = posts
    .filter((post) => {
      if (activeTab === 'ALL') return true;
      return post.status === activeTab;
    })
    .filter((post) => {
      if (!searchQuery) return true;
      return post.content.toLowerCase().includes(searchQuery.toLowerCase());
    });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10';
      case 'SCHEDULED':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/10';
      case 'FAILED':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/10';
      default: // DRAFT
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/10';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Outbox Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse publication history, inspect API errors, and manage scheduled drafts.
          </p>
        </div>
        <Link
          href="/compose"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition active:scale-[0.98]"
        >
          <Layers className="h-4 w-4" />
          Compose Post
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/10 bg-red-500/5 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/5">
          {['ALL', 'PUBLISHED', 'SCHEDULED', 'FAILED', 'DRAFT'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === tab
                  ? 'bg-white/5 border border-white/10 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
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
            placeholder="Search outbox content..."
            className="w-full rounded-xl border border-white/5 bg-white/[0.02] pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none ring-1 ring-white/10 focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-sm">Accessing outbox records...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-16 text-center space-y-4">
          <Layers className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Posts Found</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            We couldn't find any posts matching your selected tab or search query. Get started by drafting a new post!
          </p>
          <Link
            href="/compose"
            className="inline-block px-5 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-semibold text-sm transition"
          >
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group relative rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] p-6 shadow-xl backdrop-blur-md transition-all hover:border-white/10"
            >
              {/* Top Row: Meta info */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>
                    📅 Created:{' '}
                    {new Date(post.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                  {post.scheduledAt && (
                    <span className="flex items-center gap-1 text-yellow-400 bg-yellow-400/5 px-2 py-0.5 rounded border border-yellow-400/10">
                      <Clock className="h-3.5 w-3.5" />
                      Queue:{' '}
                      {new Date(post.scheduledAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] font-extrabold tracking-wider px-2.5 py-1 rounded-full ${getStatusStyle(post.status)}`}>
                  {post.status}
                </span>
              </div>

              {/* Main Body */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left pane: post content preview */}
                <div className="md:col-span-2 space-y-4">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                    {post.content}
                  </p>
                  
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {post.mediaUrls.map((url: string, index: number) => (
                        <div
                          key={index}
                          className="group/thumb relative rounded-xl border border-white/5 overflow-hidden bg-black/40 p-1 flex items-center justify-between gap-2 text-[10px] text-slate-500 max-w-xs truncate"
                        >
                          <span className="truncate pr-1">🔗 {url}</span>
                          <a href={url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-white transition">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right pane: platforms state status */}
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4.5 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Channel Dispatch Outcomes
                  </h4>
                  <div className="space-y-3">
                    {post.platforms.map((pp: any) => {
                      const plat = pp.account.platform;
                      let icon = null;
                      if (plat === 'FACEBOOK') icon = <FacebookIcon className="h-4.5 w-4.5 text-[#1877f2]" />;
                      else if (plat === 'TWITTER') icon = <TwitterIcon className="h-4.5 w-4.5 text-white" />;
                      else icon = <span className="text-xs font-extrabold text-[#e60023] font-serif">P</span>;

                      return (
                        <div
                          key={pp.id}
                          className="flex flex-col gap-1.5 p-3 rounded-lg border border-white/5 bg-white/[0.01]"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-white/[0.02]">{icon}</div>
                              <span className="text-xs font-semibold text-slate-300">
                                {pp.account.accountName}
                              </span>
                            </div>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                                pp.status === 'PUBLISHED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'
                                  : pp.status === 'FAILED'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/10'
                                  : 'bg-slate-500/10 text-slate-400 border-slate-500/10'
                              }`}
                            >
                              {pp.status}
                            </span>
                          </div>

                          {/* Print platform post ID or errors */}
                          {pp.status === 'PUBLISHED' && pp.platformPostId && (
                            <a
                              href={
                                plat === 'TWITTER'
                                  ? `https://x.com/i/status/${pp.platformPostId}`
                                  : plat === 'FACEBOOK'
                                  ? `https://facebook.com/${pp.platformPostId}`
                                  : `https://pinterest.com/pin/${pp.platformPostId}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline font-mono truncate flex items-center gap-1 mt-1"
                            >
                              <span>View live post</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {pp.status === 'FAILED' && pp.errorMessage && (
                            <div className="flex items-start gap-1 text-[10px] text-red-400 bg-red-500/5 p-2 rounded border border-red-500/10 leading-normal break-words mt-1">
                              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 mr-1" />
                              <span>{pp.errorMessage}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2.5 text-slate-500 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition"
                  title="Delete post archive"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>

                {post.status === 'PUBLISHED' && (
                  <button
                    onClick={() => {
                      const publishedPlat = post.platforms.find((pp: any) => pp.status === 'PUBLISHED' && pp.platformPostId);
                      if (publishedPlat) {
                        const plat = publishedPlat.account.platform;
                        const url = plat === 'TWITTER'
                          ? `https://x.com/i/status/${publishedPlat.platformPostId}`
                          : plat === 'FACEBOOK'
                          ? `https://facebook.com/${publishedPlat.platformPostId}`
                          : `https://pinterest.com/pin/${publishedPlat.platformPostId}`;
                        window.open(url, '_blank');
                      } else {
                        alert('No live links available for this post.');
                      }
                    }}
                    className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Live Post
                  </button>
                )}

                {(post.status === 'DRAFT' || post.status === 'FAILED') && (
                  <button
                    onClick={() => handlePublishNow(post.id)}
                    disabled={actioningId === post.id}
                    className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold transition disabled:opacity-50"
                  >
                    {actioningId === post.id ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Publish Now
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex justify-center items-center py-20 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4"></div>
        <p className="text-sm">Setting up view...</p>
      </div>
    }>
      <PostsPageContent />
    </Suspense>
  );
}
