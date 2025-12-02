/**
 * Redis Cache Library
 * Using Upstash Redis for serverless caching
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client (optional - will work without env vars in dev)
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Initialize rate limiter
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
      analytics: true,
    });
  } else {
    console.warn('[REDIS] Upstash Redis not configured. Cache and rate limiting disabled.');
  }
} catch (error) {
  console.error('[REDIS] Failed to initialize:', error);
}

/**
 * Cache helper functions
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for cache invalidation
}

/**
 * Get value from cache
 */
export async function get<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const value = await redis.get<T>(key);
    return value;
  } catch (error) {
    console.error('[REDIS] Get error:', error);
    return null;
  }
}

/**
 * Set value in cache
 */
export async function set<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<boolean> {
  if (!redis) return false;

  try {
    const { ttl = 300 } = options; // Default 5 minutes

    if (ttl > 0) {
      await redis.setex(key, ttl, JSON.stringify(value));
    } else {
      await redis.set(key, JSON.stringify(value));
    }

    return true;
  } catch (error) {
    console.error('[REDIS] Set error:', error);
    return false;
  }
}

/**
 * Delete value from cache
 */
export async function del(key: string | string[]): Promise<boolean> {
  if (!redis) return false;

  try {
    const keys = Array.isArray(key) ? key : [key];
    await redis.del(...keys);
    return true;
  } catch (error) {
    console.error('[REDIS] Delete error:', error);
    return false;
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidatePattern(pattern: string): Promise<number> {
  if (!redis) return 0;

  try {
    // Get all keys matching pattern
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
      return keys.length;
    }
    
    return 0;
  } catch (error) {
    console.error('[REDIS] Invalidate pattern error:', error);
    return 0;
  }
}

/**
 * Check if key exists
 */
export async function exists(key: string): Promise<boolean> {
  if (!redis) return false;

  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    console.error('[REDIS] Exists error:', error);
    return false;
  }
}

/**
 * Increment counter (for rate limiting, analytics, etc)
 */
export async function incr(key: string, ttl?: number): Promise<number> {
  if (!redis) return 0;

  try {
    const value = await redis.incr(key);
    
    if (ttl) {
      await redis.expire(key, ttl);
    }
    
    return value;
  } catch (error) {
    console.error('[REDIS] Incr error:', error);
    return 0;
  }
}

/**
 * Rate limiting check
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  window: string = '1 m'
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  if (!ratelimit) {
    // No rate limiting if Redis is not configured
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + 60000,
    };
  }

  try {
    const result = await ratelimit.limit(identifier);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('[REDIS] Rate limit error:', error);
    // On error, allow the request
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + 60000,
    };
  }
}

/**
 * Cache key builders
 */
export const CacheKeys = {
  // Tracks
  tracks: (params?: Record<string, any>) => 
    `tracks:${params ? JSON.stringify(params) : 'all'}`,
  track: (id: string) => `track:${id}`,
  trackPrice: (id: string) => `track:${id}:price`,
  
  // Portfolio
  portfolio: (userId: string) => `portfolio:${userId}`,
  portfolioAnalytics: (userId: string) => `portfolio:${userId}:analytics`,
  
  // Leaderboard
  leaderboard: (type: string = 'profit') => `leaderboard:${type}`,
  
  // Analytics
  analytics: (type: string, period?: string) => 
    `analytics:${type}${period ? `:${period}` : ''}`,
  
  // User
  userStats: (userId: string) => `user:${userId}:stats`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  
  // Rate limiting
  rateLimit: (identifier: string, endpoint?: string) =>
    `ratelimit:${identifier}${endpoint ? `:${endpoint}` : ''}`,
};

/**
 * Cache TTLs (in seconds)
 */
export const CacheTTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 600,        // 10 minutes
  VERY_LONG: 1800,  // 30 minutes
  HOUR: 3600,       // 1 hour
  DAY: 86400,       // 24 hours
};

export { redis, ratelimit };
