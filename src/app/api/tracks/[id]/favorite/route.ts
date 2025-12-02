import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { id: trackId } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_trackId_type: {
          userId: user.id,
          trackId: trackId,
          type: 'FAVORITE',
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          isFavorite: true,
          message: 'Já está nos favoritos',
        },
        { status: 200 }
      );
    }

    // Create favorite
    await prisma.favorite.create({
      data: {
        userId: user.id,
        trackId: trackId,
        type: 'FAVORITE',
      },
    });

    return NextResponse.json(
      {
        success: true,
        isFavorite: true,
        message: 'Adicionado aos favoritos',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao adicionar favorito',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { id: trackId } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Delete favorite
    await prisma.favorite.delete({
      where: {
        userId_trackId_type: {
          userId: user.id,
          trackId: trackId,
          type: 'FAVORITE',
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        isFavorite: false,
        message: 'Removido dos favoritos',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao remover favorito',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
