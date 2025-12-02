/**
 * Health Check API
 * GET /api/health - Check system health status
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { redis } from '@/lib/cache/redis';

export async function GET() {
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: { status: 'unknown', latency: 0 },
      redis: { status: 'unknown', latency: 0 },
      memory: { status: 'unknown', usage: 0, limit: 0 },
    },
  };

  try {
    // Check database connection
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;
    
    health.checks.database = {
      status: dbLatency < 100 ? 'healthy' : 'degraded',
      latency: dbLatency,
    };
  } catch (error) {
    health.checks.database = {
      status: 'unhealthy',
      latency: 0,
    };
    health.status = 'unhealthy';
  }

  // Check Redis connection
  try {
    if (redis) {
      const redisStart = Date.now();
      await redis.ping();
      const redisLatency = Date.now() - redisStart;
      
      health.checks.redis = {
        status: redisLatency < 50 ? 'healthy' : 'degraded',
        latency: redisLatency,
      };
    } else {
      health.checks.redis = {
        status: 'disabled',
        latency: 0,
      };
    }
  } catch (error) {
    health.checks.redis = {
      status: 'unhealthy',
      latency: 0,
    };
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const totalMem = memUsage.heapTotal;
  const usedMem = memUsage.heapUsed;
  const memPercent = (usedMem / totalMem) * 100;
  
  health.checks.memory = {
    status: memPercent < 90 ? 'healthy' : 'warning',
    usage: Math.round(usedMem / 1024 / 1024), // MB
    limit: Math.round(totalMem / 1024 / 1024), // MB
  };

  // Overall health check
  const responseTime = Date.now() - startTime;
  
  // Determine overall status
  if (health.checks.database.status === 'unhealthy') {
    health.status = 'unhealthy';
  } else if (
    health.checks.database.status === 'degraded' ||
    health.checks.redis.status === 'unhealthy' ||
    health.checks.memory.status === 'warning'
  ) {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(
    {
      ...health,
      responseTime,
    },
    { status: statusCode }
  );
}
