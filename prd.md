Product requirements document
SocialSync — a unified social media management platform enabling brands to compose, schedule, publish, and analyze content across Facebook Twitter Pinterest from a single dashboard. Version 1.0 · Target launch: Q3 2025
Core features
AI post writer
Claude-powered content generation from a prompt. Adjusts tone, length, and hashtags per platform. Supports regeneration and manual editing.

Cross-platform composer
Single editor with per-platform character limits, image/video upload, link previews, and real-time previews for FB, Twitter, Pinterest.

Post scheduler
Calendar view with drag-and-drop rescheduling. Smart best-time suggestions. Queue management with bulk scheduling support.

Analytics dashboard
Per-platform reach, engagement, impressions, and click-through. Weekly/monthly trend views. Exportable CSV reports.

Notifications
Real-time alerts for publish success/failure, engagement milestones, and API quota warnings across all connected accounts.

Team workspace
Role-based access: Owner, Editor, Viewer. Draft approval workflow. Activity log. Invite team members via email.

Tech stack
 Frontend
React 18
Next.js 14
Tailwind CSS
TypeScript
Zustand
React Query
Framer Motion
 Backend
Node.js
Express.js
Prisma ORM
PostgreSQL
Redis
BullMQ
JWT Auth
 Platform APIs
Facebook Graph API v19
Twitter API v2
Pinterest API v5
OAuth 2.0
Webhook listeners
 Infrastructure
Vercel (frontend)
AWS EC2 (backend)
AWS S3 (media)
Docker
GitHub Actions CI
openai API (AI)
Development milestones
M1

Auth + project scaffold
Next.js setup, Tailwind config, Express API, PostgreSQL schema, JWT auth, user registration/login, OAuth app registration on FB/Twitter/Pinterest.

M2

Post composer + platform connections
Multi-platform composer UI, account OAuth connect flow, Facebook Graph API publishing, Twitter API v2 tweet creation, Pinterest Pin API.

M3

AI writer + scheduling engine
OPENai API integration for post generation, BullMQ job queue for scheduled posts, Redis caching, calendar view, queue management UI.

M4

Analytics + media uploads
Platform analytics ingestion (Insights API, Twitter metrics, Pinterest analytics), dashboard charts, S3 media upload, image/video attachment in composer.

M5
Week
Team workspace + RBAC
Role-based access control (Owner/Editor/Viewer), draft approval workflow, team invites, activity log, email notifications, webhook failure handling.

M6

QA, performance, launch
End-to-end testing, rate limit handling, error recovery, mobile responsiveness, CI/CD pipeline, production deployment on Vercel + AW

### graph api

FB_APP_ID=2764880580557148
FB_APP_SECRET=f179724ae345ab5a189962c1f983cb71

FB_PAGE_ID=1166330309893348
FB_ACCESS_TOKEN=EEAAnSpOzZAuVwBRliGP3ws1ffLmSkKpC4ZC0APz6vehptCk8QOQZA2cl8XCHjdZCbwGArTDpAuVVDfuMa67FZBmZAhVI2azj9e2DJfCsEI5bNsUDR7wob8yFZCy4v7m08sB29kZAboXOAlujjUvc6gRdu6Itgrb58V7BF3Bp2MG9yvoBzZAnnvlZC6bWBUj8KL6MwQ6h5lNcDhLVJbZCLwgHC5vrzL9uIkKyiv1CEwGZCK4vz5GfK8NrIEnZCTnpCkOBAIFB49oHkvZCSbfs8nGhqMTPiGL

# ── FACEBOOK OAUTH ──────────────────────────────────────────────────

FB_REDIRECT_URI=<http://localhost:5000/api/auth/facebook/callback>

# ── TWITTER / X API v2 ────────────────────────────────────────────

TWITTER_API_KEY=ckHCRsnyyfy1q5HkLKA0Vghf1
TWITTER_API_SECRET=5nm1RZ7N8ua4utVxmX42e4esLpN28BPLdTQtsNUcskItz0SDNZ
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAFP69wEAAAAAYfjGgU%2BS4qsFO372qK4%2BzP0CYKA%3DTlKqNodY5dTGzqR4kKOnQghn9bSEwy1atO9FYRNjP6THojSu7R
TWITTER_ACCESS_TOKEN=1964456833801768960-ksknZG46UYh0t5Ul9sW4bwwAhU7kCW
TWITTER_ACCESS_SECRET=WLBEBPVcXVQ5t2RtwXsIJDE6YIR0V8LAVTi4B0NBEJDyX
pin api
PINTEREST_APP_ID=1504934
PINTEREST_APP_SECRET=3c7ee4eb282d1db2cfdd7e8dacdb6f5190325e98
PINTEREST_REDIRECT_URI=<https://beam-willow-clearance-ranch.trycloudflare.com/api/auth/pinterest/callback>
PINTEREST_TOKEN=REDACTED_FOR_SECURITY
