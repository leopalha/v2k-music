import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { notifyNewFollower } from "@/lib/notifications/createNotification";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/users/[id]/follow
 * Follow a user
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, username: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const { id: userIdToFollow } = await params;

    // Can't follow yourself
    if (currentUser.id === userIdToFollow) {
      return NextResponse.json(
        { error: "Você não pode seguir a si mesmo" },
        { status: 400 }
      );
    }

    // Check if user to follow exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: userIdToFollow },
      select: { id: true, name: true, username: true },
    });

    if (!userToFollow) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userIdToFollow,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: "Você já segue este usuário" },
        { status: 400 }
      );
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: userIdToFollow,
      },
    });

    // Send notification asynchronously
    (async () => {
      try {
        await notifyNewFollower(
          userIdToFollow,
          currentUser.name || currentUser.username || "Um usuário",
          currentUser.username,
          currentUser.id
        );
      } catch (error) {
        console.error("Error sending follow notification:", error);
      }
    })();

    return NextResponse.json(
      {
        success: true,
        follow,
        message: "Seguindo com sucesso",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Erro ao seguir usuário" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]/follow
 * Unfollow a user
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const { id: userIdToUnfollow } = await params;

    // Delete follow relationship
    const deletedFollow = await prisma.follow.deleteMany({
      where: {
        followerId: currentUser.id,
        followingId: userIdToUnfollow,
      },
    });

    if (deletedFollow.count === 0) {
      return NextResponse.json(
        { error: "Você não segue este usuário" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Deixou de seguir com sucesso",
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: "Erro ao deixar de seguir" },
      { status: 500 }
    );
  }
}
