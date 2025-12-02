import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// DELETE /api/alerts/[id] - Delete price alert
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Find alert
    const alert = await prisma.priceAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    // Verify ownership
    if (alert.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete alert
    await prisma.priceAlert.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Alert deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json(
      { error: "Failed to delete alert" },
      { status: 500 }
    );
  }
}

// PATCH /api/alerts/[id] - Update alert (toggle active status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    // Find alert
    const alert = await prisma.priceAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    // Verify ownership
    if (alert.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update alert
    const updatedAlert = await prisma.priceAlert.update({
      where: { id },
      data: {
        isActive: isActive ?? !alert.isActive,
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
        alert: updatedAlert,
        message: "Alert updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}
