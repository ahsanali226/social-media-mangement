import { PostService } from '../services/post.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const post = await prisma.post.findUnique({
    where: { id: 'cmqb672pw0001uao0ulpqw9x6' },
  });

  if (!post) {
    console.error('Post not found');
    return;
  }

  console.log('Attempting to publish post:', post.id);
  try {
    const result = await PostService.publishPost(post.id, post.userId);
    console.log('Publish Result:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('Publish Error:', error);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
