import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import {
  createTestUser,
  createTestArtist,
  createTestAdmin,
  createTestTrack,
  createTestInvestment,
  TEST_USER_PASSWORD,
} from '../helpers/factories';
import {
  setupTestDatabase,
  cleanupTestDatabase,
  disconnectTestDatabase,
  getTestPrismaClient,
} from '../helpers/test-db';

const prisma = getTestPrismaClient();

describe('Database Operations Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 30000); // 30s timeout for DB setup

  afterEach(async () => {
    await cleanupTestDatabase();
  }, 30000);

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  // ============================================================================
  // USER FACTORY TESTS
  // ============================================================================

  describe('User Factories', () => {
    it('should create test user with default values', async () => {
      const user = await createTestUser();

      expect(user).toBeTruthy();
      expect(user.email).toContain('@v2k.test');
      expect(user.cashBalance).toBe(1000);
      expect(user.role).toBe('USER');
      expect(user.kycStatus).toBe('VERIFIED');
    });

    it('should create test user with custom values', async () => {
      const user = await createTestUser({
        email: 'custom@v2k.test',
        name: 'Custom User',
        cashBalance: 5000,
      });

      expect(user.email).toBe('custom@v2k.test');
      expect(user.name).toBe('Custom User');
      expect(user.cashBalance).toBe(5000);
    });

    it('should create test artist', async () => {
      const artist = await createTestArtist();

      expect(artist.role).toBe('USER');
      expect(artist.email).toContain('@v2k.test');
    });

    it('should create test admin', async () => {
      const admin = await createTestAdmin();

      expect(admin.role).toBe('ADMIN');
      expect(admin.email).toContain('@v2k.test');
    });

    it('should create test super admin', async () => {
      const superAdmin = await createTestAdmin(true);

      expect(superAdmin.role).toBe('SUPER_ADMIN');
    });
  });

  // ============================================================================
  // TRACK FACTORY TESTS
  // ============================================================================

  describe('Track Factories', () => {
    it('should create test track', async () => {
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id);

      expect(track).toBeTruthy();
      expect(track.artistId).toBe(artist.id);
      expect(track.currentPrice).toBe(10);
      expect(track.totalSupply).toBe(10000);
      expect(track.availableSupply).toBe(10000);
      expect(track.status).toBe('LIVE');
      expect(track.genre).toBeTruthy();
    });

    it('should create track with custom values', async () => {
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id, {
        title: 'Custom Track',
        genre: 'TRAP',
        currentPrice: 15,
        totalSupply: 5000,
        status: 'PENDING',
      });

      expect(track.title).toBe('Custom Track');
      expect(track.genre).toBe('TRAP');
      expect(track.currentPrice).toBe(15);
      expect(track.initialPrice).toBe(15);
      expect(track.totalSupply).toBe(5000);
      expect(track.status).toBe('PENDING');
    });
  });

  // ============================================================================
  // INVESTMENT FACTORY TESTS
  // ============================================================================

  describe('Investment Factories', () => {
    it('should create test investment', async () => {
      const user = await createTestUser({ cashBalance: 5000 });
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id, { currentPrice: 10 });

      const { portfolio, transaction } = await createTestInvestment(
        user.id,
        track.id,
        100, // amount
        10   // price per token
      );

      // Verify portfolio
      expect(portfolio).toBeTruthy();
      expect(portfolio.amount).toBe(100);
      expect(portfolio.avgBuyPrice).toBe(10);
      expect(portfolio.totalInvested).toBe(1000);

      // Verify transaction
      expect(transaction).toBeTruthy();
      expect(transaction.type).toBe('BUY');
      expect(transaction.amount).toBe(100);
      expect(transaction.price).toBe(10);
      expect(transaction.totalValue).toBe(1000);
      expect(transaction.status).toBe('COMPLETED');

      // Verify user balance updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser?.cashBalance).toBe(4000); // 5000 - 1000

      // Verify track supply updated
      const updatedTrack = await prisma.track.findUnique({
        where: { id: track.id },
      });
      expect(updatedTrack?.availableSupply).toBe(9900); // 10000 - 100
    });

    it('should handle multiple investments by same user', async () => {
      const user = await createTestUser({ cashBalance: 10000 });
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id, { currentPrice: 10 });

      // First investment
      await createTestInvestment(user.id, track.id, 100, 10);

      // Second investment
      const { portfolio } = await createTestInvestment(user.id, track.id, 50, 10);

      // Should accumulate
      expect(portfolio.amount).toBe(150); // 100 + 50
      expect(portfolio.totalInvested).toBe(1500); // (100 * 10) + (50 * 10)

      // Verify user balance
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser?.cashBalance).toBe(8500); // 10000 - 1500
    });
  });

  // ============================================================================
  // DATABASE CLEANUP TESTS
  // ============================================================================

  describe('Database Cleanup', () => {
    it('should only delete test data with @v2k.test emails', async () => {
      // Create test user
      const testUser = await createTestUser();
      
      // Verify user exists
      const foundUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(foundUser).toBeTruthy();

      // Cleanup should remove it
      await cleanupTestDatabase();

      // Verify user removed
      const deletedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(deletedUser).toBeNull();
    });

    it('should clean up all related data (cascade)', async () => {
      const user = await createTestUser({ cashBalance: 5000 });
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id);
      await createTestInvestment(user.id, track.id, 100, 10);

      // Verify all data exists
      const foundUser = await prisma.user.findUnique({ where: { id: user.id } });
      const foundArtist = await prisma.user.findUnique({ where: { id: artist.id } });
      const foundTrack = await prisma.track.findUnique({ where: { id: track.id } });
      const foundPortfolio = await prisma.portfolio.findUnique({
        where: { userId_trackId: { userId: user.id, trackId: track.id } },
      });
      const foundTransactions = await prisma.transaction.findMany({
        where: { userId: user.id },
      });

      expect(foundUser).toBeTruthy();
      expect(foundArtist).toBeTruthy();
      expect(foundTrack).toBeTruthy();
      expect(foundPortfolio).toBeTruthy();
      expect(foundTransactions.length).toBeGreaterThan(0);

      // Cleanup
      await cleanupTestDatabase();

      // Verify all deleted
      const deletedUser = await prisma.user.findUnique({ where: { id: user.id } });
      const deletedArtist = await prisma.user.findUnique({ where: { id: artist.id } });
      const deletedTrack = await prisma.track.findUnique({ where: { id: track.id } });
      const deletedPortfolio = await prisma.portfolio.findUnique({
        where: { userId_trackId: { userId: user.id, trackId: track.id } },
      });
      const deletedTransactions = await prisma.transaction.findMany({
        where: { userId: user.id },
      });

      expect(deletedUser).toBeNull();
      expect(deletedArtist).toBeNull();
      expect(deletedTrack).toBeNull();
      expect(deletedPortfolio).toBeNull();
      expect(deletedTransactions.length).toBe(0);
    });
  });

  // ============================================================================
  // PRISMA QUERY TESTS
  // ============================================================================

  describe('Prisma Queries', () => {
    it('should query tracks with filters', async () => {
      const artist = await createTestArtist();
      const trapTrack = await createTestTrack(artist.id, { genre: 'TRAP' });
      const funkTrack = await createTestTrack(artist.id, { genre: 'FUNK' });

      // Query TRAP tracks
      const trapTracks = await prisma.track.findMany({
        where: {
          genre: 'TRAP',
          status: 'LIVE',
        },
      });

      expect(trapTracks.length).toBeGreaterThanOrEqual(1);
      expect(trapTracks.some(t => t.id === trapTrack.id)).toBe(true);
      expect(trapTracks.some(t => t.id === funkTrack.id)).toBe(false);
    });

    it('should query portfolio with joins', async () => {
      const user = await createTestUser({ cashBalance: 5000 });
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id, { title: 'Test Portfolio Track' });
      await createTestInvestment(user.id, track.id, 100, 10);

      // Query portfolio with track details
      const holdings = await prisma.portfolio.findMany({
        where: { userId: user.id },
        include: {
          track: {
            include: {
              artist: {
                select: {
                  id: true,
                  name: true,
                  profileImageUrl: true,
                },
              },
            },
          },
        },
      });

      expect(holdings.length).toBe(1);
      expect(holdings[0].track.title).toBe('Test Portfolio Track');
      expect(holdings[0].track.artist.id).toBe(artist.id);
    });

    it('should query transactions with pagination', async () => {
      const user = await createTestUser({ cashBalance: 10000 });
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id);

      // Create multiple transactions
      await createTestInvestment(user.id, track.id, 10, 10);
      await createTestInvestment(user.id, track.id, 20, 10);
      await createTestInvestment(user.id, track.id, 30, 10);

      // Query with pagination
      const transactions = await prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 2,
        skip: 0,
      });

      expect(transactions.length).toBe(2);
      expect(transactions[0].amount).toBe(30); // Most recent
    });
  });
});
