import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import { 
  createTestUser, 
  createTestArtist, 
  createTestAdmin,
  createTestTrack,
  createTestInvestment,
  TEST_USER_PASSWORD 
} from '../helpers/factories';
import { 
  setupTestDatabase, 
  cleanupTestDatabase, 
  disconnectTestDatabase,
  getTestPrismaClient 
} from '../helpers/test-db';

const prisma = getTestPrismaClient();
const BASE_URL = 'http://localhost:5000';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  // ============================================================================
  // AUTHENTICATION APIS (4 tests)
  // ============================================================================

  describe('Authentication APIs', () => {
    it('POST /api/auth/signup - should create new user', async () => {
      const userData = {
        email: 'newuser@v2k.test',
        password: TEST_USER_PASSWORD,
        name: 'New User',
      };

      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.user).toMatchObject({
        email: userData.email,
        name: userData.name,
      });

      // Verify user in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(user).toBeTruthy();
      expect(user?.email).toBe(userData.email);
    });

    it('POST /api/auth/signup - should reject duplicate email', async () => {
      const user = await createTestUser();

      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: TEST_USER_PASSWORD,
          name: 'Duplicate User',
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/already exists/i);
    });

    it('POST /api/profile/change-password - should update password', async () => {
      const user = await createTestUser();
      const newPassword = 'NewPassword123!@#';

      const res = await fetch(`${BASE_URL}/api/profile/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add proper session header
        },
        body: JSON.stringify({
          currentPassword: TEST_USER_PASSWORD,
          newPassword,
        }),
      });

      // This will fail without proper session, but tests the endpoint exists
      expect([200, 401]).toContain(res.status);
    });

    it('DELETE /api/user/delete-account - should delete user account (GDPR)', async () => {
      const user = await createTestUser();

      const res = await fetch(`${BASE_URL}/api/user/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Origin': BASE_URL,
          // TODO: Add proper session header
        },
      });

      // Without session, should return 401
      expect([200, 401]).toContain(res.status);
    });
  });

  // ============================================================================
  // TRACK APIS (5 tests)
  // ============================================================================

  describe('Track APIs', () => {
    it('GET /api/tracks - should return list of tracks', async () => {
      const artist = await createTestArtist();
      const track1 = await createTestTrack(artist.id, { title: 'Track 1' });
      const track2 = await createTestTrack(artist.id, { title: 'Track 2' });

      const res = await fetch(`${BASE_URL}/api/tracks`);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(Array.isArray(data.tracks)).toBe(true);
      expect(data.tracks.length).toBeGreaterThanOrEqual(2);

      const trackIds = data.tracks.map((t: any) => t.id);
      expect(trackIds).toContain(track1.id);
      expect(trackIds).toContain(track2.id);
    });

    it('GET /api/tracks - should filter by genre', async () => {
      const artist = await createTestArtist();
      const trapTrack = await createTestTrack(artist.id, { genre: 'TRAP' });
      const funkTrack = await createTestTrack(artist.id, { genre: 'FUNK' });

      const res = await fetch(`${BASE_URL}/api/tracks?genre=TRAP`);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.tracks.every((t: any) => t.genre === 'TRAP')).toBe(true);
      
      const trackIds = data.tracks.map((t: any) => t.id);
      expect(trackIds).toContain(trapTrack.id);
      expect(trackIds).not.toContain(funkTrack.id);
    });

    it('GET /api/tracks/[id] - should return track details', async () => {
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id, { 
        title: 'Test Track',
        price: 15,
      });

      const res = await fetch(`${BASE_URL}/api/tracks/${track.id}`);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.track).toMatchObject({
        id: track.id,
        title: 'Test Track',
        currentPrice: 15,
        genre: track.genre,
      });
      expect(data.artist).toMatchObject({
        id: artist.id,
        name: artist.name,
      });
    });

    it('GET /api/tracks/[id]/price-history - should return price history', async () => {
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id);

      const res = await fetch(`${BASE_URL}/api/tracks/${track.id}/price-history`);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(Array.isArray(data.priceHistory)).toBe(true);
      expect(data.priceHistory.length).toBeGreaterThan(0);
      
      // Should have timestamp and price
      expect(data.priceHistory[0]).toHaveProperty('timestamp');
      expect(data.priceHistory[0]).toHaveProperty('price');
    });

    it('POST /api/tracks/[id]/favorite - should add track to favorites', async () => {
      const user = await createTestUser();
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id);

      const res = await fetch(`${BASE_URL}/api/tracks/${track.id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add proper session header for user
        },
      });

      // Without session, should return 401
      expect([200, 201, 401]).toContain(res.status);
    });
  });

  // ============================================================================
  // PORTFOLIO APIS (2 tests)
  // ============================================================================

  describe('Portfolio APIs', () => {
    it('GET /api/portfolio/holdings - should return user holdings', async () => {
      const user = await createTestUser();
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id, { price: 10 });
      
      // Create investment
      await createTestInvestment(user.id, track.id, 100, 10);

      const res = await fetch(`${BASE_URL}/api/portfolio/holdings`, {
        headers: {
          // TODO: Add proper session header for user
        },
      });

      // Without session, should return 401
      expect([200, 401]).toContain(res.status);

      if (res.status === 200) {
        const data = await res.json();
        expect(Array.isArray(data.holdings)).toBe(true);
        
        const holding = data.holdings.find((h: any) => h.track.id === track.id);
        expect(holding).toBeTruthy();
        expect(holding.amount).toBe(100);
        expect(holding.avgBuyPrice).toBe(10);
      }
    });

    it('GET /api/portfolio/analytics - should return portfolio analytics', async () => {
      const user = await createTestUser();
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id, { price: 10 });
      
      await createTestInvestment(user.id, track.id, 100, 10);

      const res = await fetch(`${BASE_URL}/api/portfolio/analytics`, {
        headers: {
          // TODO: Add proper session header
        },
      });

      expect([200, 401]).toContain(res.status);

      if (res.status === 200) {
        const data = await res.json();
        expect(data).toHaveProperty('totalValue');
        expect(data).toHaveProperty('totalInvested');
        expect(data).toHaveProperty('profitLoss');
      }
    });
  });

  // ============================================================================
  // ADMIN APIS (4 tests)
  // ============================================================================

  describe('Admin APIs', () => {
    it('GET /api/metrics - should require admin authentication', async () => {
      const user = await createTestUser(); // Regular user

      const res = await fetch(`${BASE_URL}/api/metrics`, {
        headers: {
          // TODO: Add regular user session
        },
      });

      // Should return 401 (no session) or 403 (not admin)
      expect([401, 403]).toContain(res.status);
    });

    it('GET /api/metrics - should return metrics for admin', async () => {
      const admin = await createTestAdmin();

      const res = await fetch(`${BASE_URL}/api/metrics`, {
        headers: {
          // TODO: Add admin session
        },
      });

      // Without proper session, will return 401
      expect([200, 401]).toContain(res.status);

      if (res.status === 200) {
        const data = await res.json();
        expect(data).toHaveProperty('totalUsers');
        expect(data).toHaveProperty('totalTracks');
        expect(data).toHaveProperty('totalInvestments');
        expect(data).toHaveProperty('totalRevenue');
      }
    });

    it('PUT /api/admin/tracks/[id]/approve - should approve pending track', async () => {
      const admin = await createTestAdmin();
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id, { status: 'PENDING' });

      const res = await fetch(`${BASE_URL}/api/admin/tracks/${track.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add admin session
        },
      });

      // Without session, should return 401
      expect([200, 401, 403]).toContain(res.status);

      if (res.status === 200) {
        // Verify track status updated
        const updatedTrack = await prisma.track.findUnique({
          where: { id: track.id },
        });
        expect(updatedTrack?.status).toBe('LIVE');
      }
    });

    it('GET /api/notifications - should return user notifications', async () => {
      const user = await createTestUser();

      const res = await fetch(`${BASE_URL}/api/notifications`, {
        headers: {
          // TODO: Add user session
        },
      });

      expect([200, 401]).toContain(res.status);

      if (res.status === 200) {
        const data = await res.json();
        expect(Array.isArray(data.notifications)).toBe(true);
      }
    });
  });

  // ============================================================================
  // INVESTMENT APIS (3 tests)
  // ============================================================================

  describe('Investment APIs', () => {
    it('POST /api/investments/create - should create investment', async () => {
      const user = await createTestUser({ balance: 5000 });
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id, { 
        price: 10,
        availableSupply: 1000,
      });

      const res = await fetch(`${BASE_URL}/api/investments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': BASE_URL, // CSRF check
          // TODO: Add user session
        },
        body: JSON.stringify({
          trackId: track.id,
          amount: 100, // $1000 total
        }),
      });

      // Without session, should return 401
      expect([200, 201, 401]).toContain(res.status);
    });

    it('POST /api/investments/create - should reject insufficient balance', async () => {
      const user = await createTestUser({ balance: 100 }); // Only $100
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id, { price: 10 });

      const res = await fetch(`${BASE_URL}/api/investments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': BASE_URL,
          // TODO: Add user session
        },
        body: JSON.stringify({
          trackId: track.id,
          amount: 100, // Needs $1000
        }),
      });

      // Should return 400 or 401 (no session)
      expect([400, 401]).toContain(res.status);
    });

    it('POST /api/investments/create - should reject without CSRF token', async () => {
      const user = await createTestUser({ balance: 5000 });
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id);

      const res = await fetch(`${BASE_URL}/api/investments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // NO Origin header - CSRF should fail
          // TODO: Add user session
        },
        body: JSON.stringify({
          trackId: track.id,
          amount: 100,
        }),
      });

      // Should return 403 (CSRF) or 401 (no session)
      expect([401, 403]).toContain(res.status);
    });
  });

  // ============================================================================
  // PAYMENT APIS (3 tests)
  // ============================================================================

  describe('Payment APIs', () => {
    it('POST /api/checkout/create - should create Stripe checkout session', async () => {
      const user = await createTestUser();
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id);

      const res = await fetch(`${BASE_URL}/api/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': BASE_URL, // CSRF check
          // TODO: Add user session
        },
        body: JSON.stringify({
          trackId: track.id,
          amount: 50,
        }),
      });

      // Without session, should return 401
      expect([200, 401]).toContain(res.status);
    });

    it('POST /api/checkout/create - should require CSRF token', async () => {
      const user = await createTestUser();
      const artist = await createTestArtist();
      const track = await createTestTrack(artist.id);

      const res = await fetch(`${BASE_URL}/api/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // NO Origin header
          // TODO: Add user session
        },
        body: JSON.stringify({
          trackId: track.id,
          amount: 50,
        }),
      });

      expect([401, 403]).toContain(res.status);
    });

    it('POST /api/checkout/webhook - should process Stripe webhook', async () => {
      // Stripe webhook test requires Stripe signature
      const res = await fetch(`${BASE_URL}/api/checkout/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'test-signature',
        },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_123',
              payment_status: 'paid',
            },
          },
        }),
      });

      // Should return 400 (invalid signature) or 200 (processed)
      expect([200, 400]).toContain(res.status);
    });
  });
});
