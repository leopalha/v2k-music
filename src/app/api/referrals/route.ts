import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import {
  notifyReferralSignup,
  notifyReferralReward,
} from "@/lib/notifications/createNotification";

// GET - List user's referrals and stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        referralCode: true,
        referredById: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Get all referrals made by this user
    const referrals = await prisma.referral.findMany({
      where: { referrerId: user.id },
      include: {
        referee: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const totalReferrals = referrals.length;
    const pendingCount = referrals.filter((r) => r.status === "PENDING").length;
    const completedCount = referrals.filter(
      (r) => r.status === "COMPLETED" || r.status === "REWARDED"
    ).length;
    const totalEarned = referrals.reduce(
      (sum, r) => sum + (r.referrerReward || 0),
      0
    );
    const pendingRewards = referrals
      .filter((r) => r.status === "COMPLETED" && !r.rewardPaidAt)
      .reduce((sum, r) => sum + (r.referrerReward || 0), 0);

    return NextResponse.json({
      referralCode: user.referralCode,
      referrals,
      stats: {
        totalReferrals,
        pendingCount,
        completedCount,
        totalEarned,
        pendingRewards,
      },
      wasReferred: !!user.referredById,
    });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return NextResponse.json(
      { error: "Erro ao buscar referências" },
      { status: 500 }
    );
  }
}

// POST - Validate and apply referral code (used during signup)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { referralCode } = body;

    if (!referralCode || typeof referralCode !== "string") {
      return NextResponse.json(
        { error: "Código de referência inválido" },
        { status: 400 }
      );
    }

    // Find current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Check if user already has a referrer
    if (currentUser.referredById) {
      return NextResponse.json(
        { error: "Você já foi referido por outro usuário" },
        { status: 400 }
      );
    }

    // Find referrer by code
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Código de referência não encontrado" },
        { status: 404 }
      );
    }

    // Can't refer yourself
    if (referrer.id === currentUser.id) {
      return NextResponse.json(
        { error: "Você não pode usar seu próprio código de referência" },
        { status: 400 }
      );
    }

    // Check if referral already exists
    const existingReferral = await prisma.referral.findUnique({
      where: {
        referrerId_refereeId: {
          referrerId: referrer.id,
          refereeId: currentUser.id,
        },
      },
    });

    if (existingReferral) {
      return NextResponse.json(
        { error: "Referência já existe" },
        { status: 400 }
      );
    }

    // Create referral and update user
    const REFEREE_BONUS = 10; // R$ 10 bonus for new user
    const REFERRER_BONUS = 5; // R$ 5 bonus for referrer (will be credited on first investment)

    const [referral, updatedUser] = await prisma.$transaction([
      // Create referral record
      prisma.referral.create({
        data: {
          referrerId: referrer.id,
          refereeId: currentUser.id,
          code: referralCode,
          status: "PENDING",
          referrerReward: REFERRER_BONUS,
          refereeReward: REFEREE_BONUS,
        },
      }),

      // Update referee's referredById and give immediate bonus
      prisma.user.update({
        where: { id: currentUser.id },
        data: {
          referredById: referrer.id,
          cashBalance: {
            increment: REFEREE_BONUS,
          },
        },
      }),
    ]);

    // Send notifications
    try {
      // Notify referrer that someone signed up
      await notifyReferralSignup(
        referrer.id,
        currentUser.name || currentUser.email.split("@")[0],
        referral.id
      );

      // Notify referee about their bonus
      await notifyReferralReward(currentUser.id, REFEREE_BONUS, referral.id);
    } catch (error) {
      console.error("Error sending referral signup notifications:", error);
      // Don't fail the referral if notification fails
    }

    return NextResponse.json({
      message: "Código de referência aplicado com sucesso!",
      referral: {
        referrerName: referrer.name || "Usuário",
        bonusReceived: REFEREE_BONUS,
        bonusForReferrer: REFERRER_BONUS,
      },
    });
  } catch (error) {
    console.error("Error applying referral code:", error);
    return NextResponse.json(
      { error: "Erro ao aplicar código de referência" },
      { status: 500 }
    );
  }
}
