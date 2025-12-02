import { NextResponse } from 'next/server';
import { createPublicClient, http, formatEther } from 'viem';
import { hardhat } from 'viem/chains';
import { MUSIC_TOKEN_ABI } from '@/contracts/abis';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MUSIC_TOKEN_ADDRESS as `0x${string}`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim() || '';
    const genre = searchParams.get('genre')?.trim();
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, price_asc, price_desc, popular

    if (!query && !genre) {
      return NextResponse.json(
        { error: 'Parâmetro de busca ou filtro obrigatório' },
        { status: 400 }
      );
    }

    // Connect to blockchain
    const publicClient = createPublicClient({
      chain: hardhat,
      transport: http('http://127.0.0.1:8545'),
    });

    // Get total number of tracks
    const trackCount = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: MUSIC_TOKEN_ABI,
      functionName: 'getTrackCount',
    }) as bigint;

    const totalTracks = Number(trackCount);

    if (totalTracks === 0) {
      return NextResponse.json({
        success: true,
        tracks: [],
        total: 0,
      });
    }

    // Fetch all tracks and filter
    const trackPromises = Array.from({ length: totalTracks }, (_, i) => {
      const trackId = BigInt(i);

      return Promise.all([
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
      ]).then(([title, artistName, trackGenre, price, totalSupply, availableSupply]) => {
        const priceInMatic = parseFloat(formatEther(price));

        return {
          id: i.toString(),
          title,
          artistName,
          genre: trackGenre,
          currentPrice: priceInMatic,
          totalSupply: Number(totalSupply),
          availableSupply: Number(availableSupply),
          coverUrl: '', // Will be set from IPFS in production
        };
      }).catch((error) => {
        console.error(`Error fetching track ${i}:`, error);
        return null;
      });
    });

    const allTracks = (await Promise.all(trackPromises)).filter(track => track !== null);

    // Apply filters
    let filteredTracks = allTracks.filter((track) => {
      // Text search filter
      if (query) {
        const matchesSearch =
          track.title.toLowerCase().includes(query) ||
          track.artistName.toLowerCase().includes(query) ||
          track.genre.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // Genre filter
      if (genre && track.genre.toLowerCase() !== genre.toLowerCase()) {
        return false;
      }

      // Price range filter
      if (minPrice !== null && track.currentPrice < parseFloat(minPrice)) {
        return false;
      }

      if (maxPrice !== null && track.currentPrice > parseFloat(maxPrice)) {
        return false;
      }

      return true;
    });

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        filteredTracks.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'price_desc':
        filteredTracks.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'popular':
        // Sort by sold tokens (totalSupply - availableSupply)
        filteredTracks.sort((a, b) => {
          const aSold = a.totalSupply - a.availableSupply;
          const bSold = b.totalSupply - b.availableSupply;
          return bSold - aSold;
        });
        break;
      case 'newest':
      default:
        // Already in order (newest first)
        filteredTracks.reverse();
        break;
    }

    return NextResponse.json({
      success: true,
      tracks: filteredTracks,
      total: filteredTracks.length,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar tracks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
