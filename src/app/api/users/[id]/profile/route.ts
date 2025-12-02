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
 * GET /api/users/[id]/profile
 * Get a user's public profile with follow stats
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: userId } = await params;

    // Get current user to check if they follow this user
    const session = await getServerSession(authOptions);
    let currentUserId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      currentUserId = user?.id || null;
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        profileImageUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Get followers count
    const followersCount = await prisma.follow.count({
      where: { followingId: userId },
    });

    // Get following count
    const followingCount = await prisma.follow.count({
      where: { followerId: userId },
    });

    // Check if current user follows this user
    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const followRecord = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });
      isFollowing = !!followRecord;
    }

    return NextResponse.json({
      user: {
        ...user,
        followersCount,
        followingCount,
        isFollowing,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Erro ao buscar perfil do usuário" },
      { status: 500 }
    );
  }
}
