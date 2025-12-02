import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/users/[id]/achievements
 * Get user's achievements with filtering options
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const unlockedOnly = searchParams.get("unlocked") === "true";
    const type = searchParams.get("type");

    // Build where clause
    const where: any = { userId };

    if (unlockedOnly) {
      where.unlocked = true;
    }

    if (type) {
      where.type = type;
    }

    // Get achievements
    const achievements = await prisma.achievement.findMany({
      where,
      orderBy: [
        { unlocked: "desc" },
        { tier: "asc" },
        { type: "asc" },
      ],
    });

    // Get summary stats
    const totalAchievements = await prisma.achievement.count({
      where: { userId },
    });

    const unlockedAchievements = await prisma.achievement.count({
      where: { userId, unlocked: true },
    });

    const totalPoints = achievements
      .filter((a) => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    // Group by type for easier display
    const achievementsByType = achievements.reduce(
      (acc, achievement) => {
        if (!acc[achievement.type]) {
          acc[achievement.type] = [];
        }
        acc[achievement.type].push(achievement);
        return acc;
      },
      {} as Record<string, typeof achievements>
    );

    return NextResponse.json({
      achievements,
      achievementsByType,
      summary: {
        total: totalAchievements,
        unlocked: unlockedAchievements,
        locked: totalAchievements - unlockedAchievements,
        totalPoints,
        completionRate: totalAchievements > 0
          ? (unlockedAchievements / totalAchievements) * 100
          : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Erro ao buscar conquistas" },
      { status: 500 }
    );
  }
}
