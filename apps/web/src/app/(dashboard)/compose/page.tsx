'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import AIAssistant from '@/components/ai/AIAssistant';
import { Send, Calendar, Image as ImageIcon, Sparkles, X, AlertCircle, CheckCircle } from 'lucide-react';

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
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.23 2.63 7.85 6.39 9.33-.09-.79-.17-2 .03-2.87.19-.82 1.22-5.22 1.22-5.22s-.31-.62-.31-1.54c0-1.44.84-2.52 1.88-2.52.88 0 1.31.67 1.31 1.47 0 .89-.57 2.22-.86 3.46-.24 1.04.53 1.88 1.55 1.88 1.86 0 3.29-1.96 3.29-4.79 0-2.51-1.8-4.26-4.38-4.26-2.98 0-4.73 2.24-4.73 4.55 0 .9.35 1.87.78 2.4.09.1.1.17.07.28l-.29 1.18c-.05.2-.16.25-.37.15-1.4-.65-2.28-2.7-2.28-4.35 0-3.54 2.57-6.8 7.42-6.8 3.9 0 6.93 2.78 6.93 6.49 0 3.87-2.44 6.99-5.83 6.99-1.14 0-2.21-.59-2.58-1.29l-.7 2.67c-.25.97-.93 2.19-1.39 2.94C10.08 21.79 11.02 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
    </svg>
  );
}

const limits: Record<string, number> = {
  FACEBOOK: 63206,
  TWITTER: 280,
  PINTEREST: 500,
};

