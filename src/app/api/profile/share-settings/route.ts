import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

// Generate URL-safe slugs
function generateSlug(): string {
  return crypto.randomBytes(6).toString('base64url').toLowerCase().slice(0, 10);
}

/**
 * POST /api/profile/share-settings
 * Update portfolio sharing settings
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        shareSlug: true,
        portfolioPublic: true,
        showHoldings: true,
        showPerformance: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      portfolioPublic,
      showHoldings,
      showPerformance,
      regenerateSlug,
    } = body;

    // Prepare update data
    const updateData: any = {};

    if (typeof portfolioPublic === 'boolean') {
      updateData.portfolioPublic = portfolioPublic;

      // If enabling for first time, generate slug
      if (portfolioPublic && !user.shareSlug) {
        updateData.shareSlug = generateSlug();
      }
    }

    if (typeof showHoldings === 'boolean') {
      updateData.showHoldings = showHoldings;
    }

    if (typeof showPerformance === 'boolean') {
      updateData.showPerformance = showPerformance;
    }

    // Regenerate slug if requested
    if (regenerateSlug === true) {
      updateData.shareSlug = generateSlug();
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        shareSlug: true,
        portfolioPublic: true,
        showHoldings: true,
        showPerformance: true,
      },
    });

    // Generate share URL
    const shareUrl = updatedUser.portfolioPublic && updatedUser.shareSlug
      ? `${process.env.NEXTAUTH_URL}/share/${updatedUser.shareSlug}`
      : null;

    return NextResponse.json({
      success: true,
      settings: {
        portfolioPublic: updatedUser.portfolioPublic,
        showHoldings: updatedUser.showHoldings,
        showPerformance: updatedUser.showPerformance,
        shareSlug: updatedUser.shareSlug,
        shareUrl,
      },
    });
  } catch (error) {
    console.error('Update share settings error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao atualizar configurações',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/profile/share-settings
 * Get current sharing settings
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        shareSlug: true,
        portfolioPublic: true,
        showHoldings: true,
        showPerformance: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Generate share URL
    const shareUrl = user.portfolioPublic && user.shareSlug
      ? `${process.env.NEXTAUTH_URL}/share/${user.shareSlug}`
      : null;

    return NextResponse.json({
      settings: {
        portfolioPublic: user.portfolioPublic,
        showHoldings: user.showHoldings,
        showPerformance: user.showPerformance,
        shareSlug: user.shareSlug,
        shareUrl,
      },
    });
  } catch (error) {
    console.error('Get share settings error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar configurações',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
