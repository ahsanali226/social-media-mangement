import prisma from '../config/database';
import { PostService } from './post.service';

export class ScheduleService {
  private static intervalId: NodeJS.Timeout | null = null;

  static start(intervalMs: number = 60000) {
    if (this.intervalId) return;

    console.log('⏰ Scheduler service started. Checking for scheduled posts every minute...');
    
    // Run an initial check immediately
    this.checkAndPublishScheduledPosts().catch((error) => {
      console.error('Initial scheduler check failed:', error);
    });

    this.intervalId = setInterval(async () => {
      try {
        await this.checkAndPublishScheduledPosts();
      } catch (error) {
        console.error('Error in scheduled post runner:', error);
      }
    }, intervalMs);
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏰ Scheduler service stopped.');
    }
  }

  static async checkAndPublishScheduledPosts() {
    const now = new Date();

    // Find all scheduled posts that are due
    const postsToPublish = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now,
        },
      },
    });

    if (postsToPublish.length === 0) return;

    console.log(`⏰ Found ${postsToPublish.length} scheduled posts due for publishing.`);

    for (const post of postsToPublish) {
      try {
        console.log(`🚀 Publishing scheduled post ${post.id}...`);
        const result = await PostService.publishPost(post.id, post.userId);
        console.log(`✅ Successfully published scheduled post ${post.id}:`, result);
      } catch (error) {
        console.error(`❌ Failed to publish scheduled post ${post.id}:`, error);
        
        await prisma.post.update({
          where: { id: post.id },
          data: { status: 'FAILED' },
        });
      }
    }
  }
}
