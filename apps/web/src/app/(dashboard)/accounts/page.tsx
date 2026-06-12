'use client';

import { useState, useEffect, Suspense } from 'react';
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { 
  Link as LinkIcon, 
  Unlink, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Key,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

function Facebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function Twitter({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function AccountsPageContent() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [pinterestToken, setPinterestToken] = useState('');
  const [submittingToken, setSubmittingToken] = useState(false);

  useEffect(() => {
    fetchAccounts();
    const connectedParam = searchParams.get('connected');
    if (connectedParam) {
      setNotification(`Successfully connected your ${connectedParam} account!`);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      setTimeout(() => setNotification(null), 5000);
    }
  }, [searchParams]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.getAccounts();
      if (res.success) {
        setAccounts(res.data);
      } else {
        setError('Could not retrieve linked channel accounts.');
      }
    } catch (err: any) {
      setError(err.message || 'Error querying social accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    setConnectingPlatform(platform);
    setError('');
    try {
      let res;
      if (platform === 'facebook') {
        res = await api.getFacebookAuthUrl();
      } else if (platform === 'twitter') {
        res = await api.getTwitterAuthUrl();
      }

      if (res && res.success && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError(`Failed to fetch authorization link for ${platform}.`);
        setConnectingPlatform(null);
      }
    } catch (err: any) {
      setError(err.message || `An error occurred starting connection flow for ${platform}.`);
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this channel account? Any scheduled posts for this account will fail.')) {
      return;
    }
    try {
      const res = await api.disconnectAccount(id);
      if (res.success) {
        setAccounts(accounts.filter((acc) => acc.id !== id));
      } else {
        setError('Failed to remove link.');
      }
    } catch (err: any) {
      setError(err.message || 'Error disconnecting account.');
    }
  };

  const getCardInfo = (platformName: string) => {
    const instances = accounts.filter((a) => a.platform === platformName.toUpperCase());
    switch (platformName) {
      case 'Facebook':
        return {
          instances,
          icon: <Facebook className="h-6 w-6 text-[#1877f2]" />,
          color: '#1877f2',
          desc: 'Manage business pages, publish feed updates, and capture page engagement stats.',
          brandGlow: 'hover:shadow-[#1877f2]/5 hover:border-[#1877f2]/20',
          accentBg: 'bg-[#1877f2]/5 text-[#1877f2] border-[#1877f2]/10',
        };
      case 'Twitter':
        return {
          instances,
          icon: <Twitter className="h-6 w-6 text-white" />,
          color: '#ffffff',
          desc: 'Compose quick thread updates, share references, and publish media posts.',
          brandGlow: 'hover:shadow-white/5 hover:border-white/20',
          accentBg: 'bg-white/5 text-white border-white/10',
        };
      case 'Pinterest':
        return {
          instances,
          icon: <span className="text-xl font-black text-[#e60023] font-serif">P</span>,
          color: '#e60023',
          desc: 'Organize creative boards, publish graphic Pins, and link to custom boards.',
          brandGlow: 'hover:shadow-[#e60023]/5 hover:border-[#e60023]/20',
          accentBg: 'bg-[#e60023]/5 text-[#e60023] border-[#e60023]/10',
        };
      default:
        return { instances: [], icon: null, color: '#ccc', desc: '', brandGlow: '', accentBg: '' };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Connected Channels
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Authenticate and authorize workspace integrations for unified cross-platform scheduling.
          </p>
        </div>
      </div>

      {notification && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-400 shadow-lg shadow-emerald-500/2">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/10 bg-red-500/5 text-red-400 shadow-lg shadow-red-500/2">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 text-slate-400">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-sm">Retrieving channel authentication states...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {['Facebook', 'Twitter', 'Pinterest'].map((platformName) => {
            const { instances, icon, desc, brandGlow, accentBg } = getCardInfo(platformName);
            const isConnecting = connectingPlatform === platformName.toLowerCase();

            return (
              <div
                key={platformName}
                className={`group relative rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${brandGlow}`}
              >
                <div className="space-y-6">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                      {icon}
                    </div>
                    {instances.length > 0 && (
                      <span className={`flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider px-3 py-1 rounded-full border ${accentBg}`}>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">{platformName}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">{desc}</p>
                  </div>
                </div>

                {/* Submissions & Links */}
                <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                  {/* Account Instance List */}
                  {instances.length > 0 && (
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Linked Profile</p>
                      {instances.map((acc: any) => (
                        <div
                          key={acc.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 shadow-inner"
                        >
                          <div className="truncate pr-2">
                            <span className="font-bold text-white block truncate">
                              {acc.accountName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ID: {acc.platformId}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDisconnect(acc.id)}
                            className="p-2 bg-red-500/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition active:scale-95"
                            title="Disconnect account"
                          >
                            <Unlink className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Link Actions */}
                  {platformName !== 'Pinterest' ? (
                    <button
                      onClick={() => handleConnect(platformName.toLowerCase())}
                      disabled={isConnecting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] text-xs font-bold text-white shadow-lg transition active:scale-[0.98] disabled:opacity-50"
                    >
                      <LinkIcon className="h-4 w-4 text-indigo-400" />
                      {isConnecting ? `Linking ${platformName}...` : `Link ${platformName}`}
                    </button>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5 text-indigo-400" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Developer Access Token</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          type="password"
                          value={pinterestToken}
                          onChange={(e) => setPinterestToken(e.target.value)}
                          placeholder="Paste Pinterest Access Token..."
                          className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none ring-1 ring-white/10 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white/[0.03] transition-all"
                        />
                        <button
                          onClick={async () => {
                            if (!pinterestToken) return;
                            setSubmittingToken(true);
                            setError('');
                            try {
                              const res = await api.linkPinterestManually(pinterestToken);
                              if (res.success) {
                                setPinterestToken('');
                                setNotification('Successfully connected your Pinterest account manually!');
                                fetchAccounts();
                              } else {
                                setError('Failed to link Pinterest account manually.');
                              }
                            } catch (err: any) {
                              setError(err.message || 'Error linking Pinterest manually.');
                            } finally {
                              setSubmittingToken(false);
                            }
                          }}
                          disabled={submittingToken || !pinterestToken}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 transition active:scale-[0.98] disabled:opacity-50"
                        >
                          {submittingToken ? 'Verifying Token...' : 'Connect Pinterest'}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span>Generate a token in your Pinterest developer portal.</span>
                      </div>
                    </div>
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

export default function AccountsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex justify-center items-center py-20 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4"></div>
        <p className="text-sm">Setting up view...</p>
      </div>
    }>
      <AccountsPageContent />
    </Suspense>
  );
}
