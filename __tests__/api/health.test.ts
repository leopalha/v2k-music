import { describe, it, expect, jest } from '@jest/globals';

// Mock next/server before importing the route
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({ json: async () => data, status: init?.status ?? 200 }),
  },
}));

describe('GET /api/health', () => {
  it('should return healthy/degraded/unhealthy with appropriate status', async () => {
    // Provide a minimal global Request to satisfy next/server
    // @ts-ignore
    global.Request = function () {};
    const { GET: HealthGET } = await import('@/app/api/health/route');

    const res: any = await HealthGET();
    const body = await res.json();

    expect([200, 503]).toContain(res.status);
    expect(['healthy', 'degraded', 'unhealthy']).toContain(body.status);
    expect(body.checks).toBeDefined();
    expect(body.timestamp).toBeDefined();
  });
});