export default function ComposePage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaInput, setMediaInput] = useState('');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [activePreviewTab, setActivePreviewTab] = useState('FACEBOOK');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedPlatforms = accounts
    .filter((acc) => selectedAccountIds.includes(acc.id))
    .map((acc) => acc.platform);
  const uniqueSelectedPlatforms = Array.from(new Set(selectedPlatforms));

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (uniqueSelectedPlatforms.length > 0 && !uniqueSelectedPlatforms.includes(activePreviewTab)) {
      setActivePreviewTab(uniqueSelectedPlatforms[0]);
    }
  }, [selectedAccountIds, activePreviewTab, accounts, uniqueSelectedPlatforms]);

  const fetchAccounts = async () => {
    try {
      const res = await api.getAccounts();
      if (res.success) {
        setAccounts(res.data);
        if (res.data.length > 0) {
          const allIds = res.data.map((acc: any) => acc.id);
          setSelectedAccountIds(allIds);
          setActivePreviewTab(res.data[0].platform);
        }
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleToggleAccount = (id: string) => {
    if (selectedAccountIds.includes(id)) {
      setSelectedAccountIds(selectedAccountIds.filter((accId) => accId !== id));
    } else {
      setSelectedAccountIds([...selectedAccountIds, id]);
      const acc = accounts.find((a) => a.id === id);
      if (acc) {
        setActivePreviewTab(acc.platform);
      }
    }
  };

  const handleAddMedia = () => {
    if (mediaInput.trim() && !mediaUrls.includes(mediaInput.trim())) {
      setMediaUrls([...mediaUrls, mediaInput.trim()]);
      setMediaInput('');
    }
  };

  const handleRemoveMedia = (url: string) => {
    setMediaUrls(mediaUrls.filter((u) => u !== url));
  };

  const handleInsertAIContent = (aiContent: string) => {
    setContent(aiContent);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Validate platform selections and character lengths
    for (const p of uniqueSelectedPlatforms) {
      if (content.length > limits[p]) {
        setMessage({ type: 'error', text: `Post exceeds the character limit for ${p}` });
        return;
      }
    }

    if (selectedAccountIds.length === 0) {
      setMessage({
        type: 'error',
        text: 'Please select at least one social media account to publish to.',
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const payload: any = {
        content,
        mediaUrls,
        platformAccountIds: selectedAccountIds,
      };

      if (isScheduled && scheduledDate) {
        payload.scheduledAt = new Date(scheduledDate).toISOString();
      }

      const res = await api.createPost(payload);

      if (res.success) {
        if (!isScheduled) {
          // If not scheduling, publish immediately
          const publishRes = await api.publishPost(res.data.id);
          if (publishRes.success) {
            setMessage({ type: 'success', text: 'Post published successfully!' });
            setTimeout(() => router.push('/dashboard'), 1500);
          } else {
            setMessage({ type: 'error', text: 'Post created but failed to publish.' });
          }
        } else {
          setMessage({ type: 'success', text: 'Post scheduled successfully!' });
          setTimeout(() => router.push('/dashboard'), 1500);
        }
      } else {
        setMessage({ type: 'error', text: (res as any).message || 'Failed to save post.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred during submission.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Character limit status for active platform
  const activeLimit = limits[activePreviewTab] || 280;
  const charsRemaining = activeLimit - content.length;
  const isOverLimit = charsRemaining < 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Compose Post
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Draft your update, utilize the AI sidekick, and dispatch or schedule across active channels.
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            message.type === 'success'
              ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
              : 'bg-red-500/5 border-red-500/10 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {loadingAccounts ? (
        <div className="flex justify-center items-center py-20 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-sm">Retrieving channel profiles...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center max-w-xl mx-auto space-y-4">
          <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Accounts Connected</h3>
          <p className="text-slate-400 text-sm">
            You must link at least one Facebook, Twitter, or Pinterest account in the Link Channels section before writing posts.
          </p>
          <button
            onClick={() => router.push('/accounts')}
            className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 font-semibold text-sm transition"
          >
            Connect an Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Compose area */}
          <div className="lg:col-span-3 space-y-6">
            <form onSubmit={handlePublish} className="space-y-6">
              {/* Target Accounts Selector */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Target Social Accounts
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {accounts.map((acc) => {
                    const isSelected = selectedAccountIds.includes(acc.id);
                    let icon = null;
                    let colorClass = '';
                    let activeColor = '';
                    
                    if (acc.platform === 'FACEBOOK') {
                      icon = <FacebookIcon className="h-4 w-4" />;
                      colorClass = 'border-[#1877f2]/20 hover:border-[#1877f2]/50 text-slate-400 hover:text-slate-300 bg-[#1877f2]/5';
                      activeColor = 'border-[#1877f2] text-white bg-[#1877f2]/10 shadow-[0_0_12px_rgba(24,119,242,0.15)]';
                    } else if (acc.platform === 'TWITTER') {
                      icon = <TwitterIcon className="h-4 w-4" />;
                      colorClass = 'border-white/10 hover:border-white/30 text-slate-400 hover:text-slate-300 bg-white/5';
                      activeColor = 'border-white text-white bg-white/10 shadow-[0_0_12px_rgba(255,255,255,0.1)]';
                    } else if (acc.platform === 'PINTEREST') {
                      icon = <PinterestIcon className="h-4 w-4" />;
                      colorClass = 'border-[#e60023]/20 hover:border-[#e60023]/50 text-slate-400 hover:text-slate-300 bg-[#e60023]/5';
                      activeColor = 'border-[#e60023] text-white bg-[#e60023]/10 shadow-[0_0_12px_rgba(230,0,35,0.15)]';
                    }

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleToggleAccount(acc.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                          isSelected ? activeColor : colorClass
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          isSelected 
                            ? acc.platform === 'FACEBOOK'
                              ? 'bg-[#1877f2] border-[#1877f2]'
                              : acc.platform === 'TWITTER'
                              ? 'bg-white border-white text-black'
                              : 'bg-[#e60023] border-[#e60023]'
                            : 'border-slate-600 bg-transparent'
                        }`}>
                          {isSelected && (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>

                        {/* Platform Icon and Account Name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={
                              acc.platform === 'FACEBOOK' ? 'text-[#1877f2]' : acc.platform === 'TWITTER' ? 'text-white' : 'text-[#e60023]'
                            }>
                              {icon}
                            </span>
                            <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-80">
                              {acc.platform}
                            </span>
                          </div>
                          <div className="text-xs font-bold truncate text-white">
                            {acc.accountName}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Composition Box */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 focus-within:border-indigo-500/25 transition">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Compose Message
                  </span>
                  <AIAssistant onInsert={handleInsertAIContent} selectedPlatform={activePreviewTab} />
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's happening? Let's design some compelling copy..."
                  className="w-full min-h-[220px] bg-transparent text-white border-none outline-none resize-y text-md placeholder-slate-500 leading-relaxed pr-2"
                  required
                />
                
                {/* Character limit bar */}
                <div className="border-t border-white/5 pt-4 flex items-center justify-between text-xs text-slate-500">
                  <span className={isOverLimit ? 'text-red-400 font-semibold' : 'text-slate-400'}>
                    {charsRemaining} characters left
                  </span>
                  <span className="font-mono">{content.length} / {activeLimit}</span>
                </div>
              </div>

              {/* Media input */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-indigo-400" />
                  Media Attachment Links
                </h3>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={mediaInput}
                    onChange={(e) => setMediaInput(e.target.value)}
                    placeholder="Paste image/media link (URL)..."
                    className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-white/10 focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedia}
                    className="px-4 py-2.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition"
                  >
                    Add
                  </button>
                </div>
                {mediaUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {mediaUrls.map((url, i) => (
                      <div key={i} className="group relative rounded-xl border border-white/5 bg-white/[0.03] p-2 flex items-center justify-between gap-2 overflow-hidden">
                        <span className="text-xs text-slate-400 truncate flex-1">{url}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(url)}
                          className="p-1 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Schedule Toggle Section */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-400" />
                      Publish Scheduler
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure a future calendar slot to release this post.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsScheduled(!isScheduled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isScheduled ? 'bg-indigo-500' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isScheduled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {isScheduled && (
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-white/10 focus:border-indigo-500 transition"
                  />
                )}
              </div>

              {/* Submissions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-5 py-3 rounded-xl bg-white/5 border border-white/5 text-sm font-semibold hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !content.trim() || isOverLimit || selectedAccountIds.length === 0}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                >
                  {isScheduled ? (
                    <>
                      <Calendar className="h-4 w-4" />
                      {submitting ? 'Scheduling...' : 'Schedule Post'}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {submitting ? 'Publishing...' : 'Publish Now'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Real-time Preview */}
          <div className="lg:col-span-2 space-y-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Mock Preview
            </label>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden shadow-xl backdrop-blur-md">
              {/* Tab headers */}
              <div className="flex border-b border-white/5 bg-white/[0.01]">
                {uniqueSelectedPlatforms.length === 0 ? (
                  <div className="flex-1 py-3 text-xs font-semibold text-slate-500 text-center">
                    No preview channels selected
                  </div>
                ) : (
                  uniqueSelectedPlatforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setActivePreviewTab(p)}
                      className={`flex-1 py-3 text-xs font-semibold transition border-b-2 ${
                        activePreviewTab === p
                          ? p === 'FACEBOOK'
                            ? 'border-[#1877f2] text-white'
                            : p === 'TWITTER'
                            ? 'border-white text-white'
                            : 'border-[#e60023] text-white'
                          : 'border-transparent text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      {p === 'TWITTER' ? 'Twitter / X' : p}
                    </button>
                  ))
                )}
              </div>

              {/* Preview body */}
              <div className="p-6">
                {uniqueSelectedPlatforms.length === 0 ? (
                  <div className="rounded-xl border border-white/5 bg-white/[0.01] p-12 text-center text-sm text-slate-500 italic">
                    Select one or more accounts to preview the post.
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                        S
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {activePreviewTab === 'FACEBOOK'
                            ? 'Facebook Page'
                            : activePreviewTab === 'TWITTER'
                            ? 'Twitter Handle'
                            : 'Pinterest Board'}
                        </div>
                        <div className="text-[10px] text-slate-500">Sponsored/Preview</div>
                      </div>
                    </div>

                    {content.trim() ? (
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                        {content}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No content composed yet...</p>
                    )}

                    {mediaUrls.length > 0 && (
                      <div className="rounded-lg border border-white/5 overflow-hidden bg-black/20 aspect-video flex items-center justify-center text-xs text-slate-500">
                        🖼️ Attached Media Link: {mediaUrls[0]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
