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
      select: { id: true, email: true, role: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Cannot ban admins
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot ban admin users' }, { status: 400 });
    }
    
    const updated = await prisma.user.update({
      where: { id },
      data: { kycStatus: 'REJECTED' },
      select: {
        id: true,
        name: true,
        email: true,
        kycStatus: true,
      },
    });
    
    // Log audit event
    await createAuditLog({
      action: AuditAction.USER_BAN,
      userId: admin.id,
      resource: `user:${id}`,
      details: {
        targetEmail: user.email,
        adminEmail: admin.email,
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
