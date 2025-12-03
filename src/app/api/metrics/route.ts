/**
 * Metrics API
 * GET /api/metrics - Get system performance metrics
 * Requires admin authentication
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-middleware';
import { queryMetrics } from '@/lib/db/query-logger';

export async function GET() {
  try {
    // Require admin authentication
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    // Get query stats
    const queryStats = queryMetrics.getStats();
    const slowQueries = queryMetrics.getSlowQueries(100); // > 100ms

    // Memory stats
    const memUsage = process.memoryUsage();
    const memory = {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
    };

    // Process stats
    const process_stats = {
      uptime: process.uptime(),
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version,
    };

    // Cache stats (if Redis is available)
    // This would need to be implemented in the cache module
    const cache_stats = {
      enabled: !!process.env.UPSTASH_REDIS_REST_URL,
      // hitRate: 0, // TODO: Implement cache hit tracking
      // totalRequests: 0,
      // hits: 0,
      // misses: 0,
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      queries: {
        total: queryStats.total,
        averageDuration: Math.round(queryStats.averageDuration),
        slowQueries: queryStats.slowQueries,
        slowestQuery: queryStats.slowestQuery,
        recentSlowQueries: slowQueries.slice(-10).map(q => ({
          model: q.model,
          action: q.action,
          duration: q.duration,
          timestamp: q.timestamp,
        })),
      },
      memory,
      process: process_stats,
      cache: cache_stats,
    });
  } catch (error) {
    console.error('[METRICS_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
