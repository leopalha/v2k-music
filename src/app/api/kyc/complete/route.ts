import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { sendKYCApprovalEmail } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { fullName, cpf, birthDate, phone } = await request.json();

    // Validate required fields
    if (!fullName || !cpf || !birthDate || !phone) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate CPF format (basic)
    const cpfNumbers = cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      return NextResponse.json(
        { error: 'CPF inválido' },
        { status: 400 }
      );
    }

    // Validate age (18+)
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    let finalAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      finalAge = age - 1;
    }

    if (finalAge < 18) {
      return NextResponse.json(
        { error: 'Você precisa ter 18 anos ou mais' },
        { status: 400 }
      );
    }

    // Check if CPF is already in use by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        cpf: cpfNumbers,
        email: {
          not: session.user.email
        }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'CPF já cadastrado em outra conta' },
        { status: 409 }
      );
    }

    // Update user with KYC data
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        fullName,
        cpf: cpfNumbers,
        birthDate: birthDateObj,
        phone: phone.replace(/\D/g, ''),
        kycStatus: 'VERIFIED', // Auto-approve for MVP
        kycVerifiedAt: new Date(),
        onboardingCompleted: true,
      }
    });

    // Send KYC approval email (don't block KYC if it fails)
    try {
      await sendKYCApprovalEmail({ userId: updatedUser.id });
    } catch (error) {
      console.error('Failed to send KYC approval email:', error);
      // Continue with KYC completion even if email fails
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          onboardingCompleted: updatedUser.onboardingCompleted,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('KYC completion error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao completar cadastro',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
