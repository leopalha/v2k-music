/**
 * Script to test E2E user authentication
 * Run with: npx tsx scripts/test-auth.ts
 */

import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

async function testAuth() {
  console.log('🔍 Testing E2E User Authentication\n');

  const email = 'investor@v2k.e2e';
  const password = 'Test123!@#';

  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}\n`);

  // 1. Check if user exists
  console.log('1️⃣ Checking if user exists...');
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      hashedPassword: true,
      role: true,
      cashBalance: true,
      kycStatus: true,
      onboardingCompleted: true,
    },
  });

  if (!user) {
    console.log('❌ User NOT found in database!');
    console.log('\n💡 Run: npx prisma db seed');
    return;
  }

  console.log('✅ User found!');
  console.log(`   ID: ${user.id}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Balance: R$ ${user.cashBalance}`);
  console.log(`   KYC: ${user.kycStatus}`);
  console.log(`   Onboarding: ${user.onboardingCompleted}`);
  console.log(`   Has Password: ${!!user.hashedPassword}`);

  // 2. Check password
  console.log('\n2️⃣ Validating password...');
  
  if (!user.hashedPassword) {
    console.log('❌ User has no hashed password!');
    return;
  }

  const isValid = await compare(password, user.hashedPassword);
  
  if (!isValid) {
    console.log('❌ Password does NOT match!');
    console.log('\n🔍 Debugging info:');
    console.log(`   Hashed Password (first 20 chars): ${user.hashedPassword.substring(0, 20)}...`);
    console.log(`   Hash length: ${user.hashedPassword.length}`);
    console.log(`   Expected length: ~60 (bcrypt)`);
    return;
  }

  console.log('✅ Password matches!');
  console.log('\n🎉 Authentication would succeed!');
  console.log('\n📝 NextAuth would return:');
  console.log(JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    image: null,
  }, null, 2));
}

testAuth()
  .catch((e) => {
    console.error('\n❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
