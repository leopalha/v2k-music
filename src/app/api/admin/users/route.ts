import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/permissions';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    // Search by name or email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Filter by role
    if (role && ['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      where.role = role;
    }
    
    // Filter by status (verified/unverified)
    if (status === 'verified') {
      where.kycStatus = 'VERIFIED';
    } else if (status === 'unverified') {
      where.kycStatus = 'NOT_VERIFIED';
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          profileImageUrl: true,
          role: true,
          kycVerifiedAt: true,
          kycStatus: true,
          createdAt: true,
          _count: {
            select: {
              transactions: true,
              portfolio: true,
              comments: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
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
