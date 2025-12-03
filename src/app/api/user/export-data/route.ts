/**
 * Data Export API - GDPR/LGPD Compliance
 * GET /api/user/export-data
 * Returns all user data in JSON format
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Get user with ALL related data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        tracks: true,
        transactions: true,
        portfolio: {
          include: {
            track: {
              select: {
                title: true,
                artistName: true,
              },
            },
          },
        },
        comments: true,
        favorites: {
          include: {
            track: {
              select: {
                title: true,
                artistName: true,
              },
            },
          },
        },
        priceAlerts: {
          include: {
            track: {
              select: {
                title: true,
              },
            },
          },
        },
        limitOrders: {
          include: {
            track: {
              select: {
                title: true,
              },
            },
          },
        },
        notifications: true,
        following: {
          include: {
            following: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        followers: {
          include: {
            follower: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        userStats: true,
        achievements: true,
        referrals: {
          select: {
            name: true,
            email: true,
            createdAt: true,
          },
        },
        apiKeys: {
          select: {
            name: true,
            permissions: true,
            requestsCount: true,
            lastUsedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Remove sensitive fields
    const {
      hashedPassword,
      resetToken,
      resetTokenExpiry,
      ...userData
    } = user;

    // Format data for export
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportType: 'GDPR/LGPD Data Export',
      user: userData,
      summary: {
        totalTracks: user.tracks.length,
        totalTransactions: user.transactions.length,
        totalPortfolioHoldings: user.portfolio.length,
        totalComments: user.comments.length,
        totalFavorites: user.favorites.length,
        totalFollowing: user.following.length,
        totalFollowers: user.followers.length,
        totalNotifications: user.notifications.length,
        totalReferrals: user.referrals.length,
      },
    };

    // Return as downloadable JSON
    const filename = `v2k-data-export-${user.id}-${Date.now()}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[EXPORT_DATA_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao exportar dados' },
      { status: 500 }
    );
  }
}
