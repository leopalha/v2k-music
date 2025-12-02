import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// GET - Get portfolio sharing settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        portfolioPublic: true,
        shareSlug: true,
        showHoldings: true,
        showPerformance: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      settings: user,
      shareUrl: user.shareSlug
        ? `${process.env.NEXTAUTH_URL}/share/${user.shareSlug}`
        : null,
    });
  } catch (error) {
    console.error("Error fetching sharing settings:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

// PUT - Update portfolio sharing settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { portfolioPublic, showHoldings, showPerformance, generateSlug } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Generate slug if requested and doesn't exist
    let shareSlug = user.shareSlug;
    if (generateSlug && !shareSlug) {
      // Create slug from username or email
      const baseSlug = user.username || user.email.split("@")[0];
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      shareSlug = `${baseSlug}-${randomSuffix}`.toLowerCase().replace(/[^a-z0-9-]/g, "");

      // Check uniqueness
      const existing = await prisma.user.findUnique({
        where: { shareSlug },
      });

      if (existing) {
        shareSlug = `${shareSlug}-${Date.now()}`;
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        portfolioPublic: portfolioPublic ?? user.portfolioPublic,
        showHoldings: showHoldings ?? user.showHoldings,
        showPerformance: showPerformance ?? user.showPerformance,
        shareSlug,
      },
      select: {
        portfolioPublic: true,
        shareSlug: true,
        showHoldings: true,
        showPerformance: true,
      },
    });

    return NextResponse.json({
      settings: updated,
      shareUrl: updated.shareSlug
        ? `${process.env.NEXTAUTH_URL}/share/${updated.shareSlug}`
        : null,
    });
  } catch (error) {
    console.error("Error updating sharing settings:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar configurações" },
      { status: 500 }
    );
  }
}
