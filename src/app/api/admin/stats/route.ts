import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/permissions';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    await requireAdmin();
    
    const [
      totalUsers,
      activeUsers,
      totalTracks,
      totalTransactions,
      totalRevenue,
      todayUsers,
      todayTransactions,
      todayRevenue,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active users (last 30 days)
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      
      // Total tracks
      prisma.track.count(),
      
      // Total transactions
      prisma.transaction.count(),
      
      // Total revenue
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'BUY' },
      }),
      
      // Today's new users
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      
      // Today's transactions
      prisma.transaction.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      
      // Today's revenue
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'BUY',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);
    
    // Get top tracks by volume
    const topTracks = await prisma.track.findMany({
      select: {
        id: true,
        title: true,
        artist: true,
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: {
        transactions: { _count: 'desc' },
      },
      take: 5,
    });
    
    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      select: {
        id: true,
        type: true,
        amount: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        track: {
          select: {
            title: true,
            artist: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    
    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        totalTracks,
        totalTransactions,
        totalRevenue: totalRevenue._sum.amount || 0,
        todayUsers,
        todayTransactions,
        todayRevenue: todayRevenue._sum.amount || 0,
      },
      topTracks,
      recentTransactions,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
