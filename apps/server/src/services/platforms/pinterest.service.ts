import axios from 'axios';
import prisma from '../../config/database';
import { env } from '../../config/env';

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';

export class PinterestService {
  /**
   * Generate OAuth authorization URL
   */
  static getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: env.PINTEREST_APP_ID || '',
      redirect_uri: env.PINTEREST_REDIRECT_URI || '',
      response_type: 'code',
      scope: 'pins:write,boards:read',
      state,
    });
    return `https://www.pinterest.com/oauth/?${params}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async handleCallback(code: string, userId: string) {
    const credentials = Buffer.from(
      `${env.PINTEREST_APP_ID}:${env.PINTEREST_APP_SECRET}`
    ).toString('base64');

    const tokenResponse = await axios.post(
      `${PINTEREST_API_BASE}/oauth/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.PINTEREST_REDIRECT_URI || '',
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get(`${PINTEREST_API_BASE}/user_account`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const pinterestUser = userResponse.data;

    const account = await prisma.platformAccount.upsert({
      where: {
        userId_platform_platformId: {
          userId,
          platform: 'PINTEREST',
          platformId: pinterestUser.username || pinterestUser.id,
        },
      },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token || null,
        accountName: pinterestUser.business_name || pinterestUser.username,
        tokenExpiry: new Date(Date.now() + (expires_in || 3600) * 1000),
      },
      create: {
        userId,
        platform: 'PINTEREST',
        platformId: pinterestUser.username || pinterestUser.id,
        accountName: pinterestUser.business_name || pinterestUser.username,
        accessToken: access_token,
        refreshToken: refresh_token || null,
        tokenExpiry: new Date(Date.now() + (expires_in || 3600) * 1000),
        metadata: JSON.stringify({ profileImage: pinterestUser.profile_image }),
      },
    });

    return account;
  }

  static async getBoards(accessToken: string) {
    const response = await axios.get(`${PINTEREST_API_BASE}/boards`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data.items || [];
  }

  /**
   * Create a new board
   */
  static async createBoard(accessToken: string, name: string, description?: string) {
    const response = await axios.post(
      `${PINTEREST_API_BASE}/boards`,
      { name, description },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  /**
   * Create a new pin
   */
  static async publishPost(
    accessToken: string,
    boardId: string,
    title: string,
    description: string,
    imageUrl: string,
    link?: string
  ) {
    const response = await axios.post(
      `${PINTEREST_API_BASE}/pins`,
      {
        board_id: boardId,
        title,
        description,
        link,
        media_source: {
          source_type: 'image_url',
          url: imageUrl,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }
}
