import { Router, Response, NextFunction } from 'express';
import { PostService } from '../services/post.service';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// All post routes require auth
router.use(authMiddleware);

// GET /api/posts — List user's posts
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const posts = await PostService.getUserPosts(req.userId!, status as string);
    res.json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
});

// GET /api/posts/stats — Dashboard stats
router.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await PostService.getDashboardStats(req.userId!);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/posts/scheduled — Scheduled posts
router.get('/scheduled', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const posts = await PostService.getScheduledPosts(req.userId!);
    res.json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
});

// POST /api/posts — Create a new post
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, mediaUrls, platformAccountIds, scheduledAt } = req.body;

    if (!content) {
      res.status(400).json({ success: false, error: 'Content is required' });
      return;
    }

    const post = await PostService.createPost(req.userId!, {
      content,
      mediaUrls,
      platformAccountIds: platformAccountIds || [],
      scheduledAt,
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
});

// GET /api/posts/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await PostService.getPostById(req.params.id as string, req.userId!);
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
});

// PUT /api/posts/:id
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, mediaUrls, scheduledAt } = req.body;
    const post = await PostService.updatePost(req.params.id as string, req.userId!, {
      content,
      mediaUrls,
      scheduledAt,
    });
    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/posts/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await PostService.deletePost(req.params.id as string, req.userId!);
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
});

// POST /api/posts/:id/publish
router.post('/:id/publish', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await PostService.publishPost(req.params.id as string, req.userId!);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
