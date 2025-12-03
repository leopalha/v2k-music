/**
 * In-Memory Rate Limiter
 * Protects APIs from abuse without requiring Redis
 */

import { NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

// In-memory storage (resets on server restart)
const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number; // Max requests per window
  windowMs: number;    // Time window in milliseconds
}

// Preset configs
export const RATE_LIMITS = {
  STRICT: { maxRequests: 10, windowMs: 60 * 1000 },      // 10 req/min
  MODERATE: { maxRequests: 30, windowMs: 60 * 1000 },    // 30 req/min
  GENEROUS: { maxRequests: 100, windowMs: 60 * 1000 },   // 100 req/min
  PAYMENT: { maxRequests: 5, windowMs: 60 * 1000 },      // 5 req/min (crítico)
  UPLOAD: { maxRequests: 3, windowMs: 60 * 1000 },       // 3 uploads/min
};

/**
 * Rate limit a request by identifier (IP, user ID, etc)
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.MODERATE
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now();
  const key = `${identifier}`;

  // Get or create entry
  if (!store[key] || store[key].resetAt < now) {
    store[key] = {
      count: 0,
      resetAt: now + config.windowMs,
    };
  }

  // Increment counter
  store[key].count++;

  // Check if exceeded
  const exceeded = store[key].count > config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - store[key].count);

  return {
    success: !exceeded,
    limit: config.maxRequests,
    remaining,
    reset: store[key].resetAt,
  };
}

/**
 * Middleware helper for API routes
 */
export async function checkRateLimit(
  request: Request,
  config: RateLimitConfig = RATE_LIMITS.MODERATE
): Promise<{ allowed: boolean; response?: NextResponse }> {
  // Get identifier (IP or user session)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  
  const result = await rateLimit(ip, config);

  if (!result.success) {
    return {
      allowed: false,
      response: NextResponse.json(
        { 
          error: 'Muitas requisições. Tente novamente mais tarde.',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString()
          }
        }
      )
    };
  }

  return { allowed: true };
}

/**
 * Get current rate limit status for identifier
 */
export function getRateLimitStatus(identifier: string): {
  count: number;
  resetAt: number;
} | null {
  return store[identifier] || null;
}

/**
 * Clear rate limit for identifier (useful for testing)
 */
export function clearRateLimit(identifier: string): void {
  delete store[identifier];
}
