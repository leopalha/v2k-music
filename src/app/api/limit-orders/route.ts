import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// GET - List user's limit orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("trackId");
    const status = searchParams.get("status");

    const where: any = { userId: user.id };
    if (trackId) where.trackId = trackId;
    if (status) where.status = status;

    const orders = await prisma.limitOrder.findMany({
      where,
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

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching limit orders:", error);
    return NextResponse.json(
      { error: "Erro ao buscar ordens" },
      { status: 500 }
    );
  }
}

// POST - Create new limit order
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
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { trackId, orderType, targetPrice, amount, expiresAt } = body;

    // Validate input
    if (!trackId || !orderType || !targetPrice || !amount) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Quantidade deve ser maior que zero" },
        { status: 400 }
      );
    }

    if (targetPrice <= 0) {
      return NextResponse.json(
        { error: "Preço deve ser maior que zero" },
        { status: 400 }
      );
    }

    // Check track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      return NextResponse.json({ error: "Música não encontrada" }, { status: 404 });
    }

    // For SELL orders, check user has enough tokens
    if (orderType === "SELL") {
      const portfolio = await prisma.portfolio.findUnique({
        where: {
          userId_trackId: {
            userId: user.id,
            trackId,
          },
        },
      });

      if (!portfolio || portfolio.amount < amount) {
        return NextResponse.json(
          { error: "Tokens insuficientes para vender" },
          { status: 400 }
        );
      }
    }

    // For BUY orders, check user has enough balance (estimate)
    if (orderType === "BUY") {
      const estimatedCost = targetPrice * amount;
      if (user.cashBalance < estimatedCost) {
        return NextResponse.json(
          { error: "Saldo insuficiente para esta ordem" },
          { status: 400 }
        );
      }
    }

    // Create limit order
    const order = await prisma.limitOrder.create({
      data: {
        userId: user.id,
        trackId,
        orderType,
        targetPrice,
        amount,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
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

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating limit order:", error);
    return NextResponse.json(
      { error: "Erro ao criar ordem" },
      { status: 500 }
    );
  }
}
