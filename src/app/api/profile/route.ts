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
        id: true,
        email: true,
        name: true,
        username: true,
        bio: true,
        profileImageUrl: true,
        walletAddress: true,
        phone: true,
        fullName: true,
        cpf: true,
        birthDate: true,
        kycStatus: true,
        kycVerifiedAt: true,
        level: true,
        xp: true,
        badges: true,
        cashBalance: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Mask CPF for privacy
    const maskedCpf = user.cpf
      ? `***.***.***-${user.cpf.slice(-2)}`
      : null;

    return NextResponse.json(
      {
        success: true,
        user: {
          ...user,
          cpf: maskedCpf,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar perfil',
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

    const { name, username, bio, phone, walletAddress } = await request.json();

    // Validate username uniqueness if provided
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          email: {
            not: session.user.email,
          },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username já está em uso' },
          { status: 409 }
        );
      }
    }

    // Validate wallet address format if provided
    if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Endereço de carteira inválido' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name !== undefined ? name : undefined,
        username: username !== undefined ? username : undefined,
        bio: bio !== undefined ? bio : undefined,
        phone: phone !== undefined ? phone : undefined,
        walletAddress: walletAddress !== undefined ? walletAddress : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        bio: true,
        profileImageUrl: true,
        walletAddress: true,
        phone: true,
        fullName: true,
        cpf: true,
        birthDate: true,
        kycStatus: true,
        kycVerifiedAt: true,
        level: true,
        xp: true,
        badges: true,
        cashBalance: true,
        createdAt: true,
      },
    });

    // Mask CPF for privacy
    const maskedCpf = updatedUser.cpf
      ? `***.***.***-${updatedUser.cpf.slice(-2)}`
      : null;

    return NextResponse.json(
      {
        success: true,
        user: {
          ...updatedUser,
          cpf: maskedCpf,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao atualizar perfil',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
