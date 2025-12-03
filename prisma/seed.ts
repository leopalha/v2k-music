import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to generate random date in past N days
function randomPastDate(daysAgo: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const random = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(random);
}

// Helper to generate random number in range
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to pick random item from array
function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.priceAlert.deleteMany();
  await prisma.limitOrder.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.track.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.user.deleteMany();

  // ===== 1. CREATE USERS =====
  console.log('\n👥 Creating users...');
  
  const password = await hash('password123', 12);
  const e2ePassword = await hash('Test123!@#', 10); // E2E test password
  
  // E2E Test Users (for automated testing)
  console.log('  Creating E2E test users...');
  const e2eInvestor = await prisma.user.create({
    data: {
      email: 'investor@v2k.e2e',
      name: 'Test Investor',
      hashedPassword: e2ePassword,
      role: 'USER',
      kycStatus: 'VERIFIED',
      cashBalance: 10000,
      onboardingCompleted: true,
      emailNotifications: true,
      notifyInvestments: true,
    },
  });
  
  const e2eArtist = await prisma.user.create({
    data: {
      email: 'artist@v2k.e2e',
      name: 'Test Artist',
      username: 'test_artist',
      hashedPassword: e2ePassword,
      role: 'USER',
      kycStatus: 'VERIFIED',
      onboardingCompleted: true,
      bio: 'Test artist for E2E testing',
    },
  });
  
  const e2eAdmin = await prisma.user.create({
    data: {
      email: 'admin@v2k.e2e',
      name: 'Test Admin',
      hashedPassword: e2ePassword,
      role: 'ADMIN',
      kycStatus: 'VERIFIED',
      onboardingCompleted: true,
    },
  });
  
  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@v2k.music',
      name: 'Admin V2K',
      hashedPassword: password,
      role: 'ADMIN',
      kycStatus: 'VERIFIED',
      cashBalance: 10000,
    },
  });

  // 10 Artist users
  const artistNames = [
    'MC Kevinho', 'MC Lan', 'DJ GBR', 'MC Davi', 'DJ Rennan',
    'Anitta', 'Ludmilla', 'Pabllo Vittar', 'MC Hariel', 'MC IG'
  ];

  const artists = [];
  for (const name of artistNames) {
    const email = name.toLowerCase().replace(/\s+/g, '.') + '@artist.com';
    const artist = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword: password,
        role: 'USER',
        kycStatus: 'VERIFIED',
        cashBalance: randomInRange(5000, 50000),
        bio: `${name} - Artista verificado da V2K Music`,
        level: randomInRange(5, 15),
        xp: randomInRange(1000, 10000),
      },
    });
    artists.push(artist);
  }

  // 50 Investor users
  const investors = [];
  for (let i = 1; i <= 50; i++) {
    const investor = await prisma.user.create({
      data: {
        email: `investor${i}@test.com`,
        name: `Investor ${i}`,
        hashedPassword: password,
        role: 'USER',
        kycStatus: 'VERIFIED',
        cashBalance: randomInRange(100, 10000),
        level: randomInRange(1, 10),
        xp: randomInRange(0, 5000),
      },
    });
    investors.push(investor);
  }

  console.log(`✅ Created ${4 + artists.length + investors.length} users (including 3 E2E test users)`);

  // ===== 2. CREATE TRACKS =====
  console.log('\n🎵 Creating tracks...');

  const genres = ['FUNK', 'POP', 'RAP', 'ELECTRONIC', 'ROCK'];

  const trackNames = [
    'Modo Turbo', 'Rave de Favela', 'Beat Envolvente', 'Solta o Som', 'Baile do Piso',
    'Dança da Madrugada', 'Ritmo Contagiante', 'Som do Verão', 'Festa no Apê', 'Grave Pesado',
    'Vibe Tropical', 'Batida Perfeita', 'Fluxo Intenso', 'Energia Pura', 'Melodia Viciante',
    'Drop Insano', 'Bass Profundo', 'Refrão Chiclete', 'Hit do Momento', 'Sucesso Garantido',
    'Agito Total', 'Grave e Agudo', 'Mixagem Top', 'Produção Premium', 'Som Diferenciado',
    'Track Exclusiva', 'Lançamento Especial', 'Novidade Fresquinha', 'Hype Real', 'Viral Garantido'
  ];

  const tracks = [];
  for (let i = 0; i < 30; i++) {
    const artist = pickRandom(artists);
    const genre = pickRandom(genres) as 'FUNK' | 'POP' | 'RAP' | 'ELECTRONIC' | 'ROCK';
    const price = parseFloat((Math.random() * (0.05 - 0.01) + 0.01).toFixed(4));
    const totalSupply = 10000;
    const availableSupply = randomInRange(5000, 9000);
    const holders = randomInRange(5, 50);
    const totalStreams = randomInRange(10000, 1000000);
    
    const track = await prisma.track.create({
      data: {
        title: trackNames[i],
        artistName: artist.name!,
        artistId: artist.id,
        genre,
        duration: randomInRange(120, 300),
        coverUrl: `https://images.unsplash.com/photo-${1500000000000 + i}?w=500&h=500&fit=crop`,
        audioUrl: `https://cdn.pixabay.com/audio/2022/08/02/audio_demo_${i}.mp3`,
        currentPrice: price,
        totalSupply,
        availableSupply,
        initialPrice: price * 0.8,
        status: 'LIVE',
        holders,
        totalStreams,
        spotifyStreams: Math.floor(totalStreams * 0.6),
        youtubeViews: Math.floor(totalStreams * 0.25),
        tiktokViews: Math.floor(totalStreams * 0.15),
        aiScore: randomInRange(50, 95),
        volume24h: parseFloat((holders * randomInRange(100, 5000) * price).toFixed(2)),
        totalRoyalties: parseFloat((totalStreams * 0.001).toFixed(2)),
        monthlyRoyalty: parseFloat((totalStreams * 0.0001).toFixed(2)),
      },
    });
    tracks.push(track);
  }

  console.log(`✅ Created ${tracks.length} tracks`);

  // ===== 3. CREATE TRANSACTIONS =====
  console.log('\n💸 Creating transactions...');

  const transactions = [];
  for (let i = 0; i < 200; i++) {
    const track = pickRandom(tracks);
    const investor = pickRandom(investors);
    const amount = randomInRange(10, 500);
    const date = randomPastDate(90);
    const totalValue = amount * track.currentPrice;

    const transaction = await prisma.transaction.create({
      data: {
        type: 'BUY',
        trackId: track.id,
        userId: investor.id,
        amount,
        price: track.currentPrice,
        totalValue,
        fee: totalValue * 0.025,
        status: 'COMPLETED',
        paymentMethod: pickRandom(['CREDIT_CARD', 'PIX', 'BALANCE']),
        txHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        createdAt: date,
      },
    });
    transactions.push(transaction);
  }

  console.log(`✅ Created ${transactions.length} transactions`);

  // ===== 4. CREATE PORTFOLIO HOLDINGS =====
  console.log('\n📊 Creating portfolio holdings...');

  // Group transactions by user and track
  const holdingMap = new Map<string, { userId: string, trackId: string, amount: number, totalInvested: number }>();

  for (const tx of transactions) {
    const key = `${tx.userId}-${tx.trackId}`;
    const existing = holdingMap.get(key);
    
    if (existing) {
      existing.amount += tx.amount;
      existing.totalInvested += tx.totalValue;
    } else {
      holdingMap.set(key, {
        userId: tx.userId,
        trackId: tx.trackId,
        amount: tx.amount,
        totalInvested: tx.totalValue,
      });
    }
  }

  let holdingsCount = 0;
  for (const [_, holding] of holdingMap) {
    const track = tracks.find(t => t.id === holding.trackId)!;
    const avgBuyPrice = holding.totalInvested / holding.amount;
    const currentValue = holding.amount * track.currentPrice;
    const unrealizedPnL = currentValue - holding.totalInvested;

    await prisma.portfolio.create({
      data: {
        userId: holding.userId,
        trackId: holding.trackId,
        amount: holding.amount,
        avgBuyPrice,
        totalInvested: holding.totalInvested,
        currentValue,
        unrealizedPnL,
        unclaimedRoyalties: parseFloat((Math.random() * 50).toFixed(2)),
      },
    });
    holdingsCount++;
  }

  console.log(`✅ Created ${holdingsCount} portfolio holdings`);

  // ===== 5. CREATE COMMENTS =====
  console.log('\n💬 Creating comments...');

  const commentTexts = [
    'Esse track é incrível! Já comprei tokens 🚀',
    'Melhor investimento que fiz esse mês',
    'Tá subindo rápido, quem não comprou vai se arrepender',
    'Som top demais, merecido o sucesso',
    'Produção impecável, vai bombar com certeza',
    'Já tô no lucro! 📈',
    'Artista talentoso, vale cada centavo',
    'Música viciante, só sobe!',
  ];

  for (let i = 0; i < 50; i++) {
    await prisma.comment.create({
      data: {
        trackId: pickRandom(tracks).id,
        userId: pickRandom(investors).id,
        content: pickRandom(commentTexts),
        likes: randomInRange(0, 50),
        createdAt: randomPastDate(30),
      },
    });
  }

  console.log('✅ Created 50 comments');

  // ===== 6. CREATE NOTIFICATIONS =====
  console.log('\n🔔 Creating notifications...');

  for (const investor of investors.slice(0, 20)) {
    await prisma.notification.create({
      data: {
        userId: investor.id,
        type: 'INVESTMENT_CONFIRMED',
        title: 'Investimento confirmado!',
        message: `Você adquiriu tokens com sucesso`,
        read: Math.random() > 0.5,
        createdAt: randomPastDate(7),
      },
    });
  }

  console.log('✅ Created notifications');

  // ===== 7. CREATE FAVORITES =====
  console.log('\n❤️  Creating favorites...');

  for (const investor of investors.slice(0, 30)) {
    const favCount = randomInRange(1, 5);
    const selectedTracks: string[] = [];
    for (let i = 0; i < favCount; i++) {
      const track = pickRandom(tracks);
      if (!selectedTracks.includes(track.id)) {
        selectedTracks.push(track.id);
        await prisma.favorite.create({
          data: {
            userId: investor.id,
            trackId: track.id,
          },
        });
      }
    }
  }

  console.log('✅ Created favorites');

  console.log('\n✨ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   Users: ${4 + artists.length + investors.length}`);
  console.log(`   - E2E Test Users: 3 (investor, artist, admin)`);
  console.log(`   - Admin: 1`);
  console.log(`   - Artists: ${artists.length}`);
  console.log(`   - Investors: ${investors.length}`);
  console.log(`   Tracks: ${tracks.length} (all LIVE)`);
  console.log(`   Transactions: ${transactions.length}`);
  console.log(`   Portfolio Holdings: ${holdingsCount}`);
  console.log(`   Comments: 50`);
  console.log(`   Notifications: 20`);
  console.log('\n🎉 Database is ready for testing!\n');
  console.log('📋 Test credentials:');
  console.log('   \n   === E2E Testing (automated tests) ===');
  console.log('   Investor: investor@v2k.e2e / Test123!@#');
  console.log('   Artist: artist@v2k.e2e / Test123!@#');
  console.log('   Admin: admin@v2k.e2e / Test123!@#');
  console.log('   \n   === Manual Testing ===');
  console.log('   Admin: admin@v2k.music / password123');
  console.log('   Artist: mc.kevinho@artist.com / password123');
  console.log('   Investor: investor1@test.com / password123');
  console.log('\n💡 Next: Run E2E tests with npx playwright test!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
