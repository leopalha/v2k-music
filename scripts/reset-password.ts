import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword(email: string, newPassword: string) {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        hashedPassword: true,
      },
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    console.log(`✅ User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Has password: ${!!user.hashedPassword}`);

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { email },
      data: { hashedPassword },
    });

    console.log(`\n✅ Password updated successfully!`);
    console.log(`   New password: ${newPassword}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email and password from command line
const email = process.argv[2];
const password = process.argv[3] || 'senha123';

if (!email) {
  console.log('Usage: npx ts-node scripts/reset-password.ts <email> [password]');
  console.log('Example: npx ts-node scripts/reset-password.ts leonardo.palha@gmail.com senha123');
  process.exit(1);
}

resetPassword(email, password);
