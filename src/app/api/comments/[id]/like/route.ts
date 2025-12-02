import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { notifyCommentLike } from "@/lib/notifications/createNotification";

// POST - Like/Unlike a comment (toggle)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: commentId } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Check comment exists and get track info
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        track: {
          select: { id: true, title: true },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comentário não encontrado" },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId,
        },
      },
    });

    if (existingLike) {
      // Unlike: Remove like and decrement count
      await prisma.$transaction([
        prisma.commentLike.delete({
          where: { id: existingLike.id },
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: { likes: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({
        liked: false,
        likes: comment.likes - 1,
      });
    } else {
      // Like: Create like and increment count
      await prisma.$transaction([
        prisma.commentLike.create({
          data: {
            userId: user.id,
            commentId,
          },
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: { likes: { increment: 1 } },
        }),
      ]);

      // Send notification to comment owner (don't notify yourself)
      if (comment.user.id !== user.id) {
        try {
          await notifyCommentLike(
            comment.user.id,
            user.name || user.email.split("@")[0],
            comment.track.title,
            commentId,
            comment.track.id
          );
        } catch (error) {
          console.error("Error sending like notification:", error);
          // Don't fail the like action if notification fails
        }
      }

      return NextResponse.json({
        liked: true,
        likes: comment.likes + 1,
      });
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json(
      { error: "Erro ao dar like/unlike" },
      { status: 500 }
    );
  }
}
