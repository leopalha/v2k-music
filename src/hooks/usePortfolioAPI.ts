import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'

interface PortfolioSummary {
  totalValue: number
  thisMonthChange: number
  totalReturnPercent: number
  totalTokens: number
  totalSongs: number
}

interface PortfolioHolding {
  songId: string
  title: string
  artist: string
  coverArt: string
  tokensOwned: number
  ownershipPercent: number
  currentValue: number
  costBasis: number
  profitLoss: number
  profitLossPercent: number
  lastRoyaltyAmount: number
  lastRoyaltyDate: string | null
  pendingRoyalties: number
}

interface PerformancePoint {
  date: string
  value: number
}

interface RecentRoyalty {
  id: string
  date: string | null
  songId: string
  songTitle: string
  amount: number
}

interface PortfolioAPIResponse {
  summary: PortfolioSummary
  performance: PerformancePoint[]
  holdings: PortfolioHolding[]
  recentRoyalties: RecentRoyalty[]
}

export function usePortfolioAPI() {
  const { address, isConnected } = useAccount()

  return useQuery<PortfolioAPIResponse>({
    queryKey: ['portfolio', address],
    queryFn: async () => {
      if (!address) {
        throw new Error('Wallet not connected')
      }

      const response = await fetch(`/api/portfolio?address=${address}`)

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio')
      }

      return response.json()
    },
    enabled: isConnected && !!address,
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 30000 // Refetch every 30 seconds when active
  })
}
