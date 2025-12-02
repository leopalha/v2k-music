import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import * as cache from '@/lib/cache/redis';

export type LeaderboardCategory =
  | "totalPoints"
  | "totalInvested"
  | "totalProfit"
  | "portfolioValue"
  | "totalRoyalties"
  | "followersCount";

// GET /api/leaderboard - Get leaderboard rankings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") ||
      "totalPoints") as LeaderboardCategory;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Validate category
    const validCategories: LeaderboardCategory[] = [
      "totalPoints",
      "totalInvested",
      "totalProfit",
      "portfolioValue",
      "totalRoyalties",
      "followersCount",
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Map category to field name
    const categoryFieldMap: Record<LeaderboardCategory, string> = {
      totalPoints: "totalPoints",
      totalInvested: "totalInvested",
      totalProfit: "totalProfit",
      portfolioValue: "portfolioValue",
      totalRoyalties: "totalRoyaltiesEarned",
      followersCount: "followersCount",
    };

    const orderByField = categoryFieldMap[category];

    // Try cache first (5min TTL)
    const cacheKey = cache.CacheKeys.leaderboard(`${category}:${offset}:${limit}`);
    const cached = await cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Get leaderboard data with user in single query (avoid N+1)
    const userStats = await prisma.userStats.findMany({
      where: {
        [orderByField]: {
          gt: 0,
        },
      },
      orderBy: {
        [orderByField]: "desc",
      },
      skip: offset,
      take: limit,
      select: {
        userId: true,
        totalPoints: true,
        totalInvested: true,
        totalProfit: true,
        portfolioValue: true,
        totalRoyaltiesEarned: true,
        followersCount: true,
        achievementsUnlocked: true,
        winRate: true,
        totalTrades: true,
        portfolioDiversity: true,
        loginStreak: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImageUrl: true,
            level: true,
            xp: true,
          }
        }
      },
    });

    // Build leaderboard with user info already included
    const leaderboard = userStats.map((stat, index) => {
      return {
        rank: offset + index + 1,
        userId: stat.userId,
        name: stat.user.name || "Usuário",
        username: stat.user.username,
        profileImageUrl: stat.user.profileImageUrl,
        level: stat.user.level || 1,
        xp: stat.user.xp || 0,
        stats: {
          totalPoints: stat.totalPoints,
          totalInvested: stat.totalInvested,
          totalProfit: stat.totalProfit,
          portfolioValue: stat.portfolioValue,
          totalRoyalties: stat.totalRoyaltiesEarned,
          followersCount: stat.followersCount,
          achievementsUnlocked: stat.achievementsUnlocked,
          winRate: stat.winRate,
          totalTrades: stat.totalTrades,
          portfolioDiversity: stat.portfolioDiversity,
          loginStreak: stat.loginStreak,
        },
        categoryValue: stat[orderByField as keyof typeof stat] as number,
      };
    });

    // Get total count for pagination
    const totalCount = await prisma.userStats.count({
      where: {
        [orderByField]: {
          gt: 0,
        },
      },
    });

    const response = {
      leaderboard,
      category,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    };

    // Cache the response (5min TTL)
    await cache.set(cacheKey, response, { ttl: cache.CacheTTL.MEDIUM });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
