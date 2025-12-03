import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/admin/permissions';
import { createAuditLog, AuditAction } from '@/lib/security/audit-log';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin permissions
    const admin = await requireAdmin();
    const { id: trackId } = await params;

    // Parse request body for rejection reason
    const body = await request.json();
    const reason = body.reason || 'Música não atende aos critérios da plataforma';

    // Find track
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    // Check if already rejected
    if (track.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Track already rejected' },
        { status: 400 }
      );
    }

    // Update track status to REJECTED
    const updatedTrack = await prisma.track.update({
      where: { id: trackId },
      data: {
        status: 'REJECTED',
        updatedAt: new Date(),
      },
    });

    // Create notification for artist
    if (track.artistId) {
      await prisma.notification.create({
        data: {
          userId: track.artistId,
          type: 'TRACK_REJECTED',
          title: 'Música Rejeitada',
          message: `Sua música "${track.title}" foi rejeitada. Motivo: ${reason}`,
          trackId: track.id,
          read: false,
        },
      });
    }

    // Log audit action
    await createAuditLog({
      userId: admin.id,
      action: AuditAction.TRACK_REJECT,
      resource: `track:${track.id}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      details: {
        trackTitle: track.title,
        artistId: track.artistId,
        artistEmail: track.artist?.email,
        reason,
      },
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      track: {
        id: updatedTrack.id,
        title: updatedTrack.title,
        status: updatedTrack.status,
      },
      message: `Track "${track.title}" rejected successfully`,
    });
  } catch (error) {
    console.error('[REJECT_TRACK_ERROR]', error);
    
    if ((error as any).message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reject track' },
      { status: 500 }
    );
  }
}
