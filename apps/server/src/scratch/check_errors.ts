import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const failedPlatforms = await prisma.postPlatform.findMany({
    where: {
      status: 'FAILED',
    },
    include: {
      post: true,
      account: true,
    },
    orderBy: {
      id: 'desc',
    },
    take: 5,
  });

  if (failedPlatforms.length === 0) {
    console.log('No failed post platforms found.');
    return;
  }

  for (const fp of failedPlatforms) {
    console.log(`-----------------------------------------------`);
    console.log(`Post ID: ${fp.postId}`);
    console.log(`Platform: ${fp.account.platform}`);
    console.log(`Account Name: ${fp.account.accountName}`);
    console.log(`Status: ${fp.status}`);
    console.log(`Error Message: ${fp.errorMessage}`);
    console.log(`Content Preview: ${fp.post.content.substring(0, 100)}...`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
