// ═══════════════════════════════════════════
// SocialSync — API Client
// ═══════════════════════════════════════════

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;
    const token = this.getToken();

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // ── Auth ──────────────────────────────
  async login(email: string, password: string) {
    return this.request<{ success: boolean; data: { user: any; accessToken: string; refreshToken: string } }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  async register(email: string, password: string, name: string) {
    return this.request<{ success: boolean; data: { user: any; accessToken: string; refreshToken: string } }>('/api/auth/register', {
      method: 'POST',
      body: { email, password, name },
    });
  }

  async getProfile() {
    return this.request<{ success: boolean; data: any }>('/api/auth/me');
  }

  // ── Posts ─────────────────────────────
  async getPosts(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<{ success: boolean; data: any[] }>(`/api/posts${query}`);
  }

  async getPost(id: string) {
    return this.request<{ success: boolean; data: any }>(`/api/posts/${id}`);
  }

  async createPost(data: { content: string; mediaUrls?: string[]; platformAccountIds: string[]; scheduledAt?: string }) {
    return this.request<{ success: boolean; data: any }>('/api/posts', {
      method: 'POST',
      body: data,
    });
  }

  async updatePost(id: string, data: { content?: string; mediaUrls?: string[]; scheduledAt?: string }) {
    return this.request<{ success: boolean; data: any }>(`/api/posts/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deletePost(id: string) {
    return this.request<{ success: boolean }>(`/api/posts/${id}`, { method: 'DELETE' });
  }

  async publishPost(id: string) {
    return this.request<{ success: boolean; data: any }>(`/api/posts/${id}/publish`, { method: 'POST' });
  }

  async getDashboardStats() {
    return this.request<{ success: boolean; data: any }>('/api/posts/stats');
  }

  async getScheduledPosts() {
    return this.request<{ success: boolean; data: any[] }>('/api/posts/scheduled');
  }

  // ── AI ────────────────────────────────
  async generateAIPost(data: { prompt: string; platform: string; tone: string; maxLength?: number }) {
    return this.request<{ success: boolean; data: { content: string; hashtags: string[]; platform: string } }>('/api/ai/generate', {
      method: 'POST',
      body: data,
    });
  }

  // ── Platforms ─────────────────────────
  async getAccounts() {
    return this.request<{ success: boolean; data: any[] }>('/api/platforms/accounts');
  }

  async getSocialFeed() {
    return this.request<{ success: boolean; data: any[] }>('/api/platforms/feed');
  }

  async disconnectAccount(id: string) {
    return this.request<{ success: boolean }>(`/api/platforms/accounts/${id}`, { method: 'DELETE' });
  }

  async getFacebookAuthUrl() {
    return this.request<{ success: boolean; data: { url: string } }>('/api/platforms/facebook/auth');
  }

  async getTwitterAuthUrl() {
    return this.request<{ success: boolean; data: { url: string } }>('/api/platforms/twitter/auth');
  }

  async getPinterestAuthUrl() {
    return this.request<{ success: boolean; data: { url: string } }>('/api/platforms/pinterest/auth');
  }

  async linkPinterestManually(accessToken: string) {
    return this.request<{ success: boolean; data: any }>('/api/platforms/pinterest/manual', {
      method: 'POST',
      body: { accessToken },
    });
  }
}

export const api = new ApiClient(API_BASE);
export default api;
