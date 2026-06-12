import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const failed = await prisma.postPlatform.findMany({
  where: { status: 'FAILED' },
  include: { post: true, account: true },
  orderBy: { id: 'desc' },
  take: 10,
});

if (failed.length === 0) {
  console.log('No failed posts found.');
} else {
  for (const f of failed) {
    console.log('---');
    console.log('Platform:', f.account.platform);
    console.log('Account:', f.account.accountName);
    console.log('Token (first 20):', f.account.accessToken?.substring(0, 20));
    console.log('Refresh Token:', f.account.refreshToken ? 'YES' : 'NO');
    console.log('Error:', f.errorMessage);
  }
}

await prisma.$disconnect();
