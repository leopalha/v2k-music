import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma Client for tests
 * Uses the same Railway database but with test-specific data (@v2k.test emails)
 */
let prisma: PrismaClient;

export function getTestPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.DEBUG_TESTS ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

/**
 * Clean up test data after tests
 * ONLY deletes users with @v2k.test emails
 */
export async function cleanupTestDatabase() {
  const client = getTestPrismaClient();

  try {
    // Delete in correct order respecting FK constraints
    // Delete child records first, then parent records
    
    // 1. Delete transactions (references user + track)
    await client.transaction.deleteMany({
      where: {
        user: {
          email: {
            contains: '@v2k.test',
          },
        },
      },
    });

    // 2. Delete portfolio entries (references user + track)
    await client.portfolio.deleteMany({
      where: {
        user: {
          email: {
            contains: '@v2k.test',
          },
        },
      },
    });

    // 3. Delete notifications (references user)
    await client.notification.deleteMany({
      where: {
        user: {
          email: {
            contains: '@v2k.test',
          },
        },
      },
    });

    // 4. Delete comments (references user)
    await client.comment.deleteMany({
      where: {
        user: {
          email: {
            contains: '@v2k.test',
          },
        },
      },
    });

    // 5. Delete favorites (references user + track)
    await client.favorite.deleteMany({
      where: {
        user: {
          email: {
            contains: '@v2k.test',
          },
        },
      },
    });

    // 6. Delete limit orders (references user + track)
    await client.limitOrder.deleteMany({
      where: {
        user: {
          email: {
            contains: '@v2k.test',
          },
        },
      },
    });

    // 7. Delete follows (references user)
    await client.follow.deleteMany({
      where: {
        follower: {
          email: {
            contains: '@v2k.test',
          },
        },
      },
    });

    // 8. Delete tracks (references artist/user)
    await client.track.deleteMany({
      where: {
        artist: {
          email: {
            contains: '@v2k.test',
          },
        },
      },
    });

    // 9. Finally delete users
    await client.user.deleteMany({
      where: {
        email: {
          contains: '@v2k.test',
        },
      },
    });
  } catch (error) {
    console.error('Error cleaning up test database:', error);
    throw error;
  }
}

/**
 * Disconnect Prisma client
 */
export async function disconnectTestDatabase() {
  if (prisma) {
    await prisma.$disconnect();
  }
}

/**
 * Setup function to run before all tests
 */
export async function setupTestDatabase() {
  const client = getTestPrismaClient();
  
  // Verify database connection
  try {
    await client.$connect();
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
  
  // Clean up any leftover test data
  await cleanupTestDatabase();
}
