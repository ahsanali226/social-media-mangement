import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { FacebookService } from '../services/platforms/facebook.service';
import { TwitterService } from '../services/platforms/twitter.service';
import { PinterestService } from '../services/platforms/pinterest.service';
import { FeedService } from '../services/feed.service';
import prisma from '../config/database';
import crypto from 'crypto';

const router = Router();

// Store OAuth state temporarily (in production, use Redis)
const oauthStates = new Map<string, { userId: string; codeVerifier?: string }>();

// ── GET Connected Accounts ───────────────
router.get('/accounts', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const accounts = await prisma.platformAccount.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        platform: true,
        accountName: true,
        platformId: true,
        tokenExpiry: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
    });
    res.json({ success: true, data: accounts });
  } catch (error) {
    next(error);
  }
});

// ── DELETE Disconnect Account ────────────
router.delete('/accounts/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.platformAccount.deleteMany({
      where: { id: req.params.id as string, userId: req.userId as string },
    });
    res.json({ success: true, message: 'Account disconnected' });
  } catch (error) {
    next(error);
  }
});

// ── GET Social Feed ──────────────────────
router.get('/feed', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const feed = await FeedService.getUnifiedFeed(req.userId!);
    res.json({ success: true, data: feed });
  } catch (error) {
    next(error);
  }
});

// ═══ FACEBOOK ════════════════════════════

// GET /api/platforms/facebook/auth
router.get('/facebook/auth', authMiddleware, (req: AuthRequest, res: Response) => {
  const state = crypto.randomUUID();
  oauthStates.set(state, { userId: req.userId! });
  const url = FacebookService.getAuthUrl(state);
  res.json({ success: true, data: { url } });
});

// GET /api/platforms/facebook/callback
router.get('/facebook/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state } = req.query;
    const stateData = oauthStates.get(state as string);

    if (!stateData) {
      res.status(400).json({ success: false, error: 'Invalid state' });
      return;
    }

    oauthStates.delete(state as string);
    const accounts = await FacebookService.handleCallback(code as string, stateData.userId);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/accounts?connected=facebook`);
  } catch (error) {
    next(error);
  }
});

// ═══ TWITTER ═════════════════════════════

// GET /api/platforms/twitter/auth
router.get('/twitter/auth', authMiddleware, (req: AuthRequest, res: Response) => {
  const { url, codeVerifier, state } = TwitterService.generateAuthLink();
  oauthStates.set(state, { userId: req.userId!, codeVerifier });
  res.json({ success: true, data: { url } });
});

// GET /api/platforms/twitter/callback
router.get('/twitter/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state } = req.query;
    const stateData = oauthStates.get(state as string);

    if (!stateData || !stateData.codeVerifier) {
      res.status(400).json({ success: false, error: 'Invalid state' });
      return;
    }

    oauthStates.delete(state as string);
    await TwitterService.handleCallback(code as string, stateData.codeVerifier, stateData.userId);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/accounts?connected=twitter`);
  } catch (error) {
    next(error);
  }
});

// ═══ PINTEREST ═══════════════════════════

// GET /api/platforms/pinterest/auth
router.get('/pinterest/auth', authMiddleware, (req: AuthRequest, res: Response) => {
  const state = crypto.randomUUID();
  oauthStates.set(state, { userId: req.userId! });
  const url = PinterestService.getAuthUrl(state);
  res.json({ success: true, data: { url } });
});

// GET /api/platforms/pinterest/callback
router.get('/pinterest/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state } = req.query;
    const stateData = oauthStates.get(state as string);

    if (!stateData) {
      res.status(400).json({ success: false, error: 'Invalid state' });
      return;
    }

    oauthStates.delete(state as string);
    await PinterestService.handleCallback(code as string, stateData.userId);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/accounts?connected=pinterest`);
  } catch (error) {
    next(error);
  }
});

// POST /api/platforms/pinterest/manual
router.post('/pinterest/manual', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      res.status(400).json({ success: false, error: 'Token is required' });
      return;
    }

    const axios = require('axios');
    const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';
    
    // Get user info
    const userResponse = await axios.get(`${PINTEREST_API_BASE}/user_account`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const pinterestUser = userResponse.data;

    const account = await prisma.platformAccount.upsert({
      where: {
        userId_platform_platformId: {
          userId: req.userId!,
          platform: 'PINTEREST',
          platformId: pinterestUser.username || pinterestUser.id,
        },
      },
      update: {
        accessToken: accessToken,
        accountName: pinterestUser.business_name || pinterestUser.username,
        tokenExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry for manual tokens
      },
      create: {
        userId: req.userId!,
        platform: 'PINTEREST',
        platformId: pinterestUser.username || pinterestUser.id,
        accountName: pinterestUser.business_name || pinterestUser.username,
        accessToken: accessToken,
        tokenExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        metadata: JSON.stringify({ profileImage: pinterestUser.profile_image }),
      },
    });

    res.json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
});

export default router;
