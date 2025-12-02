/**
 * API Key Management - Individual Key
 * DELETE /api/developer/keys/[id] - Revoke API key
 * PATCH /api/developer/keys/[id] - Update API key settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * DELETE /api/developer/keys/[id]
 * Revoke an API key
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Find the API key and verify ownership
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        status: true,
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    // Verify the user owns this key
    if (apiKey.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if already revoked
    if (apiKey.status === 'REVOKED') {
      return NextResponse.json(
        { error: 'API key is already revoked' },
        { status: 400 }
      );
    }

    // Revoke the key
    await prisma.apiKey.update({
      where: {
        id,
      },
      data: {
        status: 'REVOKED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    console.error('[API_KEY_DELETE]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/developer/keys/[id]
 * Update API key settings (name, permissions, status)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, status, rateLimit } = body;

    // Find the API key and verify ownership
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    // Verify the user owns this key
    if (apiKey.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Cannot update revoked keys
    if (apiKey.status === 'REVOKED') {
      return NextResponse.json(
        { error: 'Cannot update revoked API key' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Invalid name' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (status !== undefined) {
      if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be ACTIVE or INACTIVE' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (rateLimit !== undefined) {
      if (typeof rateLimit !== 'number' || rateLimit < 0 || rateLimit > 10000) {
        return NextResponse.json(
          { error: 'Rate limit must be between 0 and 10000' },
          { status: 400 }
        );
      }
      updateData.rateLimit = rateLimit;
    }

    // Update the key
    const updatedKey = await prisma.apiKey.update({
      where: {
        id,
      },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        permissions: true,
        environment: true,
        status: true,
        rateLimit: true,
        requestsCount: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'API key updated successfully',
      apiKey: updatedKey,
    });
  } catch (error) {
    console.error('[API_KEY_PATCH]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
