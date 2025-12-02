import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// DELETE /api/watchlist/[trackId] - Remove track from watchlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { trackId } = await params;

    if (!trackId) {
      return NextResponse.json(
        { error: "Track ID is required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find watchlist item
    const watchlistItem = await prisma.favorite.findFirst({
      where: {
        userId: user.id,
        trackId,
        type: "WATCHLIST",
      },
    });

    if (!watchlistItem) {
      return NextResponse.json(
        { error: "Track not in watchlist" },
        { status: 404 }
      );
    }

    // Delete watchlist item
    await prisma.favorite.delete({
      where: {
        id: watchlistItem.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Track removed from watchlist",
    });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from watchlist" },
      { status: 500 }
    );
  }
}

// GET /api/watchlist/[trackId] - Check if track is in watchlist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { trackId } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ isInWatchlist: false });
    }

    // Check if in watchlist
    const watchlistItem = await prisma.favorite.findFirst({
      where: {
        userId: user.id,
        trackId,
        type: "WATCHLIST",
      },
    });

    return NextResponse.json({
      isInWatchlist: !!watchlistItem,
      watchlistItemId: watchlistItem?.id,
    });
  } catch (error) {
    console.error("Error checking watchlist status:", error);
    return NextResponse.json({ isInWatchlist: false });
  }
}
