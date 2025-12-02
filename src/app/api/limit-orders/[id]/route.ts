import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// GET - Get single limit order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const order = await prisma.limitOrder.findUnique({
      where: { id },
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

    if (!order) {
      return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 });
    }

    // Check ownership
    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching limit order:", error);
    return NextResponse.json(
      { error: "Erro ao buscar ordem" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel limit order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const order = await prisma.limitOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Ordem não encontrada" }, { status: 404 });
    }

    // Check ownership
    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Can only cancel pending orders
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Apenas ordens pendentes podem ser canceladas" },
        { status: 400 }
      );
    }

    // Update order status to CANCELLED
    const cancelledOrder = await prisma.limitOrder.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
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

    return NextResponse.json({ order: cancelledOrder });
  } catch (error) {
    console.error("Error cancelling limit order:", error);
    return NextResponse.json(
      { error: "Erro ao cancelar ordem" },
      { status: 500 }
    );
  }
}
