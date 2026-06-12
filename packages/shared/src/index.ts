// ═══════════════════════════════════════════
// SocialSync — Shared Types & Constants
// ═══════════════════════════════════════════

// ── Platform Types ───────────────────────
export type Platform = 'FACEBOOK' | 'TWITTER' | 'PINTEREST';

export const PLATFORMS: Record<Platform, { name: string; color: string; maxChars: number }> = {
  FACEBOOK: { name: 'Facebook', color: '#1877f2', maxChars: 63206 },
  TWITTER: { name: 'Twitter / X', color: '#000000', maxChars: 280 },
  PINTEREST: { name: 'Pinterest', color: '#e60023', maxChars: 500 },
};

// ── Post Status ──────────────────────────
export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';

// ── AI Tone Options ──────────────────────
export type AITone = 'professional' | 'casual' | 'humorous' | 'inspirational' | 'educational';

// ── User Types ───────────────────────────
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
}

// ── Platform Account ─────────────────────
export interface PlatformAccount {
  id: string;
  userId: string;
  platform: Platform;
  platformId: string;
  accountName: string;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiry: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// ── Post Types ───────────────────────────
export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrls: string[] | null;
  status: PostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  platforms: PostPlatform[];
}

export interface PostPlatform {
  id: string;
  postId: string;
  accountId: string;
  platformPostId: string | null;
  status: string;
  errorMessage: string | null;
  publishedAt: string | null;
  account?: PlatformAccount;
}

// ── API Request/Response Types ───────────
export interface CreatePostRequest {
  content: string;
  mediaUrls?: string[];
  platformAccountIds: string[];
  scheduledAt?: string;
}

export interface AIGenerateRequest {
  prompt: string;
  platform: Platform;
  tone: AITone;
  maxLength?: number;
}

export interface AIGenerateResponse {
  content: string;
  hashtags: string[];
  platform: Platform;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ── Analytics Types ──────────────────────
export interface AnalyticsSummary {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  totalEngagement: number;
  platformBreakdown: Record<Platform, {
    posts: number;
    engagement: number;
    impressions: number;
  }>;
}

export interface DashboardStats {
  totalPosts: number;
  scheduledPosts: number;
  connectedAccounts: number;
  engagementRate: number;
  recentPosts: Post[];
  upcomingPosts: Post[];
}
