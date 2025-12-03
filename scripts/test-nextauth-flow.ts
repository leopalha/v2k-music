/**
 * Simulates exactly what NextAuth does during login
 * Run with: npx tsx scripts/test-nextauth-flow.ts
 */

// Simulate the exact NextAuth flow
async function testNextAuthFlow() {
  console.log('🔐 Simulating NextAuth Login Flow\n');

  const email = 'investor@v2k.e2e';
  const password = 'Test123!@#';

  console.log(`Testing with:`);
  console.log(`  Email: "${email}"`);
  console.log(`  Password: "${password}"`);
  console.log(`  Password length: ${password.length}`);
  console.log(`  Password bytes: ${Buffer.from(password).toString('hex')}\n`);

  try {
    // Import the EXACT function NextAuth uses
    const { validateCredentials } = await import('../src/lib/auth-helpers');

    console.log('Calling validateCredentials()...\n');
    const result = await validateCredentials(email, password);

    if (!result) {
      console.log('❌ validateCredentials returned NULL');
      console.log('\nThis is why NextAuth returns 401!');
      console.log('\n🔍 Possible causes:');
      console.log('  1. User not found in database');
      console.log('  2. User has no hashedPassword');
      console.log('  3. Password does not match hash');
      console.log('  4. Database connection issue');
      return;
    }

    console.log('✅ validateCredentials returned user:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n🎉 This should work in NextAuth!');

  } catch (error) {
    console.error('❌ Error during validation:');
    console.error(error);
  }
}

testNextAuthFlow();
