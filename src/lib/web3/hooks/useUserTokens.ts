import { useAccount, useReadContract, useChainId } from "wagmi";
import { MusicTokenABI, RoyaltyDistributorABI } from "@/lib/web3/abis";
import { getContractAddresses } from "@/lib/web3/config";

/**
 * Hook to read user's token balance for a specific track
 */
export function useUserTokenBalance(trackId: number) {
  const { address } = useAccount();
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  const { data: balance, isLoading, error, refetch } = useReadContract({
    address: addresses.musicToken as `0x${string}`,
    abi: MusicTokenABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`, BigInt(trackId)],
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: balance ? Number(balance) : 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to read track information from the contract
 */
export function useTrackInfo(trackId: number) {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  const { data: trackInfo, isLoading, error, refetch } = useReadContract({
    address: addresses.musicToken as `0x${string}`,
    abi: MusicTokenABI,
    functionName: "getTrackInfo",
    args: [BigInt(trackId)],
  });

  return {
    trackInfo: trackInfo as any,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to read available tokens for a track
 */
export function useAvailableTokens(trackId: number) {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  const { data: available, isLoading, error, refetch } = useReadContract({
    address: addresses.musicToken as `0x${string}`,
    abi: MusicTokenABI,
    functionName: "getAvailableTokens",
    args: [BigInt(trackId)],
  });

  return {
    available: available ? Number(available) : 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get total number of tracks created
 */
export function useTotalTracks() {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  const { data: totalTracks, isLoading, error, refetch } = useReadContract({
    address: addresses.musicToken as `0x${string}`,
    abi: MusicTokenABI,
    functionName: "getTotalTracks",
  });

  return {
    totalTracks: totalTracks ? Number(totalTracks) : 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get all user's token holdings across all tracks
 *
 * ⚠️ MVP PLACEHOLDER - Currently hardcoded to track ID 1
 * TODO: Implement proper multi-track fetching strategy:
 * - Option 1: Use multicall to batch read all balances (gas efficient)
 * - Option 2: Use backend API (/api/portfolio) for better UX (recommended)
 * - Option 3: Query subgraph/indexer for user holdings
 */
export function useUserPortfolio() {
  const { address } = useAccount();
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);
  const { totalTracks } = useTotalTracks();

  // TEMPORARY: Only checking track ID 1 for MVP
  // This should loop through all tracks or use an API
  const { data: balance1 } = useReadContract({
    address: addresses.musicToken as `0x${string}`,
    abi: MusicTokenABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`, BigInt(1)],
    query: {
      enabled: !!address && totalTracks > 0,
    },
  });

  const { data: trackInfo1 } = useReadContract({
    address: addresses.musicToken as `0x${string}`,
    abi: MusicTokenABI,
    functionName: "getTrackInfo",
    args: [BigInt(1)],
    query: {
      enabled: totalTracks > 0,
    },
  });

  // Build holdings array
  const holdings = [];

  if (balance1 && Number(balance1) > 0 && trackInfo1) {
    const info = trackInfo1 as any;
    holdings.push({
      trackId: 1, // HARDCODED - needs fix
      title: info.title,
      artist: info.artist,
      tokensOwned: Number(balance1),
      totalSupply: Number(info.totalSupply),
      pricePerToken: Number(info.pricePerToken) / 1e18, // Convert from wei to ETH
      isActive: info.isActive,
    });
  }

  return {
    holdings,
    totalTracks,
    isLoading: false,
  };
}

/**
 * Hook to get user's claimable royalty distributions
 *
 * ⚠️ MVP PLACEHOLDER - Currently hardcoded to distribution ID 2
 * TODO: Implement proper distribution querying:
 * - Option 1: Smart contract should emit events for distributions, query with subgraph
 * - Option 2: Backend API to fetch all user distributions (/api/royalties)
 * - Option 3: Contract method to get all distribution IDs for a user
 */
export function useUserClaimableDistributions() {
  const { address } = useAccount();
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  // TEMPORARY: Only checking distribution ID 2 for MVP demo
  const { data: claimableAmount } = useReadContract({
    address: addresses.royaltyDistributor as `0x${string}`,
    abi: RoyaltyDistributorABI,
    functionName: "getClaimableAmount",
    args: [BigInt(2), address as `0x${string}`], // HARDCODED - needs fix
    query: {
      enabled: !!address,
    },
  });

  const { data: hasClaimed } = useReadContract({
    address: addresses.royaltyDistributor as `0x${string}`,
    abi: RoyaltyDistributorABI,
    functionName: "hasClaimed",
    args: [BigInt(2), address as `0x${string}`], // HARDCODED - needs fix
    query: {
      enabled: !!address,
    },
  });

  const distributions = [];

  // If user hasn't claimed yet and has claimable amount
  if (claimableAmount && Number(claimableAmount) > 0 && !hasClaimed) {
    distributions.push({
      id: 2, // HARDCODED - needs fix
      trackTitle: "Modo Turbo", // HARDCODED - should fetch from track info
      amount: Number(claimableAmount) / 1e18, // Convert from wei to ETH
      source: "Spotify", // HARDCODED - should come from distribution metadata
      date: new Date(), // HARDCODED - should come from distribution timestamp
    });
  }

  return {
    distributions,
    isLoading: false,
  };
}
