import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/users/search
 * Search users by username or name for mentions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!query || query.length < 1) {
      return NextResponse.json({ users: [] });
    }

    // Search users by username or name (case-insensitive)
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            username: {
              not: null,
            },
          },
          {
            OR: [
              {
                username: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        profileImageUrl: true,
      },
      take: Math.min(limit, 10), // Max 10 results
      orderBy: [
        {
          username: "asc",
        },
      ],
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}
