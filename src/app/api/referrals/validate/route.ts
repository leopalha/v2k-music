import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET - Validate referral code (public endpoint for signup form)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Código de referência não fornecido", valid: false },
        { status: 400 }
      );
    }

    // Find user with this referral code
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code },
      select: {
        id: true,
        name: true,
        email: true,
        profileImageUrl: true,
      },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Código de referência inválido", valid: false },
        { status: 404 }
      );
    }

    // Return validation success with referrer info
    return NextResponse.json({
      valid: true,
      referrer: {
        name: referrer.name || "Usuário",
        // Don't expose full email, just first part
        email: referrer.email.split("@")[0] + "@...",
        profileImageUrl: referrer.profileImageUrl,
      },
      bonus: 10, // Bonus amount for referee
    });
  } catch (error) {
    console.error("Error validating referral code:", error);
    return NextResponse.json(
      { error: "Erro ao validar código", valid: false },
      { status: 500 }
    );
  }
}
