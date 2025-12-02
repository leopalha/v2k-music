const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Updating KYC status for all users...');
  
  const result = await prisma.user.updateMany({
    where: {
      email: {
        in: ['investor@v2k.com', 'fan@v2k.com', 'artist@v2k.com']
      }
    },
    data: {
      kycStatus: 'VERIFIED'
    }
  });
  
  console.log(`✅ Updated ${result.count} users to VERIFIED`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
