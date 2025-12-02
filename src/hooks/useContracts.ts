"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { MusicTokenABI, MarketplaceABI, RoyaltyDistributorABI, getContractAddresses } from "@/lib/web3";

// ============================================
// MusicToken Hooks
// ============================================

export function useTrackInfo(trackId: number) {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  return useReadContract({
    address: addresses.musicToken,
    abi: MusicTokenABI,
    functionName: "getTrackInfo",
    args: [BigInt(trackId)],
  });
}

export function useAvailableTokens(trackId: number) {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  return useReadContract({
    address: addresses.musicToken,
    abi: MusicTokenABI,
    functionName: "getAvailableTokens",
    args: [BigInt(trackId)],
  });
}

export function useTotalTracks() {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  return useReadContract({
    address: addresses.musicToken,
    abi: MusicTokenABI,
    functionName: "getTotalTracks",
  });
}

export function useTokenBalance(trackId: number) {
  const chainId = useChainId();
  const { address } = useAccount();
  const addresses = getContractAddresses(chainId);

  return useReadContract({
    address: addresses.musicToken,
    abi: MusicTokenABI,
    functionName: "balanceOf",
    args: address ? [address, BigInt(trackId)] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function usePurchaseTokens() {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const purchase = (trackId: number, amount: number, pricePerToken: bigint) => {
    const totalCost = pricePerToken * BigInt(amount);

    writeContract({
      address: addresses.musicToken,
      abi: MusicTokenABI,
      functionName: "purchaseTokens",
      args: [BigInt(trackId), BigInt(amount)],
      value: totalCost,
    });
  };

  return {
    purchase,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============================================
// Marketplace Hooks
// ============================================

export function useListing(listingId: number) {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  return useReadContract({
    address: addresses.marketplace,
    abi: MarketplaceABI,
    functionName: "listings",
    args: [BigInt(listingId)],
  });
}

export function useFloorPrice(trackId: number) {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  return useReadContract({
    address: addresses.marketplace,
    abi: MarketplaceABI,
    functionName: "getFloorPrice",
    args: [BigInt(trackId)],
  });
}

export function useMarketStats() {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);

  const { data: volume } = useReadContract({
    address: addresses.marketplace,
    abi: MarketplaceABI,
    functionName: "totalVolume",
  });

  const { data: trades } = useReadContract({
    address: addresses.marketplace,
    abi: MarketplaceABI,
    functionName: "totalTrades",
  });

  return {
    totalVolume: volume ? formatEther(volume) : "0",
    totalTrades: trades ? Number(trades) : 0,
  };
}

export function useCreateListing() {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createListing = (trackId: number, amount: number, pricePerToken: string) => {
    writeContract({
      address: addresses.marketplace,
      abi: MarketplaceABI,
      functionName: "createListing",
      args: [BigInt(trackId), BigInt(amount), parseEther(pricePerToken)],
    });
  };

  return {
    createListing,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useBuyFromListing() {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const buyTokens = (listingId: number, amount: number, pricePerToken: bigint) => {
    const totalCost = pricePerToken * BigInt(amount);

    writeContract({
      address: addresses.marketplace,
      abi: MarketplaceABI,
      functionName: "buyTokens",
      args: [BigInt(listingId), BigInt(amount)],
      value: totalCost,
    });
  };

  return {
    buyTokens,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useCancelListing() {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const cancelListing = (listingId: number) => {
    writeContract({
      address: addresses.marketplace,
      abi: MarketplaceABI,
      functionName: "cancelListing",
      args: [BigInt(listingId)],
    });
  };

  return {
    cancelListing,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============================================
// RoyaltyDistributor Hooks
// ============================================

export function useClaimableAmount(distributionId: number) {
  const chainId = useChainId();
  const { address } = useAccount();
  const addresses = getContractAddresses(chainId);

  return useReadContract({
    address: addresses.royaltyDistributor,
    abi: RoyaltyDistributorABI,
    functionName: "getClaimableAmount",
    args: address ? [BigInt(distributionId), address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useHasClaimed(distributionId: number) {
  const chainId = useChainId();
  const { address } = useAccount();
  const addresses = getContractAddresses(chainId);

  return useReadContract({
    address: addresses.royaltyDistributor,
    abi: RoyaltyDistributorABI,
    functionName: "hasClaimed",
    args: address ? [BigInt(distributionId), address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useClaimRoyalties() {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimSingle = (distributionId: number) => {
    writeContract({
      address: addresses.royaltyDistributor,
      abi: RoyaltyDistributorABI,
      functionName: "claimDistribution",
      args: [BigInt(distributionId)],
    });
  };

  const claimMultiple = (distributionIds: number[]) => {
    writeContract({
      address: addresses.royaltyDistributor,
      abi: RoyaltyDistributorABI,
      functionName: "claimMultipleDistributions",
      args: [distributionIds.map(BigInt)],
    });
  };

  return {
    claimSingle,
    claimMultiple,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============================================
// Approval Hook
// ============================================

export function useApproveMarketplace() {
  const chainId = useChainId();
  const addresses = getContractAddresses(chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = () => {
    writeContract({
      address: addresses.musicToken,
      abi: MusicTokenABI,
      functionName: "setApprovalForAll",
      args: [addresses.marketplace, true],
    });
  };

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
