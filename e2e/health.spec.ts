import { test, expect } from '@playwright/test';

test('health endpoint returns status and checks', async ({ request }) => {
  const res = await request.get('/api/health');
  expect([200, 503]).toContain(res.status());
  const body = await res.json();
  expect(['healthy', 'degraded', 'unhealthy']).toContain(body.status);
  expect(body.checks).toBeDefined();
});
