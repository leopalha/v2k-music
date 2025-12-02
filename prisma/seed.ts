import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'artist@v2k.com' },
    update: {},
    create: {
      email: 'artist@v2k.com',
      name: 'Demo Artist',
      hashedPassword: hashedPassword,
      username: 'demoartist',
      walletAddress: '0x1234567890123456789012345678901234567890',
      kycStatus: 'VERIFIED',
      bio: 'Electronic music producer and blockchain enthusiast',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'investor@v2k.com' },
    update: {},
    create: {
      email: 'investor@v2k.com',
      name: 'Demo Investor',
      hashedPassword: hashedPassword,
      username: 'demoinvestor',
      walletAddress: '0x2345678901234567890123456789012345678901',
      kycStatus: 'VERIFIED',
      bio: 'Music investor looking for the next big hit',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'fan@v2k.com' },
    update: {},
    create: {
      email: 'fan@v2k.com',
      name: 'Demo Fan',
      hashedPassword: hashedPassword,
      username: 'demofan',
      walletAddress: '0x3456789012345678901234567890123456789012',
      kycStatus: 'VERIFIED',
    },
  });

  console.log('✅ Created users:', { user1: user1.email, user2: user2.email, user3: user3.email });

  // 2. Create sample tracks with real audio/image URLs
  const track1 = await prisma.track.create({
    data: {
      title: 'Midnight Dreams',
      artistId: user1.id,
      artistName: user1.name!,
      genre: 'ELECTRONIC',
      duration: 245,
      bpm: 128,
      key: 'Am',
      // Free audio from Pixabay
      audioUrl: 'https://cdn.pixabay.com/audio/2022/08/02/audio_8adc2c49fe.mp3',
      // Unsplash random image with music theme
      coverUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=500&h=500&fit=crop',
      totalSupply: 10000,
      availableSupply: 7500,
      currentPrice: 10.0,
      initialPrice: 10.0,
      marketCap: 100000,
      volume24h: 5000,
      priceChange24h: 2.5,
      holders: 15,
      totalStreams: 125000,
      spotifyStreams: 75000,
      youtubeViews: 35000,
      tiktokViews: 15000,
      totalRoyalties: 1250.0,
      monthlyRoyalty: 150.0,
      aiScore: 92,
      predictedROI: 45.5,
      viralProbability: 0.78,
      status: 'LIVE',
      isActive: true,
      isFeatured: true,
      contractAddress: '0x4567890123456789012345678901234567890123',
    },
  });

  const track2 = await prisma.track.create({
    data: {
      title: 'Summer Vibes',
      artistId: user1.id,
      artistName: user1.name!,
      genre: 'POP',
      duration: 198,
      bpm: 120,
      key: 'C',
      // Free audio from Pixabay
      audioUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_c6b23e9e17.mp3',
      // Unsplash random image with summer/beach theme
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
      totalSupply: 5000,
      availableSupply: 4200,
      currentPrice: 25.0,
      initialPrice: 25.0,
      marketCap: 125000,
      volume24h: 8000,
      priceChange24h: -1.2,
      holders: 22,
      totalStreams: 98000,
      spotifyStreams: 60000,
      youtubeViews: 28000,
      tiktokViews: 10000,
      totalRoyalties: 980.0,
      monthlyRoyalty: 120.0,
      aiScore: 88,
      predictedROI: 38.2,
      viralProbability: 0.65,
      status: 'LIVE',
      isActive: true,
      isFeatured: false,
      contractAddress: '0x5678901234567890123456789012345678901234',
    },
  });

  const track3 = await prisma.track.create({
    data: {
      title: 'Urban Pulse',
      artistId: user1.id,
      artistName: user1.name!,
      genre: 'RAP',
      duration: 210,
      bpm: 95,
      key: 'Fm',
      // Free audio from Pixabay
      audioUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_00d3ab3f5c.mp3',
      // Unsplash random image with urban/city theme
      coverUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&h=500&fit=crop',
      totalSupply: 8000,
      availableSupply: 3000,
      currentPrice: 15.5,
      initialPrice: 15.0,
      marketCap: 124000,
      volume24h: 12000,
      priceChange24h: 3.3,
      holders: 38,
      totalStreams: 210000,
      spotifyStreams: 140000,
      youtubeViews: 50000,
      tiktokViews: 20000,
      totalRoyalties: 2100.0,
      monthlyRoyalty: 250.0,
      aiScore: 95,
      predictedROI: 52.8,
      viralProbability: 0.85,
      status: 'LIVE',
      isActive: true,
      isFeatured: true,
      contractAddress: '0x6789012345678901234567890123456789012345',
    },
  });

  console.log('✅ Created tracks:', { track1: track1.title, track2: track2.title, track3: track3.title });

  // 3. Create sample transactions
  await prisma.transaction.create({
    data: {
      userId: user2.id,
      trackId: track1.id,
      type: 'BUY',
      amount: 100,
      price: 10.0,
      totalValue: 1000.0,
      fee: 10.0,
      txHash: '0x7890123456789012345678901234567890123456',
      status: 'COMPLETED',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user3.id,
      trackId: track3.id,
      type: 'BUY',
      amount: 50,
      price: 15.5,
      totalValue: 775.0,
      fee: 7.75,
      txHash: '0x8901234567890123456789012345678901234567',
      status: 'COMPLETED',
    },
  });

  console.log('✅ Created sample transactions');

  // 4. Create portfolios
  await prisma.portfolio.create({
    data: {
      userId: user2.id,
      trackId: track1.id,
      amount: 100,
      avgBuyPrice: 10.0,
      currentValue: 1000.0,
      totalInvested: 1000.0,
      unrealizedPnL: 0,
    },
  });

  await prisma.portfolio.create({
    data: {
      userId: user3.id,
      trackId: track3.id,
      amount: 50,
      avgBuyPrice: 15.5,
      currentValue: 775.0,
      totalInvested: 775.0,
      unrealizedPnL: 0,
    },
  });

  console.log('✅ Created portfolios');

  // 5. Create price history
  const baseDate = new Date('2024-01-15');
  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    
    await prisma.priceHistory.create({
      data: {
        trackId: track1.id,
        price: 10.0 + Math.random() * 2 - 1, // Variação entre 9 e 11
        volume: Math.floor(Math.random() * 1000) + 500,
        timestamp: date,
      },
    });
  }

  console.log('✅ Created price history (30 days for track1)');

  // 6. Create UserStats for all users
  await prisma.userStats.create({
    data: {
      userId: user1.id,
      totalInvested: 0,
      totalProfit: 0,
      portfolioValue: 0,
      followersCount: 2,
      followingCount: 0,
      commentsCount: 0,
      likesReceived: 0,
    },
  });

  await prisma.userStats.create({
    data: {
      userId: user2.id,
      totalInvested: 1000,
      totalProfit: 0,
      portfolioValue: 1000,
      followersCount: 0,
      followingCount: 1,
      totalTrades: 1,
      profitableTrades: 0,
    },
  });

  await prisma.userStats.create({
    data: {
      userId: user3.id,
      totalInvested: 775,
      totalProfit: 0,
      portfolioValue: 775,
      followersCount: 0,
      followingCount: 1,
      totalTrades: 1,
    },
  });

  console.log('✅ Created user stats');

  // 7. Create Achievement for user2 (first investment)
  await prisma.achievement.create({
    data: {
      userId: user2.id,
      type: 'FIRST_INVESTMENT',
      tier: 'BRONZE',
      title: 'First Steps',
      description: 'Made your first investment',
      points: 10,
      icon: '🎯',
      unlocked: true,
      unlockedAt: new Date(),
      progress: 1,
      target: 1,
    },
  });

  console.log('✅ Created sample achievement');

  // 8. Create some follows
  await prisma.follow.create({
    data: {
      followerId: user2.id,
      followingId: user1.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: user3.id,
      followingId: user1.id,
    },
  });

  console.log('✅ Created follows');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
