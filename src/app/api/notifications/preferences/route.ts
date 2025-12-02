import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        emailNotifications: true,
        notifyInvestments: true,
        notifyRoyalties: true,
        notifyPriceAlerts: true,
        notifyNewTracks: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: user,
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar preferências',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      emailNotifications,
      notifyInvestments,
      notifyRoyalties,
      notifyPriceAlerts,
      notifyNewTracks,
    } = body;

    // Update preferences
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        emailNotifications:
          emailNotifications !== undefined ? emailNotifications : undefined,
        notifyInvestments:
          notifyInvestments !== undefined ? notifyInvestments : undefined,
        notifyRoyalties: notifyRoyalties !== undefined ? notifyRoyalties : undefined,
        notifyPriceAlerts:
          notifyPriceAlerts !== undefined ? notifyPriceAlerts : undefined,
        notifyNewTracks: notifyNewTracks !== undefined ? notifyNewTracks : undefined,
      },
      select: {
        emailNotifications: true,
        notifyInvestments: true,
        notifyRoyalties: true,
        notifyPriceAlerts: true,
        notifyNewTracks: true,
      },
    });

    return NextResponse.json({
      success: true,
      preferences: user,
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao atualizar preferências',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
