import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { calculateLevelProgress } from "@/lib/gamification/achievements";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/users/[id]/stats
 * Get user's detailed stats and achievements
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        profileImageUrl: true,
        level: true,
        xp: true,
        badges: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Get user stats
    const stats = await prisma.userStats.findUnique({
      where: { userId },
    });

    // Get achievements
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: [{ unlocked: "desc" }, { tier: "asc" }],
    });

    // Calculate level progress
    const levelProgress = calculateLevelProgress(user.xp);

    // Get user's leaderboard rank
    const higherRankedUsers = await prisma.userStats.count({
      where: {
        totalPoints: {
          gt: stats?.totalPoints || 0,
        },
      },
    });
    const globalRank = higherRankedUsers + 1;

    // Group achievements by type
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

    // Get recent unlocked achievements
    const recentAchievements = achievements
      .filter((a) => a.unlocked)
      .sort((a, b) => {
        if (!a.unlockedAt || !b.unlockedAt) return 0;
        return b.unlockedAt.getTime() - a.unlockedAt.getTime();
      })
      .slice(0, 5);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        level: user.level,
        xp: user.xp,
        badges: user.badges,
        createdAt: user.createdAt,
      },
      levelProgress,
      globalRank,
      stats: stats || {
        totalInvested: 0,
        totalProfit: 0,
        totalLoss: 0,
        winRate: 0,
        totalTrades: 0,
        profitableTrades: 0,
        portfolioValue: 0,
        portfolioDiversity: 0,
        totalRoyaltiesEarned: 0,
        monthlyRoyalties: 0,
        followersCount: 0,
        followingCount: 0,
        commentsCount: 0,
        likesReceived: 0,
        loginStreak: 0,
        longestStreak: 0,
        daysActive: 0,
        achievementsUnlocked: 0,
        totalPoints: 0,
      },
      achievements: {
        all: achievements,
        byType: achievementsByType,
        recent: recentAchievements,
        total: achievements.length,
        unlocked: achievements.filter((a) => a.unlocked).length,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas do usuário" },
      { status: 500 }
    );
  }
}
