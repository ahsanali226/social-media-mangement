import { TwitterApi, TwitterApiReadWrite } from 'twitter-api-v2';
import prisma from '../../config/database';
import { env } from '../../config/env';

export class TwitterService {
  private static getOAuth2Client() {
    return new TwitterApi({
      clientId: env.TWITTER_CLIENT_ID || '',
      clientSecret: env.TWITTER_CLIENT_SECRET || '',
    });
  }

  /**
   * Generate OAuth 2.0 PKCE authorization URL
   */
  static generateAuthLink() {
    if (!env.TWITTER_CLIENT_ID) {
      throw new Error('Twitter OAuth 2.0 Client ID is not configured. Please set TWITTER_CLIENT_ID in your .env file to link Twitter accounts.');
    }
    const client = this.getOAuth2Client();
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      env.TWITTER_REDIRECT_URI || '',
      { scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'] }
    );
    return { url, codeVerifier, state };
  }

  /**
   * Exchange authorization code for access token
   */
  static async handleCallback(code: string, codeVerifier: string, userId: string) {
    const client = this.getOAuth2Client();

    const { client: loggedClient, accessToken, refreshToken } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: env.TWITTER_REDIRECT_URI || '',
    });

    // Get user info
    const { data: twitterUser } = await loggedClient.v2.me();

    const account = await prisma.platformAccount.upsert({
      where: {
        userId_platform_platformId: {
          userId,
          platform: 'TWITTER',
          platformId: twitterUser.id,
        },
      },
      update: {
        accessToken: accessToken,
        refreshToken: refreshToken || null,
        accountName: twitterUser.name || twitterUser.username,
        tokenExpiry: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      },
      create: {
        userId,
        platform: 'TWITTER',
        platformId: twitterUser.id,
        accountName: twitterUser.name || twitterUser.username,
        accessToken: accessToken,
        refreshToken: refreshToken || null,
        tokenExpiry: new Date(Date.now() + 2 * 60 * 60 * 1000),
        metadata: JSON.stringify({ username: twitterUser.username }),
      },
    });

    return account;
  }

  /**
   * Publish a tweet.
   * Priority:
   *   1. OAuth 1.0a if accessSecret is provided (stored in refreshToken column)
   *   2. OAuth 2.0 Bearer token (OAuth 2.0 PKCE flow token)
   *
   * NOTE: OAuth 1.0a requires the Twitter App to have Read+Write permission.
   * If you get a 403, go to developer.twitter.com → Your App → Settings
   * → App permissions → change to "Read and Write" then regenerate access tokens.
   */
  static async publishPost(accessToken: string, content: string, accessSecret?: string) {
    let client: TwitterApiReadWrite;

    if (accessSecret) {
      // OAuth 1.0a path — needs app key/secret + user access token/secret
      const appKey = env.TWITTER_API_KEY || '';
      const appSecret = env.TWITTER_API_SECRET || '';

      if (!appKey || !appSecret) {
        throw new Error(
          'Twitter API Key or Secret is not set in .env. Add TWITTER_API_KEY and TWITTER_API_SECRET to publish via OAuth 1.0a.'
        );
      }

      client = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
      }).readWrite;
    } else {
      // OAuth 2.0 Bearer path
      client = new TwitterApi(accessToken).readWrite;
    }

    try {
      const { data } = await client.v2.tweet(content);
      return data;
    } catch (error: any) {
      // Provide a clear actionable error message for common Twitter API failures
      const status = error?.code || error?.data?.status;
      if (status === 403 || error?.message?.includes('403')) {
        throw new Error(
          'Twitter API returned 403 Forbidden. Your Twitter App likely only has Read permission. ' +
          'Fix: Go to developer.twitter.com → Your App → Settings → App permissions → set to "Read and Write", ' +
          'then regenerate Access Token & Secret and update .env or re-seed the DB.'
        );
      }
      if (status === 401 || error?.message?.includes('401')) {
        throw new Error(
          'Twitter API returned 401 Unauthorized. Your Access Token or Secret is invalid or expired. ' +
          'Re-generate tokens in the Twitter Developer Portal and re-seed the DB.'
        );
      }
      throw error;
    }
  }

  /**
   * Refresh expired OAuth 2.0 access token
   */
  static async refreshAccessToken(refreshToken: string) {
    const client = this.getOAuth2Client();
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await client.refreshOAuth2Token(refreshToken);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
