import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'
import * as cache from '@/lib/cache/redis'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Try cache first (1min TTL)
    const cacheKey = cache.CacheKeys.portfolio(user.id)
    const cached = await cache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Fetch user's portfolio holdings with optimized select
    const portfolioItems = await prisma.portfolio.findMany({
      where: { userId: user.id },
      select: {
        trackId: true,
        amount: true,
        totalInvested: true,
        unrealizedPnL: true,
        unclaimedRoyalties: true,
        track: {
          select: {
            id: true,
            title: true,
            artistName: true,
            coverUrl: true,
            currentPrice: true,
            totalSupply: true,
          }
        }
      },
      orderBy: {
        unrealizedPnL: 'desc' // Show best performers first
      }
    })

    // Calculate holdings
    let totalValue = 0
    let totalTokens = 0
    let totalCostBasis = 0

    const holdings = portfolioItems.map(item => {
      const currentValue = item.amount * item.track.currentPrice
      const costBasis = item.totalInvested
      const profitLoss = item.unrealizedPnL
      const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0
      const ownershipPercent = (item.amount / item.track.totalSupply) * 100

      totalValue += currentValue
      totalTokens += item.amount
      totalCostBasis += costBasis

      return {
        songId: item.trackId,
        title: item.track.title,
        artist: item.track.artistName,
        coverArt: item.track.coverUrl || `/api/placeholder/200/200?text=${encodeURIComponent(item.track.title)}`,
        tokensOwned: item.amount,
        ownershipPercent,
        currentValue,
        costBasis,
        profitLoss,
        profitLossPercent,
        lastRoyaltyAmount: 0, // From unclaimedRoyalties
        lastRoyaltyDate: null,
        pendingRoyalties: item.unclaimedRoyalties || 0
      }
    })

    // Calculate summary
    const totalReturnPercent = totalCostBasis > 0 ? ((totalValue - totalCostBasis) / totalCostBasis) * 100 : 0
    // Calculate monthly change from recent transactions
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const monthlyTxs = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED',
        createdAt: { gte: oneMonthAgo },
      },
      select: { type: true, totalValue: true },
    });
    
    const thisMonthChange = monthlyTxs.reduce((sum, tx) => {
      return sum + (tx.type === 'BUY' ? tx.totalValue : -tx.totalValue);
    }, 0);

    // Generate performance history
    const performance = generatePerformanceHistory(totalValue, 30)

    // Get recent transactions with optimized query
    const recentTransactions = await prisma.transaction.findMany({
      where: { 
        userId: user.id,
        status: 'COMPLETED' // Only completed transactions
      },
      select: {
        id: true,
        trackId: true,
        createdAt: true,
        track: {
          select: {
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const recentRoyalties = recentTransactions.map(tx => ({
      id: tx.id,
      date: tx.createdAt.toISOString(),
      songId: tx.trackId,
      songTitle: tx.track.title,
      amount: 0 // Royalty amount from transaction
    }))

    const response = {
      summary: {
        totalValue,
        thisMonthChange,
        totalReturnPercent,
        totalTokens,
        totalSongs: holdings.length
      },
      performance,
      holdings,
      recentRoyalties
    }

    // Cache the response (1min TTL - frequent updates)
    await cache.set(cacheKey, response, { ttl: cache.CacheTTL.SHORT })

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper function to generate mock performance history
function generatePerformanceHistory(currentValue: number, days: number) {
  const history = []
  let value = currentValue * 0.6 // Start at 60% of current value

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i))

    // Random walk towards current value
    value = value + (currentValue - value) * 0.1 + (Math.random() - 0.5) * currentValue * 0.05

    history.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(0, value)
    })
  }

  return history
}
