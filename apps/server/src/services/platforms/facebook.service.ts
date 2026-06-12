import axios from 'axios';
import prisma from '../../config/database';
import { env } from '../../config/env';

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';

export class FacebookService {
  /**
   * Generate OAuth authorization URL
   */
  static getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: env.FACEBOOK_APP_ID || '',
      redirect_uri: env.FACEBOOK_REDIRECT_URI || '',
      scope: 'pages_manage_posts,pages_read_engagement',
      response_type: 'code',
      state,
    });
    return `https://www.facebook.com/v19.0/dialog/oauth?${params}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async handleCallback(code: string, userId: string) {
    // Exchange code for user access token
    const tokenResponse = await axios.get(`${GRAPH_API_BASE}/oauth/access_token`, {
      params: {
        client_id: env.FACEBOOK_APP_ID,
        client_secret: env.FACEBOOK_APP_SECRET,
        redirect_uri: env.FACEBOOK_REDIRECT_URI,
        code,
      },
    });

    const userAccessToken = tokenResponse.data.access_token;

    // Get long-lived token
    const longLivedResponse = await axios.get(`${GRAPH_API_BASE}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: env.FACEBOOK_APP_ID,
        client_secret: env.FACEBOOK_APP_SECRET,
        fb_exchange_token: userAccessToken,
      },
    });

    const longLivedToken = longLivedResponse.data.access_token;

    // Get pages managed by user
    const pagesResponse = await axios.get(`${GRAPH_API_BASE}/me/accounts`, {
      params: { access_token: longLivedToken },
    });

    const pages = pagesResponse.data.data || [];
    const accounts = [];

    for (const page of pages) {
      const account = await prisma.platformAccount.upsert({
        where: {
          userId_platform_platformId: {
            userId,
            platform: 'FACEBOOK',
            platformId: page.id,
          },
        },
        update: {
          accessToken: page.access_token,
          accountName: page.name,
          metadata: JSON.stringify({ category: page.category }),
        },
        create: {
          userId,
          platform: 'FACEBOOK',
          platformId: page.id,
          accountName: page.name,
          accessToken: page.access_token,
          metadata: JSON.stringify({ category: page.category }),
        },
      });
      accounts.push(account);
    }

    return accounts;
  }

  /**
   * Publish a post to a Facebook page
   */
  static async publishPost(accessToken: string, pageId: string, content: string, mediaUrls?: string[]) {
    const endpoint = `${GRAPH_API_BASE}/${pageId}/feed`;

    const params: Record<string, string> = {
      message: content,
      access_token: accessToken,
    };

    if (mediaUrls && mediaUrls.length > 0) {
      params.link = mediaUrls[0]; // First URL as link
    }

    const response = await axios.post(endpoint, null, { params });
    return response.data;
  }
}
