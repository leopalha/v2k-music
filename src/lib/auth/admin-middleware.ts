/**
 * Admin Middleware
 * Verifica se usuário tem permissões de admin
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { prisma } from '@/lib/db/prisma';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    };
  }

  // Get user with role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Acesso negado. Requer permissões de administrador.' },
        { status: 403 }
      )
    };
  }

  return {
    authorized: true,
    user,
    session
  };
}

export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    };
  }

  // Get user with role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  if (!user || user.role !== 'SUPER_ADMIN') {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Acesso negado. Requer permissões de super administrador.' },
        { status: 403 }
      )
    };
  }

  return {
    authorized: true,
    user,
    session
  };
}
