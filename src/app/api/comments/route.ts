import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import {
  notifyCommentReply,
  notifyCommentMention,
} from "@/lib/notifications/createNotification";
import { parseMentions } from "@/lib/utils/mentions";

// GET - List comments for a track
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("trackId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!trackId) {
      return NextResponse.json(
        { error: "trackId é obrigatório" },
        { status: 400 }
      );
    }

    // Get current user if authenticated
    const session = await getServerSession(authOptions);
    let currentUserId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      currentUserId = user?.id || null;
    }

    // Get comments with user info, like status, and replies
    const comments = await prisma.comment.findMany({
      where: {
        trackId,
        parentId: null, // Only get top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImageUrl: true,
          },
        },
        commentLikes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                profileImageUrl: true,
              },
            },
            commentLikes: currentUserId
              ? {
                  where: { userId: currentUserId },
                  select: { id: true },
                }
              : false,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    });

    // Get total count (only top-level comments)
    const totalCount = await prisma.comment.count({
      where: { trackId, parentId: null },
    });

    // Format response with isLiked flag and replies
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      likes: comment.likes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      mentions: comment.mentions,
      user: comment.user,
      isLiked: currentUserId
        ? (comment.commentLikes as any[]).length > 0
        : false,
      replyCount: comment._count.replies,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        likes: reply.likes,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        mentions: reply.mentions,
        parentId: reply.parentId,
        user: reply.user,
        isLiked: currentUserId
          ? (reply.commentLikes as any[]).length > 0
          : false,
      })),
    }));

    return NextResponse.json({
      comments: formattedComments,
      totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Erro ao buscar comentários" },
      { status: 500 }
    );
  }
}

// POST - Create new comment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { trackId, content, parentId } = body;

    // Validate input
    if (!trackId || !content) {
      return NextResponse.json(
        { error: "trackId e content são obrigatórios" },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comentário não pode estar vazio" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "Comentário muito longo (máx 500 caracteres)" },
        { status: 400 }
      );
    }

    // Parse mentions from content
    const { userIds: mentionedUserIds } = await parseMentions(content);

    // If parentId is provided, verify parent comment exists
    let parentComment = null;
    if (parentId) {
      parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        include: {
          user: {
            select: { id: true, name: true },
          },
          track: {
            select: { id: true, title: true },
          },
        },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Comentário pai não encontrado" },
          { status: 404 }
        );
      }

      if (parentComment.trackId !== trackId) {
        return NextResponse.json(
          { error: "Comentário pai pertence a outra música" },
          { status: 400 }
        );
      }
    }

    // Check track exists and get artist info
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: {
        artist: {
          select: { id: true, name: true },
        },
      },
    });

    if (!track) {
      return NextResponse.json(
        { error: "Música não encontrada" },
        { status: 404 }
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        userId: user.id,
        trackId,
        content: content.trim(),
        parentId: parentId || undefined,
        mentions: mentionedUserIds,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImageUrl: true,
          },
        },
      },
    });

    const userName = user.name || user.email.split("@")[0];

    // Send notifications asynchronously (don't block response)
    (async () => {
      try {
        // If this is a reply, notify the parent comment owner
        if (parentComment && parentComment.user.id !== user.id) {
          await notifyCommentReply(
            parentComment.user.id,
            userName,
            track.title,
            comment.id,
            trackId
          );
        }

        // Notify all mentioned users (except the commenter)
        for (const mentionedUserId of mentionedUserIds) {
          if (mentionedUserId !== user.id) {
            await notifyCommentMention(
              mentionedUserId,
              userName,
              track.title,
              comment.id,
              trackId
            );
          }
        }
      } catch (error) {
        console.error("Error sending comment notifications:", error);
        // Don't fail the comment creation if notification fails
      }
    })();

    return NextResponse.json(
      {
        comment: {
          ...comment,
          isLiked: false,
          mentions: mentionedUserIds,
          parentId: parentId || null,
          replies: [],
          replyCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Erro ao criar comentário" },
      { status: 500 }
    );
  }
}
