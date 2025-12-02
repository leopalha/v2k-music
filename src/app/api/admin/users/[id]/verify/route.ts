import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/permissions';
import { prisma } from '@/lib/db/prisma';
import { createAuditLog, AuditAction } from '@/lib/security/audit-log';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, kycVerifiedAt: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const updated = await prisma.user.update({
      where: { id },
      data: { 
        kycVerifiedAt: new Date(),
        kycStatus: 'VERIFIED',
      },
      select: {
        id: true,
        name: true,
        email: true,
        kycVerifiedAt: true,
      },
    });
    
    // Log audit event
    await createAuditLog({
      action: AuditAction.KYC_COMPLETE,
      userId: admin.id,
      resource: `user:${id}`,
      details: {
        targetEmail: user.email,
        adminEmail: admin.email,
        verifiedBy: 'admin',
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      status: 'SUCCESS',
    });
    
    return NextResponse.json({ user: updated });
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
