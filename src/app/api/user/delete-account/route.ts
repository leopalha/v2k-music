/**
 * Account Deletion API - GDPR/LGPD Compliance
 * DELETE /api/user/delete-account
 * Permanently deletes user account and all associated data
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { checkCSRF } from '@/lib/csrf';

export async function DELETE(request: Request) {
  try {
    // CSRF protection (critical - account deletion)
    const csrfCheck = await checkCSRF(request as any);
    if (!csrfCheck.allowed) {
      return csrfCheck.response;
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Get confirmation from request body
    const { confirmation } = await request.json();

    // Require explicit confirmation
    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        { 
          error: 'Confirmação inválida. Digite "DELETE_MY_ACCOUNT" para confirmar.',
          required: 'DELETE_MY_ACCOUNT'
        },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        portfolio: {
          select: {
            amount: true,
            currentValue: true,
          },
        },
        transactions: {
          where: {
            status: 'PENDING',
          },
          select: { id: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Check for active holdings
    const hasActiveHoldings = user.portfolio.some(p => p.amount > 0);
    if (hasActiveHoldings) {
      const totalValue = user.portfolio.reduce((sum, p) => sum + p.currentValue, 0);
      return NextResponse.json(
        { 
          error: 'Não é possível deletar conta com investimentos ativos',
          reason: 'Você possui tokens no valor de R$ ' + totalValue.toFixed(2),
          action: 'Venda todos os seus tokens antes de deletar sua conta',
        },
        { status: 400 }
      );
    }

    // Check for pending transactions
    if (user.transactions.length > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível deletar conta com transações pendentes',
          reason: `Você possui ${user.transactions.length} transação(ões) pendente(s)`,
          action: 'Aguarde a conclusão das transações antes de deletar sua conta',
        },
        { status: 400 }
      );
    }

    // Delete user (cascades to all related data due to onDelete: Cascade in schema)
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log(`[ACCOUNT_DELETED] User ${user.id} (${session.user.email}) deleted their account`);

    return NextResponse.json({
      success: true,
      message: 'Conta deletada com sucesso. Todos os seus dados foram removidos permanentemente.',
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[DELETE_ACCOUNT_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao deletar conta' },
      { status: 500 }
    );
  }
}
