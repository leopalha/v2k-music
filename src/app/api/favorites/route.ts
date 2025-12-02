import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { createPublicClient, http, formatEther } from 'viem';
import { hardhat } from 'viem/chains';
import { MUSIC_TOKEN_ABI } from '@/contracts/abis';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MUSIC_TOKEN_ADDRESS as `0x${string}`;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Get favorites
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (favorites.length === 0) {
      return NextResponse.json(
        {
          success: true,
          tracks: [],
          total: 0,
        },
        { status: 200 }
      );
    }

    // Fetch track data from blockchain for each favorite
    const publicClient = createPublicClient({
      chain: hardhat,
      transport: http('http://127.0.0.1:8545'),
    });

    const trackPromises = favorites.map(async (favorite: any) => {
      const trackId = BigInt(favorite.trackId);

      try {
        const [title, artistName, genre, currentPrice, totalSupply, availableSupply] =
          await Promise.all([
            publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: MUSIC_TOKEN_ABI,
              functionName: 'getTrackTitle',
              args: [trackId],
            }) as Promise<string>,
            publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: MUSIC_TOKEN_ABI,
              functionName: 'getArtistName',
              args: [trackId],
            }) as Promise<string>,
            publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: MUSIC_TOKEN_ABI,
              functionName: 'getGenre',
              args: [trackId],
            }) as Promise<string>,
            publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: MUSIC_TOKEN_ABI,
              functionName: 'getPrice',
              args: [trackId],
            }) as Promise<bigint>,
            publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: MUSIC_TOKEN_ABI,
              functionName: 'getTotalSupply',
              args: [trackId],
            }) as Promise<bigint>,
            publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: MUSIC_TOKEN_ABI,
              functionName: 'getAvailableSupply',
              args: [trackId],
            }) as Promise<bigint>,
          ]);

        const priceInMatic = parseFloat(formatEther(currentPrice));

        return {
          id: favorite.trackId,
          title,
          artistName,
          genre,
          currentPrice: priceInMatic,
          totalSupply: Number(totalSupply),
          availableSupply: Number(availableSupply),
          coverUrl: '', // Will be set from IPFS in production
          isFavorite: true,
          favoritedAt: favorite.createdAt.toISOString(),
        };
      } catch (error) {
        console.error(`Error fetching track ${favorite.trackId}:`, error);
        return null;
      }
    });

    const tracks = (await Promise.all(trackPromises)).filter(
      (track) => track !== null
    );

    return NextResponse.json(
      {
        success: true,
        tracks,
        total: tracks.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar favoritos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
