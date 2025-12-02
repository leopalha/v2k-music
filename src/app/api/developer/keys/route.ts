/**
 * API Keys Management
 * POST /api/developer/keys - Create new API key
 * GET /api/developer/keys - List user's API keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { generateApiKey, maskApiKey } from '@/lib/api-keys/utils';
import { ApiPermission, ApiEnvironment } from '@prisma/client';

/**
 * GET /api/developer/keys
 * List all API keys for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's API keys (exclude the actual key hash)
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: session.user.id,
        status: {
          not: 'REVOKED',
        },
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        permissions: true,
        environment: true,
        status: true,
        requestsCount: true,
        lastUsedAt: true,
        expiresAt: true,
        rateLimit: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Mask the keys
    const maskedKeys = apiKeys.map((key) => ({
      ...key,
      maskedKey: maskApiKey(key.prefix),
    }));

    return NextResponse.json({
      success: true,
      keys: maskedKeys,
      total: maskedKeys.length,
    });
  } catch (error) {
    console.error('[API_KEYS_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/developer/keys
 * Create a new API key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, permissions, environment, expiresInDays, rateLimit } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be less than 100 characters' },
        { status: 400 }
      );
    }

    // Check how many active keys the user has (limit to 10)
    const activeKeysCount = await prisma.apiKey.count({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (activeKeysCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum of 10 active API keys allowed' },
        { status: 400 }
      );
    }

    // Validate permissions
    const validPermissions = Object.values(ApiPermission);
    const selectedPermissions = permissions || [ApiPermission.READ_ONLY];
    
    for (const perm of selectedPermissions) {
      if (!validPermissions.includes(perm)) {
        return NextResponse.json(
          { error: `Invalid permission: ${perm}` },
          { status: 400 }
        );
      }
    }

    // Validate environment
    const env = (environment || 'PRODUCTION') as ApiEnvironment;
    if (!Object.values(ApiEnvironment).includes(env)) {
      return NextResponse.json(
        { error: 'Invalid environment' },
        { status: 400 }
      );
    }

    // Generate the API key
    const { key, hashedKey, prefix } = generateApiKey(env);

    // Calculate expiration date if provided
    let expiresAt: Date | null = null;
    if (expiresInDays && typeof expiresInDays === 'number' && expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    // Create API key in database
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        key: hashedKey,
        name: name.trim(),
        prefix,
        permissions: selectedPermissions,
        environment: env,
        expiresAt,
        rateLimit: rateLimit || 1000,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        permissions: true,
        environment: true,
        status: true,
        expiresAt: true,
        rateLimit: true,
        createdAt: true,
      },
    });

    // Return the plain key ONLY THIS TIME
    // User must save it, as it won't be shown again
    return NextResponse.json({
      success: true,
      message: 'API key created successfully. Save it securely, it will not be shown again.',
      key, // ⚠️ Plain text key - only returned once!
      apiKey: {
        ...apiKey,
        maskedKey: maskApiKey(prefix),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[API_KEYS_POST]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
