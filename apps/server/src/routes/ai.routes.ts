import { Router, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// POST /api/ai/generate
router.post('/generate', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { prompt, platform, tone, maxLength } = req.body;

    if (!prompt) {
      res.status(400).json({ success: false, error: 'Prompt is required' });
      return;
    }

    const result = await AIService.generatePost({
      prompt,
      platform: platform || 'FACEBOOK',
      tone: tone || 'professional',
      maxLength,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
