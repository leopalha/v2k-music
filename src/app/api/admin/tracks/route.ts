import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/admin/permissions';

export async function GET(request: NextRequest) {
  try {
    // Check admin permissions
    await requireAdmin();

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';

    // Fetch tracks with status
    const tracks = await prisma.track.findMany({
      where: {
        status: status as any,
      },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      tracks,
      count: tracks.length,
    });
  } catch (error) {
    console.error('[FETCH_ADMIN_TRACKS_ERROR]', error);
    
    if ((error as any).message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}
