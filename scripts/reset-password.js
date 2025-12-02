const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword(email, newPassword) {
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
      console.log('\nLet me create a new user for you...');
      
      // Create new user
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      const newUser = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          hashedPassword,
          onboardingCompleted: true,
        },
      });
      
      console.log(`✅ User created successfully!`);
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Name: ${newUser.name}`);
      console.log(`   Password: ${newPassword}`);
      return;
    }

    console.log(`✅ User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Has password: ${!!user.hashedPassword}`);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { email },
      data: { hashedPassword },
    });

    console.log(`\n✅ Password updated successfully!`);
    console.log(`   Email: ${email}`);
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
  console.log('Usage: node scripts/reset-password.js <email> [password]');
  console.log('Example: node scripts/reset-password.js leonardo.palha@gmail.com senha123');
  process.exit(1);
}

resetPassword(email, password);
