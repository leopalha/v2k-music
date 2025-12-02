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
 * GET /api/users/[id]/followers
 * Get list of users who follow this user
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Get current user to check if they follow each follower
    const session = await getServerSession(authOptions);
    let currentUserId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      currentUserId = user?.id || null;
    }

    // Get followers
    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: {
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
        followingId: userId,
      },
    });

    // Check if current user follows each follower
    const followerIds = followers.map((f) => f.follower.id);
    let currentUserFollowing: Set<string> = new Set();

    if (currentUserId && followerIds.length > 0) {
      const followingRecords = await prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: {
            in: followerIds,
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
    const formattedFollowers = followers.map((follow) => ({
      id: follow.follower.id,
      name: follow.follower.name,
      username: follow.follower.username,
      profileImageUrl: follow.follower.profileImageUrl,
      bio: follow.follower.bio,
      isFollowing: currentUserId
        ? currentUserFollowing.has(follow.follower.id)
        : false,
      followedAt: follow.createdAt,
    }));

    return NextResponse.json({
      followers: formattedFollowers,
      totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      { error: "Erro ao buscar seguidores" },
      { status: 500 }
    );
  }
}
