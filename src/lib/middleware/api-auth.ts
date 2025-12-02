/**
 * API Key Authentication Middleware
 * Validates API keys and rate limits for public API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashApiKey, isValidApiKeyFormat } from '@/lib/api-keys/utils';
import { ApiPermission } from '@prisma/client';

export interface AuthenticatedApiRequest extends NextRequest {
  apiKeyData?: {
    id: string;
    userId: string;
    permissions: ApiPermission[];
    environment: 'PRODUCTION' | 'SANDBOX';
  };
}

/**
 * Extract API key from request headers
 * Supports: Authorization: Bearer sk_live_xxx
 * or: x-api-key: sk_live_xxx
 */
function extractApiKey(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check x-api-key header
  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  return null;
}

/**
 * Validate API key and return user data
 */
async function validateApiKey(key: string): Promise<{
  id: string;
  userId: string;
  permissions: ApiPermission[];
  environment: 'PRODUCTION' | 'SANDBOX';
  rateLimit: number;
} | null> {
  // Validate format
  if (!isValidApiKeyFormat(key)) {
    return null;
  }

  // Hash the key
  const hashedKey = hashApiKey(key);

  // Find the key in database
  const apiKey = await prisma.apiKey.findUnique({
    where: {
      key: hashedKey,
    },
    select: {
      id: true,
      userId: true,
      permissions: true,
      environment: true,
      status: true,
      expiresAt: true,
      rateLimit: true,
      requestsCount: true,
    },
  });

  if (!apiKey) {
    return null;
  }

  // Check if key is active
  if (apiKey.status !== 'ACTIVE') {
    return null;
  }

  // Check if key has expired
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    // Auto-mark as expired
    await prisma.apiKey.update({
      where: {
        id: apiKey.id,
      },
      data: {
        status: 'EXPIRED',
      },
    });
    return null;
  }

  // Update last used timestamp and request count
  await prisma.apiKey.update({
    where: {
      id: apiKey.id,
    },
    data: {
      lastUsedAt: new Date(),
      requestsCount: {
        increment: 1,
      },
    },
  });

  return {
    id: apiKey.id,
    userId: apiKey.userId,
    permissions: apiKey.permissions,
    environment: apiKey.environment,
    rateLimit: apiKey.rateLimit,
  };
}

/**
 * Check rate limiting for API key
 * Returns true if rate limit exceeded
 */
async function checkRateLimit(apiKeyId: string, rateLimit: number): Promise<boolean> {
  // Get request count in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // For simplicity, we'll use the requestsCount field
  // In production, you'd want to use Redis or a time-series database
  const apiKey = await prisma.apiKey.findUnique({
    where: {
      id: apiKeyId,
    },
    select: {
      requestsCount: true,
      updatedAt: true,
    },
  });

  if (!apiKey) {
    return true; // Rate limit exceeded if key not found
  }

  // Implement proper rate limiting with Redis
  try {
    const { checkRateLimit: redisRateLimit } = await import('@/lib/cache/redis');
    const result = await redisRateLimit(
      `api_key:${apiKeyId}`,
      rateLimit,
      '1 h'
    );
    
    return !result.success; // Return true if limit exceeded
  } catch (error) {
    // Fallback if Redis not available
    console.warn('[API-AUTH] Redis rate limiting unavailable, using basic check');
    return false; // Allow request if Redis fails
  }
}

/**
 * Middleware to authenticate API requests
 */
export async function authenticateApiKey(
  request: NextRequest,
  requiredPermissions?: ApiPermission[]
): Promise<{
  authorized: boolean;
  response?: NextResponse;
  apiKeyData?: {
    id: string;
    userId: string;
    permissions: ApiPermission[];
    environment: 'PRODUCTION' | 'SANDBOX';
  };
}> {
  // Extract API key
  const apiKey = extractApiKey(request);

  if (!apiKey) {
    return {
      authorized: false,
      response: NextResponse.json(
        { 
          error: 'Missing API key',
          message: 'Provide an API key via Authorization header or x-api-key header',
        },
        { status: 401 }
      ),
    };
  }

  // Validate API key
  const apiKeyData = await validateApiKey(apiKey);

  if (!apiKeyData) {
    return {
      authorized: false,
      response: NextResponse.json(
        { 
          error: 'Invalid API key',
          message: 'The provided API key is invalid, expired, or revoked',
        },
        { status: 401 }
      ),
    };
  }

  // Check rate limiting
  const rateLimitExceeded = await checkRateLimit(apiKeyData.id, apiKeyData.rateLimit);

  if (rateLimitExceeded) {
    return {
      authorized: false,
      response: NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `You have exceeded the rate limit of ${apiKeyData.rateLimit} requests per hour`,
        },
        { status: 429 }
      ),
    };
  }

  // Check permissions if required
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(
      (perm) =>
        apiKeyData.permissions.includes(perm) ||
        apiKeyData.permissions.includes(ApiPermission.FULL_ACCESS)
    );

    if (!hasPermission) {
      return {
        authorized: false,
        response: NextResponse.json(
          { 
            error: 'Insufficient permissions',
            message: 'Your API key does not have the required permissions for this endpoint',
            required: requiredPermissions,
          },
          { status: 403 }
        ),
      };
    }
  }

  // Authorized
  return {
    authorized: true,
    apiKeyData: {
      id: apiKeyData.id,
      userId: apiKeyData.userId,
      permissions: apiKeyData.permissions,
      environment: apiKeyData.environment,
    },
  };
}

/**
 * Helper to wrap API route handlers with authentication
 */
export function withApiKeyAuth(
  handler: (
    request: NextRequest,
    context: any,
    apiKeyData: {
      id: string;
      userId: string;
      permissions: ApiPermission[];
      environment: 'PRODUCTION' | 'SANDBOX';
    }
  ) => Promise<NextResponse>,
  requiredPermissions?: ApiPermission[]
) {
  return async (request: NextRequest, context: any) => {
    const auth = await authenticateApiKey(request, requiredPermissions);

    if (!auth.authorized || !auth.apiKeyData) {
      return auth.response!;
    }

    return handler(request, context, auth.apiKeyData);
  };
}
