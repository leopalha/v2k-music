import { prisma } from "@/lib/db/prisma";
import { AchievementType } from "@prisma/client";

/**
 * Update user stats after a transaction
 */
export async function updateUserStatsFromTransaction(userId: string) {
  try {
    // Get all transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
      },
    });

    // Get portfolio
    const portfolio = await prisma.portfolio.findMany({
      where: { userId },
      include: { track: true },
    });

    // Calculate investment stats
    const buyTransactions = transactions.filter((t) => t.type === "BUY");
    const sellTransactions = transactions.filter((t) => t.type === "SELL");

    const totalInvested = buyTransactions.reduce(
      (sum, t) => sum + t.totalValue,
      0
    );
    const totalSold = sellTransactions.reduce((sum, t) => sum + t.totalValue, 0);
    const totalProfit = sellTransactions
      .filter((t) => t.totalValue > 0)
      .reduce((sum, t) => sum + (t.totalValue - t.totalValue), 0);
    const totalLoss = sellTransactions
      .filter((t) => t.totalValue < 0)
      .reduce((sum, t) => sum + Math.abs(t.totalValue), 0);

    const totalTrades = transactions.length;
    const profitableTrades = sellTransactions.filter(
      (t) => t.totalValue > 0
    ).length;
    const winRate =
      totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

    // Calculate portfolio stats
    const portfolioValue = portfolio.reduce(
      (sum, p) => sum + p.currentValue,
      0
    );
    const portfolioDiversity = portfolio.length;
    const largestHolding = portfolio.reduce(
      (max, p) => Math.max(max, p.currentValue),
      0
    );

    // Calculate royalties
    const totalRoyaltiesEarned = portfolio.reduce(
      (sum, p) => sum + p.totalRoyaltiesEarned,
      0
    );
    const monthlyRoyalties = portfolio.reduce(
      (sum, p) => sum + (p.totalRoyaltiesEarned > 0 ? p.totalRoyaltiesEarned : 0),
      0
    );

    // Get social stats
    const followersCount = await prisma.follow.count({
      where: { followingId: userId },
    });
    const followingCount = await prisma.follow.count({
      where: { followerId: userId },
    });
    const commentsCount = await prisma.comment.count({
      where: { userId },
    });
    const likesReceived = await prisma.commentLike.count({
      where: {
        comment: {
          userId,
        },
      },
    });

    // Update or create user stats
    await prisma.userStats.upsert({
      where: { userId },
      create: {
        userId,
        totalInvested,
        totalProfit,
        totalLoss,
        winRate,
        totalTrades,
        profitableTrades,
        portfolioValue,
        portfolioDiversity,
        largestHolding,
        totalRoyaltiesEarned,
        monthlyRoyalties,
        followersCount,
        followingCount,
        commentsCount,
        likesReceived,
      },
      update: {
        totalInvested,
        totalProfit,
        totalLoss,
        winRate,
        totalTrades,
        profitableTrades,
        portfolioValue,
        portfolioDiversity,
        largestHolding,
        totalRoyaltiesEarned,
        monthlyRoyalties,
        followersCount,
        followingCount,
        commentsCount,
        likesReceived,
      },
    });

    // Check and update achievements
    await checkAndUpdateAchievements(userId);
  } catch (error) {
    console.error("Error updating user stats:", error);
  }
}

/**
 * Update user stats after social interaction
 */
export async function updateUserStatsFromSocial(userId: string) {
  try {
    const followersCount = await prisma.follow.count({
      where: { followingId: userId },
    });
    const followingCount = await prisma.follow.count({
      where: { followerId: userId },
    });
    const commentsCount = await prisma.comment.count({
      where: { userId },
    });
    const likesReceived = await prisma.commentLike.count({
      where: {
        comment: {
          userId,
        },
      },
    });

    await prisma.userStats.upsert({
      where: { userId },
      create: {
        userId,
        followersCount,
        followingCount,
        commentsCount,
        likesReceived,
      },
      update: {
        followersCount,
        followingCount,
        commentsCount,
        likesReceived,
      },
    });

    await checkAndUpdateAchievements(userId);
  } catch (error) {
    console.error("Error updating social stats:", error);
  }
}

/**
 * Update login streak
 */
