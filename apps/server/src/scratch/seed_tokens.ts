import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found in the database. Please log in or sign up first on the UI to create a user account.');
    return;
  }

  console.log(`Linking credentials for user: ${user.email} (${user.id})`);

  // Facebook
  await prisma.platformAccount.upsert({
    where: {
      userId_platform_platformId: {
        userId: user.id,
        platform: 'FACEBOOK',
        platformId: '1166330309893348',
      },
    },
    update: {
      accountName: 'Facebook Page (Demo)',
      accessToken: 'EEAAnSpOzZAuVwBRliGP3ws1ffLmSkKpC4ZC0APz6vehptCk8QOQZA2cl8XCHjdZCbwGArTDpAuVVDfuMa67FZBmZAhVI2azj9e2DJfCsEI5bNsUDR7wob8yFZCy4v7m08sB29kZAboXOAlujjUvc6gRdu6Itgrb58V7BF3Bp2MG9yvoBzZAnnvlZC6bWBUj8KL6MwQ6h5lNcDhLVJbZCLwgHC5vrzL9uIkKyiv1CEwGZCK4vz5GfK8NrIEnZCTnpCkOBAIFB49oHkvZCSbfs8nGhqMTPiGL',
    },
    create: {
      userId: user.id,
      platform: 'FACEBOOK',
      platformId: '1166330309893348',
      accountName: 'Facebook Page (Demo)',
      accessToken: 'EEAAnSpOzZAuVwBRliGP3ws1ffLmSkKpC4ZC0APz6vehptCk8QOQZA2cl8XCHjdZCbwGArTDpAuVVDfuMa67FZBmZAhVI2azj9e2DJfCsEI5bNsUDR7wob8yFZCy4v7m08sB29kZAboXOAlujjUvc6gRdu6Itgrb58V7BF3Bp2MG9yvoBzZAnnvlZC6bWBUj8KL6MwQ6h5lNcDhLVJbZCLwgHC5vrzL9uIkKyiv1CEwGZCK4vz5GfK8NrIEnZCTnpCkOBAIFB49oHkvZCSbfs8nGhqMTPiGL',
    },
  });
  console.log('✅ Facebook Page linked successfully.');

  // Twitter (OAuth 1.0a compatible)
  await prisma.platformAccount.upsert({
    where: {
      userId_platform_platformId: {
        userId: user.id,
        platform: 'TWITTER',
        platformId: '1964456833801768960',
      },
    },
    update: {
      accountName: 'Twitter (Demo)',
      accessToken: '1964456833801768960-0pFn1Gg2frCFzY96DnaW4Of8H8wm9z',
      refreshToken: 'T5ITLhXXKpNoakKpPgYVkK9uX31OdQeu4feBh6sIAfsvP', // Access Token Secret
    },
    create: {
      userId: user.id,
      platform: 'TWITTER',
      platformId: '1964456833801768960',
      accountName: 'Twitter (Demo)',
      accessToken: '1964456833801768960-0pFn1Gg2frCFzY96DnaW4Of8H8wm9z',
      refreshToken: 'T5ITLhXXKpNoakKpPgYVkK9uX31OdQeu4feBh6sIAfsvP', // Access Token Secret
    },
  });
  console.log('✅ Twitter Account linked successfully.');

  // Pinterest
  await prisma.platformAccount.upsert({
    where: {
      userId_platform_platformId: {
        userId: user.id,
        platform: 'PINTEREST',
        platformId: 'pinterest_dev',
      },
    },
    update: {
      accountName: 'Pinterest (Demo)',
      accessToken: 'REDACTED_FOR_SECURITY',
    },
    create: {
      userId: user.id,
      platform: 'PINTEREST',
      platformId: 'pinterest_dev',
      accountName: 'Pinterest (Demo)',
      accessToken: 'REDACTED_FOR_SECURITY',
    },
  });
  console.log('✅ Pinterest Account linked successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
