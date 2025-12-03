/**
 * CSRF Protection for Critical APIs
 * Validates Origin and Referer headers for state-changing requests
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Check if request comes from same origin (CSRF protection)
 * For financial APIs (POST/PUT/DELETE), we validate Origin/Referer
 */
export async function validateCSRF(request: NextRequest): Promise<{
  valid: boolean;
  response?: NextResponse;
}> {
  // Only check state-changing methods
  const method = request.method;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return { valid: true };
  }

  // Get expected origin from environment
  const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:5000';
  const allowedOrigins = [
    expectedOrigin,
    'http://localhost:5000',
    'http://localhost:3000',
    'https://v2k-music.vercel.app',
  ];

  // Check Origin header (preferred)
  const origin = request.headers.get('origin');
  if (origin) {
    if (allowedOrigins.includes(origin)) {
      return { valid: true };
    }
  }

  // Fallback to Referer header
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      
      if (allowedOrigins.includes(refererOrigin)) {
        return { valid: true };
      }
    } catch (error) {
      // Invalid referer URL
      console.error('[CSRF] Invalid referer URL:', referer);
    }
  }

  // If we're here, CSRF check failed
  console.warn('[CSRF] Blocked request:', {
    method,
    origin,
    referer,
    url: request.url,
  });

  return {
    valid: false,
    response: NextResponse.json(
      { 
        error: 'CSRF validation failed. Request origin not allowed.',
        code: 'CSRF_VALIDATION_FAILED'
      },
      { 
        status: 403,
        headers: {
          'X-Content-Type-Options': 'nosniff',
        }
      }
    ),
  };
}

/**
 * Middleware helper for critical endpoints
 */
export async function checkCSRF(request: NextRequest): Promise<{
  allowed: boolean;
  response?: NextResponse;
}> {
  const result = await validateCSRF(request);
  
  if (!result.valid) {
    return {
      allowed: false,
      response: result.response,
    };
  }

  return { allowed: true };
}

/**
 * Generate CSRF token (for forms if needed)
 * NextAuth already handles this for auth routes
 */
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
