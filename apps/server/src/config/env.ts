import dotenv from 'dotenv';
import { z } from 'zod';

// Load from Vercel environment variables (don't specify path)
dotenv.config();

// Fallbacks for critical missing/empty env variables to prevent crash on startup (e.g. on Vercel)
const fallbackEnv = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_hdQxtr5C2XvE@ep-nameless-haze-aize7w4p-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret-key-change-me-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-jwt-refresh-secret-key-change-me-in-production',
};

// Check if we are using fallback values in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ WARNING: DATABASE_URL is not configured. Falling back to local SQLite database.');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 10) {
    console.warn('⚠️ WARNING: JWT_SECRET is not configured or too short. Falling back to a default key.');
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 10) {
    console.warn('⚠️ WARNING: JWT_REFRESH_SECRET is not configured or too short. Falling back to a default key.');
  }
}

// Ensure process.env contains these values for Prisma and other consumers
process.env.DATABASE_URL = fallbackEnv.DATABASE_URL;
process.env.JWT_SECRET = fallbackEnv.JWT_SECRET;
process.env.JWT_REFRESH_SECRET = fallbackEnv.JWT_REFRESH_SECRET;

const envSchema = z.object({
  PORT: z.string().default('4000'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET must be at least 10 characters'),
  OPENAI_API_KEY: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  FACEBOOK_REDIRECT_URI: z.string().optional(),
  TWITTER_CLIENT_ID: z.string().optional(),
  TWITTER_CLIENT_SECRET: z.string().optional(),
  TWITTER_API_KEY: z.string().optional(),
  TWITTER_API_SECRET: z.string().optional(),
  TWITTER_REDIRECT_URI: z.string().optional(),
  PINTEREST_APP_ID: z.string().optional(),
  PINTEREST_APP_SECRET: z.string().optional(),
  PINTEREST_REDIRECT_URI: z.string().optional(),
  REDIS_URL: z.string().optional(),
  NODE_ENV: z.string().default('production'),
});

type Env = z.infer<typeof envSchema>;

let env: Env;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('Environment validation failed:', error);
  process.exit(1);
}

export { env };
export type { Env };
