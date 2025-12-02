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
 * GET /api/users/[id]/following
 * Get list of users this user is following
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Get current user to check if they follow each user
    const session = await getServerSession(authOptions);
    let currentUserId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      currentUserId = user?.id || null;
    }

    // Get following
    const following = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImageUrl: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    // Get total count
    const totalCount = await prisma.follow.count({
      where: {
        followerId: userId,
      },
    });

    // Check if current user follows each user
    const followingIds = following.map((f) => f.following.id);
    let currentUserFollowing: Set<string> = new Set();

    if (currentUserId && followingIds.length > 0) {
      const followingRecords = await prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: {
            in: followingIds,
          },
        },
        select: {
          followingId: true,
        },
      });

      currentUserFollowing = new Set(
        followingRecords.map((f) => f.followingId)
      );
    }

    // Format response
    const formattedFollowing = following.map((follow) => ({
      id: follow.following.id,
      name: follow.following.name,
      username: follow.following.username,
      profileImageUrl: follow.following.profileImageUrl,
      bio: follow.following.bio,
      isFollowing: currentUserId
        ? currentUserFollowing.has(follow.following.id)
        : false,
      followedAt: follow.createdAt,
    }));

    return NextResponse.json({
      following: formattedFollowing,
      totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error("Error fetching following:", error);
    return NextResponse.json(
      { error: "Erro ao buscar seguindo" },
      { status: 500 }
    );
  }
}