export async function updateLoginStreak(userId: string) {
  try {
    const stats = await prisma.userStats.findUnique({
      where: { userId },
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!stats) {
      // First login
      await prisma.userStats.create({
        data: {
          userId,
          loginStreak: 1,
          longestStreak: 1,
          lastLoginDate: today,
          daysActive: 1,
        },
      });
      return;
    }

    if (!stats.lastLoginDate) {
      // No previous login date
      await prisma.userStats.update({
        where: { userId },
        data: {
          loginStreak: 1,
          longestStreak: 1,
          lastLoginDate: today,
          daysActive: 1,
        },
      });
      return;
    }

    const lastLogin = new Date(stats.lastLoginDate);
    const lastLoginDate = new Date(
      lastLogin.getFullYear(),
      lastLogin.getMonth(),
      lastLogin.getDate()
    );
    const daysDiff = Math.floor(
      (today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Same day, don't update
      return;
    } else if (daysDiff === 1) {
      // Consecutive day
      const newStreak = stats.loginStreak + 1;
      await prisma.userStats.update({
        where: { userId },
        data: {
          loginStreak: newStreak,
          longestStreak: Math.max(stats.longestStreak, newStreak),
          lastLoginDate: today,
          daysActive: stats.daysActive + 1,
        },
      });
    } else {
      // Streak broken
      await prisma.userStats.update({
        where: { userId },
        data: {
          loginStreak: 1,
          lastLoginDate: today,
          daysActive: stats.daysActive + 1,
        },
      });
    }

    await checkAndUpdateAchievements(userId);
  } catch (error) {
    console.error("Error updating login streak:", error);
  }
}

/**
 * Check and update achievements based on current stats
 */
async function checkAndUpdateAchievements(userId: string) {
  try {
    const stats = await prisma.userStats.findUnique({
      where: { userId },
    });

    if (!stats) return;

    const achievementChecks: Array<{
      type: AchievementType;
      progress: number;
    }> = [
      { type: "TOTAL_INVESTED", progress: stats.totalInvested },
      { type: "PROFIT_EARNED", progress: stats.totalProfit },
      { type: "TOTAL_TRADES", progress: stats.totalTrades },
      { type: "PORTFOLIO_DIVERSITY", progress: stats.portfolioDiversity },
      { type: "FOLLOWERS_COUNT", progress: stats.followersCount },
      { type: "LOGIN_STREAK", progress: stats.loginStreak },
      { type: "ROYALTIES_EARNED", progress: stats.totalRoyaltiesEarned },
      { type: "WHALE", progress: stats.portfolioValue },
    ];

    // Update achievements progress
    for (const check of achievementChecks) {
      // Get existing achievements for this type
      const achievements = await prisma.achievement.findMany({
        where: {
          userId,
          type: check.type,
        },
      });

      // Import achievement definitions
      const { getAchievementsByType } = await import("./achievements");
      const definitions = getAchievementsByType(check.type);

      for (const def of definitions) {
        const existing = achievements.find((a) => a.tier === def.tier);

        if (existing) {
          // Update progress
          const unlocked = check.progress >= def.target;
          await prisma.achievement.update({
            where: { id: existing.id },
            data: {
              progress: check.progress,
              unlocked,
              unlockedAt: unlocked && !existing.unlocked ? new Date() : existing.unlockedAt,
            },
          });
        } else {
          // Create new achievement
          const unlocked = check.progress >= def.target;
          await prisma.achievement.create({
            data: {
              userId,
              type: def.type,
              tier: def.tier,
              title: def.title,
              description: def.description,
              points: def.points,
              icon: def.icon,
              progress: check.progress,
              target: def.target,
              unlocked,
              unlockedAt: unlocked ? new Date() : null,
            },
          });
        }
      }
    }

    // Update total achievements unlocked and points
    const unlockedAchievements = await prisma.achievement.findMany({
      where: {
        userId,
        unlocked: true,
      },
    });

    const totalPoints = unlockedAchievements.reduce(
      (sum, a) => sum + a.points,
      0
    );
    const achievementsUnlocked = unlockedAchievements.length;

    await prisma.userStats.update({
      where: { userId },
      data: {
        achievementsUnlocked,
        totalPoints,
      },
    });

    // Update user XP and level
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: totalPoints,
        level: Math.floor(totalPoints / 100) + 1,
      },
    });
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
}
