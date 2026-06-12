import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import aiRoutes from './routes/ai.routes';
import platformRoutes from './routes/platform.routes';
import { ScheduleService } from './services/schedule.service';

const app = express();

// ── Middleware ────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health Check ─────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────
app.get('/api/auth/pinterest/callback', (req, res) => {
  const query = new URLSearchParams(req.query as any).toString();
  res.redirect(`/api/platforms/pinterest/callback?${query}`);
});

app.get('/api/auth/facebook/callback', (req, res) => {
  const query = new URLSearchParams(req.query as any).toString();
  res.redirect(`/api/platforms/facebook/callback?${query}`);
});

app.get('/api/auth/twitter/callback', (req, res) => {
  const query = new URLSearchParams(req.query as any).toString();
  res.redirect(`/api/platforms/twitter/callback?${query}`);
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/platforms', platformRoutes);

// ── Error Handling ───────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ─────────────────────────
const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🚀 SocialSync API Server              ║
  ║   Running on http://localhost:${PORT}       ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}            ║
  ╚══════════════════════════════════════════╝
  `);
  
  // Start scheduled post polling service
  ScheduleService.start();
});

export default app;

