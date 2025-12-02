import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { notifyReferralCompleted } from "@/lib/notifications/createNotification";

// POST - Complete referral and pay rewards (called when referee makes first investment)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Find current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        referredById: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Check if user was referred
    if (!user.referredById) {
      return NextResponse.json(
        { message: "Usuário não foi referido" },
        { status: 200 }
      );
    }

    // Find pending referral with referrer info
    const referral = await prisma.referral.findFirst({
      where: {
        referrerId: user.referredById,
        refereeId: user.id,
        status: "PENDING",
      },
      include: {
        referrer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!referral) {
      // Already completed or doesn't exist
      return NextResponse.json(
        { message: "Referência já foi completada ou não existe" },
        { status: 200 }
      );
    }

    // Complete referral and pay rewards
    await prisma.$transaction([
      // Update referral status
      prisma.referral.update({
        where: { id: referral.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          rewardPaidAt: new Date(),
        },
      }),

      // Credit referrer's balance
      prisma.user.update({
        where: { id: referral.referrerId },
        data: {
          cashBalance: {
            increment: referral.referrerReward,
          },
        },
      }),
    ]);

    // Send notification to referrer
    try {
      await notifyReferralCompleted(
        referral.referrer.id,
        user.name || user.email.split("@")[0],
        referral.referrerReward,
        referral.id
      );
    } catch (error) {
      console.error("Error sending referral completion notification:", error);
      // Don't fail the completion if notification fails
    }

    return NextResponse.json({
      message: "Referência completada com sucesso!",
      referrerReward: referral.referrerReward,
      refereeReward: referral.refereeReward,
    });
  } catch (error) {
    console.error("Error completing referral:", error);
    return NextResponse.json(
      { error: "Erro ao completar referência" },
      { status: 500 }
    );
  }
}
