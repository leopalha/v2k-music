#!/usr/bin/env node

/**
 * Update Contract Addresses Script
 * 
 * This script reads deployment info from contracts/deployments/polygon.json
 * and updates the contract addresses in the frontend configuration.
 * 
 * Usage:
 *   node scripts/update-contract-addresses.js [network]
 * 
 * Example:
 *   node scripts/update-contract-addresses.js polygon
 *   node scripts/update-contract-addresses.js polygonAmoy
 */

const fs = require('fs');
const path = require('path');

const network = process.argv[2] || 'polygon';
const deploymentsPath = path.join(__dirname, '../../contracts/deployments', `${network}.json`);
const envPath = path.join(__dirname, '../.env.local');

console.log('\n========================================');
console.log('UPDATING CONTRACT ADDRESSES');
console.log('========================================\n');

// Check if deployment file exists
if (!fs.existsSync(deploymentsPath)) {
  console.error(`❌ Deployment file not found: ${deploymentsPath}`);
  console.error(`\nMake sure you've deployed contracts to ${network} first.`);
  console.error(`Run: cd contracts && npm run deploy:${network}\n`);
  process.exit(1);
}

// Read deployment info
const deployment = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
console.log(`✅ Loaded deployment from: ${network}`);
console.log(`   Chain ID: ${deployment.chainId}`);
console.log(`   Deployed at: ${deployment.deployedAt}`);
console.log(`   Deployer: ${deployment.deployer}\n`);

// Read current .env.local (or create new)
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log(`✅ Found existing .env.local`);
} else {
  console.log(`⚠️  .env.local not found, creating new file`);
}

// Update or add contract addresses
const addresses = deployment.contracts;
const updates = {
  NEXT_PUBLIC_CHAIN_ID: deployment.chainId.toString(),
  NEXT_PUBLIC_MUSIC_TOKEN_ADDRESS: addresses.MusicToken,
  NEXT_PUBLIC_ROYALTY_DISTRIBUTOR_ADDRESS: addresses.RoyaltyDistributor,
  NEXT_PUBLIC_MARKETPLACE_ADDRESS: addresses.Marketplace,
};

console.log('\n📝 Updating environment variables:\n');

for (const [key, value] of Object.entries(updates)) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  
  if (regex.test(envContent)) {
    // Update existing
    envContent = envContent.replace(regex, `${key}=${value}`);
    console.log(`   ✏️  Updated ${key}`);
  } else {
    // Add new
    envContent += `\n${key}=${value}`;
    console.log(`   ➕ Added ${key}`);
  }
  
  console.log(`      → ${value}`);
}

// Write updated .env.local
fs.writeFileSync(envPath, envContent);

console.log('\n========================================');
console.log('✅ CONTRACT ADDRESSES UPDATED!');
console.log('========================================\n');

console.log('📋 Summary:');
console.log(`   Network: ${network}`);
console.log(`   Chain ID: ${deployment.chainId}`);
console.log(`   MusicToken: ${addresses.MusicToken}`);
console.log(`   RoyaltyDistributor: ${addresses.RoyaltyDistributor}`);
console.log(`   Marketplace: ${addresses.Marketplace}`);

console.log('\n💡 Next steps:');
console.log('   1. Restart your dev server: npm run dev');
console.log('   2. Verify contracts load correctly in browser console');
console.log('   3. Test investment flow with MetaMask');
console.log('\n');

// If production, remind about Vercel
if (network === 'polygon') {
  console.log('⚠️  PRODUCTION DEPLOYMENT:');
  console.log('   Remember to update Vercel environment variables:');
  console.log('   1. Go to https://vercel.com/your-project/settings/environment-variables');
  console.log(`   2. Update NEXT_PUBLIC_MUSIC_TOKEN_ADDRESS: ${addresses.MusicToken}`);
  console.log(`   3. Update NEXT_PUBLIC_ROYALTY_DISTRIBUTOR_ADDRESS: ${addresses.RoyaltyDistributor}`);
  console.log(`   4. Update NEXT_PUBLIC_MARKETPLACE_ADDRESS: ${addresses.Marketplace}`);
  console.log('   5. Redeploy: git commit && git push\n');
}
