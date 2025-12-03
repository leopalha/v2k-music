import { PrismaClient, UserRole, TrackStatus, Genre } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Creates a test user in the database
 */
export async function createTestUser(overrides?: {
  email?: string;
  name?: string;
  role?: UserRole;
  cashBalance?: number;
}) {
  const randomId = Math.random().toString(36).substring(7);
  const hashedPassword = await bcrypt.hash('Test123!@#', 10);

  return prisma.user.create({
    data: {
      email: overrides?.email || `test-${randomId}@v2k.test`,
      name: overrides?.name || `Test User ${randomId}`,
      hashedPassword: hashedPassword,
      role: overrides?.role || 'USER',
      cashBalance: overrides?.cashBalance || 1000, // $1000 default balance
      kycStatus: 'VERIFIED',
      onboardingCompleted: true,
    },
  });
}

/**
 * Creates a test artist user
 */
export async function createTestArtist(overrides?: {
  email?: string;
  name?: string;
}) {
  return createTestUser({
    email: overrides?.email,
    name: overrides?.name,
    role: 'USER', // Artists are just regular users who upload tracks
  });
}

/**
 * Creates a test admin user
 */
export async function createTestAdmin(superAdmin = false) {
  return createTestUser({
    role: superAdmin ? 'SUPER_ADMIN' : 'ADMIN',
    email: superAdmin ? 'superadmin@v2k.test' : 'admin@v2k.test',
    name: superAdmin ? 'Super Admin' : 'Admin',
  });
}

/**
 * Creates a test track in the database
 */
export async function createTestTrack(artistId: string, overrides?: {
  title?: string;
  genre?: Genre;
  currentPrice?: number;
  totalSupply?: number;
  status?: TrackStatus;
  audioUrl?: string;
  coverUrl?: string;
}) {
  const randomId = Math.random().toString(36).substring(7);
  const price = overrides?.currentPrice || 10;

  return prisma.track.create({
    data: {
      title: overrides?.title || `Test Track ${randomId}`,
      artistName: `Artist ${randomId}`,
      artistId,
      genre: overrides?.genre || 'RAP',
      currentPrice: price,
      initialPrice: price,
      totalSupply: overrides?.totalSupply || 10000,
      availableSupply: overrides?.totalSupply || 10000,
      marketCap: price * (overrides?.totalSupply || 10000),
      status: overrides?.status || 'LIVE',
      isActive: true,
      audioUrl: overrides?.audioUrl || `https://storage.v2k.test/audio/${randomId}.mp3`,
      coverUrl: overrides?.coverUrl || `https://storage.v2k.test/covers/${randomId}.jpg`,
      duration: 180, // 3 minutes
    },
  });
}

/**
 * Creates a test investment (portfolio entry + transaction)
 */
export async function createTestInvestment(
  userId: string,
  trackId: string,
  amount: number,
  pricePerToken: number
) {
  const totalCost = amount * pricePerToken;

  // Create portfolio entry
  const portfolio = await prisma.portfolio.upsert({
    where: {
      userId_trackId: { userId, trackId },
    },
    create: {
      userId,
      trackId,
      amount,
      totalInvested: totalCost,
      avgBuyPrice: pricePerToken,
      currentValue: totalCost,
      unrealizedPnL: 0,
    },
    update: {
      amount: { increment: amount },
      totalInvested: { increment: totalCost },
      avgBuyPrice: pricePerToken, // Simplified, real calc is weighted average
    },
  });

  // Create transaction record
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      trackId,
      type: 'BUY',
      amount,
      price: pricePerToken,
      totalValue: totalCost,
      fee: 0, // No fee for test data
      status: 'COMPLETED',
    },
  });

  // Update track available supply
  await prisma.track.update({
    where: { id: trackId },
    data: {
      availableSupply: { decrement: amount },
    },
  });

  // Update user balance
  await prisma.user.update({
    where: { id: userId },
    data: {
      cashBalance: { decrement: totalCost },
    },
  });

  return { portfolio, transaction };
}

/**
 * Creates test notification
 */
export async function createTestNotification(
  userId: string,
  type: 'TRACK_APPROVED' | 'TRACK_REJECTED' | 'NEW_FOLLOWER' | 'INVESTMENT_PROFIT'
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title: `Test ${type}`,
      message: `Test notification for ${type}`,
      isRead: false,
    },
  });
}

/**
 * Cleans up test data
 */
export async function cleanupTestData() {
  // Delete in reverse order of dependencies
  await prisma.transaction.deleteMany({
    where: {
      user: {
        email: {
          contains: '@v2k.test',
        },
      },
    },
  });

  await prisma.portfolio.deleteMany({
    where: {
      user: {
        email: {
          contains: '@v2k.test',
        },
      },
    },
  });

  await prisma.notification.deleteMany({
    where: {
      user: {
        email: {
          contains: '@v2k.test',
        },
      },
    },
  });

  await prisma.track.deleteMany({
    where: {
      artist: {
        email: {
          contains: '@v2k.test',
        },
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        contains: '@v2k.test',
      },
    },
  });
}

/**
 * Get test user credentials
 */
export const TEST_USER_PASSWORD = 'Test123!@#';
