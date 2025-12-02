import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/alerts - Get all alerts for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all alerts for user with track info
    const alerts = await prisma.priceAlert.findMany({
      where: { userId: user.id },
      include: {
        track: {
          select: {
            id: true,
            title: true,
            artistName: true,
            coverUrl: true,
            currentPrice: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ alerts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

// POST /api/alerts - Create new price alert
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      trackId,
      targetPrice,
      condition,
      percentChange,
      notifyEmail,
      notifyPush,
    } = body;

    // Validate required fields
    if (!trackId || !targetPrice || !condition) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate condition
    if (!["ABOVE", "BELOW"].includes(condition)) {
      return NextResponse.json(
        { error: "Invalid condition. Must be ABOVE or BELOW" },
        { status: 400 }
      );
    }

    // Check if track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // Check for duplicate alert
    const existingAlert = await prisma.priceAlert.findFirst({
      where: {
        userId: user.id,
        trackId,
        condition,
        targetPrice,
        isActive: true,
      },
    });

    if (existingAlert) {
      return NextResponse.json(
        { error: "Similar alert already exists" },
        { status: 409 }
      );
    }

    // Create alert
    const alert = await prisma.priceAlert.create({
      data: {
        userId: user.id,
        trackId,
        targetPrice: parseFloat(targetPrice.toString()),
        condition,
        percentChange: percentChange
          ? parseFloat(percentChange.toString())
          : null,
        notifyEmail: notifyEmail ?? true,
        notifyPush: notifyPush ?? true,
      },
      include: {
        track: {
          select: {
            id: true,
            title: true,
            artistName: true,
            coverUrl: true,
            currentPrice: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        alert,
        message: "Alert created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}
