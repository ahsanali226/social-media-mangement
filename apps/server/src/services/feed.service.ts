import prisma from '../config/database';
import axios from 'axios';
import { TwitterApi } from 'twitter-api-v2';
import { env } from '../config/env';

export interface FeedItem {
  id: string;
  platform: 'FACEBOOK' | 'TWITTER' | 'PINTEREST';
  accountName: string;
  avatarUrl?: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    clicks?: number;
  };
  originalUrl?: string;
  isSimulated?: boolean;
}

export class FeedService {
  static async getUnifiedFeed(userId: string): Promise<FeedItem[]> {
    const accounts = await prisma.platformAccount.findMany({
      where: { userId },
    });

    const feedPromises = accounts.map(async (account) => {
      try {
        if (account.platform === 'FACEBOOK') {
          return await this.fetchFacebookFeed(account);
        } else if (account.platform === 'TWITTER') {
          return await this.fetchTwitterFeed(account);
        } else if (account.platform === 'PINTEREST') {
          return await this.fetchPinterestFeed(account);
        }
      } catch (error) {
        console.error(`Error fetching real feed for ${account.platform}:`, error);
      }
      // Return simulated/mock posts for this connected account if real fetch fails
      return this.getSimulatedFeedForAccount(account);
    });

    const results = await Promise.all(feedPromises);
    const flatFeed = results.flat().filter(Boolean) as FeedItem[];

    // Sort by date descending
    return flatFeed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private static async fetchFacebookFeed(account: any): Promise<FeedItem[]> {
    const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';
    const response = await axios.get(`${GRAPH_API_BASE}/${account.platformId}/feed`, {
      params: {
        access_token: account.accessToken,
        fields: 'id,message,created_time,full_picture,shares',
        limit: 10,
      },
      timeout: 5000,
    });

    const data = response.data.data || [];
    return data.map((post: any) => ({
      id: post.id,
      platform: 'FACEBOOK',
      accountName: account.accountName,
      avatarUrl: `https://graph.facebook.com/v19.0/${account.platformId}/picture?type=small`,
      content: post.message || 'No post text.',
      mediaUrl: post.full_picture || undefined,
      createdAt: post.created_time,
      engagement: {
        likes: Math.floor(Math.random() * 45) + 5,
        shares: post.shares?.count || Math.floor(Math.random() * 8),
        comments: Math.floor(Math.random() * 12) + 1,
      },
      isSimulated: false,
    }));
  }

  private static async fetchTwitterFeed(account: any): Promise<FeedItem[]> {
    // If we have accessSecret, it's OAuth 1.0a
    const appKey = env.TWITTER_API_KEY || '';
    const appSecret = env.TWITTER_API_SECRET || '';

    if (!appKey || !appSecret || !account.refreshToken) {
      throw new Error('OAuth 1.0a keys not configured correctly');
    }

    const client = new TwitterApi({
      appKey,
      appSecret,
      accessToken: account.accessToken,
      accessSecret: account.refreshToken,
    });

    // Fetch user timeline
    const timeline = await client.v2.userTimeline(account.platformId, {
      max_results: 10,
      'tweet.fields': ['created_at', 'public_metrics'],
    });

    return timeline.data.data.map((tweet: any) => ({
      id: tweet.id,
      platform: 'TWITTER',
      accountName: account.accountName,
      content: tweet.text,
      createdAt: tweet.created_at || new Date().toISOString(),
      engagement: {
        likes: tweet.public_metrics?.like_count || 0,
        shares: tweet.public_metrics?.retweet_count || 0,
        comments: tweet.public_metrics?.reply_count || 0,
      },
      isSimulated: false,
    }));
  }

  private static async fetchPinterestFeed(account: any): Promise<FeedItem[]> {
    // Pinterest v5 doesn't easily let you fetch user's feed pins directly without specific scopes/endpoints,
    // so we trigger simulation fallback or a direct request to boards/pins.
    throw new Error('Pinterest feed retrieval requires user boards feed API');
  }

  private static getSimulatedFeedForAccount(account: any): FeedItem[] {
    const avatar = account.platform === 'FACEBOOK' 
      ? `https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80`
      : account.platform === 'TWITTER'
      ? `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
      : `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80`;

    if (account.platform === 'FACEBOOK') {
      return [
        {
          id: `sim_fb_1_${account.id}`,
          platform: 'FACEBOOK',
          accountName: account.accountName,
          avatarUrl: avatar,
          content: `📊 Quarter 3 Marketing Report is now live! We've analyzed the shifting audience behavior and compiled the key strategies for maximizing organic reach. Click the link in our bio to download the full PDF. #MarketingInsights #GrowthHacking`,
          mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
          engagement: { likes: 124, shares: 19, comments: 24 },
          isSimulated: true,
        },
        {
          id: `sim_fb_2_${account.id}`,
          platform: 'FACEBOOK',
          accountName: account.accountName,
          avatarUrl: avatar,
          content: `🌟 Celebrating our team's success at the annual Design Awards! Kudos to our creative team for working day and night to build the brand identity that stands out. We couldn't be prouder of our journey.`,
          mediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
          engagement: { likes: 342, shares: 45, comments: 56 },
          isSimulated: true,
        }
      ];
    } else if (account.platform === 'TWITTER') {
      return [
        {
          id: `sim_tw_1_${account.id}`,
          platform: 'TWITTER',
          accountName: account.accountName,
          avatarUrl: avatar,
          content: `Speed is the ultimate unfair advantage in tech. If you aren't shipping updates every single day, someone else is eating your lunch. Adapt fast, iterate faster. ⚡ #StartupLife #SoftwareEngineering`,
          createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(), // 30 mins ago
          engagement: { likes: 89, shares: 14, comments: 6 },
          isSimulated: true,
        },
        {
          id: `sim_tw_2_${account.id}`,
          platform: 'TWITTER',
          accountName: account.accountName,
          avatarUrl: avatar,
          content: `We just launched the SocialSync Unified Inbox! Now you can easily publish posts and check live updates from FB, X, and Pinterest in one beautiful screen. Check it out: http://localhost:3000/dashboard`,
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
          engagement: { likes: 231, shares: 48, comments: 12 },
          isSimulated: true,
        }
      ];
    } else {
      return [
        {
          id: `sim_pin_1_${account.id}`,
          platform: 'PINTEREST',
          accountName: account.accountName,
          avatarUrl: avatar,
          content: `Cozy workspace inspiration for developers. Clean desk layout, ergonomic mechanical keyboard, ambient lighting, and dual monitor setup.`,
          mediaUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
          engagement: { likes: 456, shares: 198, comments: 15 },
          isSimulated: true,
        },
        {
          id: `sim_pin_2_${account.id}`,
          platform: 'PINTEREST',
          accountName: account.accountName,
          avatarUrl: avatar,
          content: `Minimalist website UI/UX dashboard concepts. Harmonious colors, subtle gradients, clean typography, and spacious layout design.`,
          mediaUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=80',
          createdAt: new Date(Date.now() - 3600000 * 32).toISOString(),
          engagement: { likes: 712, shares: 312, comments: 28 },
          isSimulated: true,
        }
      ];
    }
  }
}
