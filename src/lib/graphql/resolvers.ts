import { GraphQLError } from 'graphql';
import { prisma } from '@/lib/prisma';
import type { User, Track, Transaction, PriceAlert } from '@prisma/client';

interface Context {
  userId?: string;
  user?: User;
}

export const resolvers = {
  Query: {
    // User queries
    me: async (_: unknown, __: unknown, context: Context) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return prisma.user.findUnique({
        where: { id: context.userId },
      });
    },

    user: async (_: unknown, { id }: { id: string }) => {
      return prisma.user.findUnique({
        where: { id },
      });
    },

    // Track queries
    track: async (_: unknown, { id }: { id: string }) => {
      return prisma.track.findUnique({
        where: { id },
      });
    },

    tracks: async (_: unknown, { filter }: { filter?: any }) => {
      const page = filter?.page || 1;
      const limit = Math.min(filter?.limit || 20, 100);
      const skip = (page - 1) * limit;

      const where: any = {};
      
      if (filter?.genre) {
        where.genre = filter.genre;
      }
      
      if (filter?.search) {
        where.OR = [
          { title: { contains: filter.search, mode: 'insensitive' } },
          { artist: { contains: filter.search, mode: 'insensitive' } },
        ];
      }
      
      if (filter?.minPrice !== undefined) {
        where.currentPrice = { ...where.currentPrice, gte: filter.minPrice };
      }
      
      if (filter?.maxPrice !== undefined) {
        where.currentPrice = { ...where.currentPrice, lte: filter.maxPrice };
      }

      const orderBy: any = {};
      const sortBy = filter?.sortBy || 'CREATED_AT';
      const order = filter?.order || 'DESC';

      switch (sortBy) {
        case 'PRICE':
          orderBy.currentPrice = order.toLowerCase();
          break;
        case 'PRICE_CHANGE':
          orderBy.priceChange24h = order.toLowerCase();
          break;
        case 'VOLUME':
          orderBy.volume24h = order.toLowerCase();
          break;
        case 'MARKET_CAP':
          orderBy.marketCap = order.toLowerCase();
          break;
        default:
          orderBy.createdAt = order.toLowerCase();
      }

      const [items, totalItems] = await Promise.all([
        prisma.track.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        prisma.track.count({ where }),
      ]);

      const totalPages = Math.ceil(totalItems / limit);

      return {
        items,
        pageInfo: {
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          page,
          totalPages,
          totalItems,
        },
      };
    },

    trendingTracks: async (_: unknown, { limit = 10 }: { limit?: number }) => {
      return prisma.track.findMany({
        orderBy: { volume24h: 'desc' },
        take: Math.min(limit, 50),
      });
    },

    // Portfolio queries
    portfolio: async (_: unknown, __: unknown, context: Context) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const holdings = await prisma.portfolio.findMany({
        where: { userId: context.userId },
        include: {
          track: true,
        },
      });

      const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
      const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
      const unrealizedPnL = holdings.reduce((sum, h) => sum + h.unrealizedPnL, 0);
      const unclaimedRoyalties = holdings.reduce((sum, h) => sum + h.unclaimedRoyalties, 0);

      return {
        userId: context.userId,
        holdings,
        totalValue,
        totalInvested,
        unrealizedPnL,
        unrealizedPnLPercent: totalInvested > 0 ? (unrealizedPnL / totalInvested) * 100 : 0,
        unclaimedRoyalties,
        holdingsCount: holdings.length,
      };
    },

    userPortfolio: async (_: unknown, { userId }: { userId: string }) => {
      const holdings = await prisma.portfolio.findMany({
        where: { userId },
        include: {
          track: true,
        },
      });

      const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
      const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
      const unrealizedPnL = holdings.reduce((sum, h) => sum + h.unrealizedPnL, 0);
      const unclaimedRoyalties = holdings.reduce((sum, h) => sum + h.unclaimedRoyalties, 0);

      return {
        userId,
        holdings,
        totalValue,
        totalInvested,
        unrealizedPnL,
        unrealizedPnLPercent: totalInvested > 0 ? (unrealizedPnL / totalInvested) * 100 : 0,
        unclaimedRoyalties,
        holdingsCount: holdings.length,
      };
    },

    // Transaction queries
    transactions: async (_: unknown, { filter }: { filter?: any }, context: Context) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const page = filter?.page || 1;
      const limit = Math.min(filter?.limit || 20, 100);
      const skip = (page - 1) * limit;

      const where: any = { userId: context.userId };

      if (filter?.type) {
        where.type = filter.type;
      }

      if (filter?.trackId) {
        where.trackId = filter.trackId;
      }

      if (filter?.startDate || filter?.endDate) {
        where.createdAt = {};
        if (filter.startDate) {
          where.createdAt.gte = new Date(filter.startDate);
        }
        if (filter.endDate) {
          where.createdAt.lte = new Date(filter.endDate);
        }
      }

      const [items, totalItems] = await Promise.all([
        prisma.transaction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            user: true,
            track: true,
          },
        }),
        prisma.transaction.count({ where }),
      ]);

      const totalPages = Math.ceil(totalItems / limit);

      return {
        items,
        pageInfo: {
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          page,
          totalPages,
          totalItems,
        },
      };
    },

    transaction: async (_: unknown, { id }: { id: string }, context: Context) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          userId: context.userId,
        },
        include: {
          user: true,
          track: true,
        },
      });

      if (!transaction) {
        throw new GraphQLError('Transaction not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return transaction;
    },

    // Alert queries
    alerts: async (_: unknown, __: unknown, context: Context) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return prisma.priceAlert.findMany({
        where: { userId: context.userId },
        include: { track: true },
        orderBy: { createdAt: 'desc' },
      });
    },

    alert: async (_: unknown, { id }: { id: string }, context: Context) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const alert = await prisma.priceAlert.findFirst({
        where: {
          id,
          userId: context.userId,
        },
        include: { track: true },
      });

      if (!alert) {
        throw new GraphQLError('Alert not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return alert;
    },

    // Stats
    platformStats: async () => {
      const [totalUsers, totalTracks, totalTransactions, volumeSum, activeUsers] = await Promise.all([
        prisma.user.count(),
        prisma.track.count(),
        prisma.transaction.count({ where: { status: 'COMPLETED' } }),
        prisma.transaction.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.user.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      return {
        totalUsers,
        totalTracks,
        totalTransactions,
        totalVolume: volumeSum._sum.amount || 0,
        activeUsers24h: activeUsers,
      };
    },
  },

  Mutation: {
    // Trading mutations
    createTrade: async (
      _: unknown,
      { input }: { input: { trackId: string; type: 'BUY' | 'SELL'; quantity: number } },
      context: Context
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const track = await prisma.track.findUnique({
        where: { id: input.trackId },
      });

      if (!track) {
        throw new GraphQLError('Track not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Create pending transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId: context.userId,
          trackId: input.trackId,
          type: input.type,
          amount: input.quantity, // "amount" is number of tokens in schema
          price: track.currentPrice,
          totalValue: track.currentPrice * input.quantity,
          fee: 0,
          status: 'PENDING',
        },
        include: {
          user: true,
          track: true,
        },
      });

      return transaction;
    },

    // Alert mutations
    createAlert: async (
      _: unknown,
      { input }: { input: { trackId: string; targetPrice: number; condition: 'ABOVE' | 'BELOW' } },
      context: Context
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const track = await prisma.track.findUnique({
        where: { id: input.trackId },
      });

      if (!track) {
        throw new GraphQLError('Track not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const alert = await prisma.priceAlert.create({
        data: {
          userId: context.userId,
          trackId: input.trackId,
          targetPrice: input.targetPrice,
          condition: input.condition,
          isActive: true,
          triggered: false,
        },
        include: { track: true },
      });

      return alert;
    },

    cancelAlert: async (_: unknown, { id }: { id: string }, context: Context) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const alert = await prisma.priceAlert.findFirst({
        where: {
          id,
          userId: context.userId,
        },
      });

      if (!alert) {
        throw new GraphQLError('Alert not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const updated = await prisma.priceAlert.update({
        where: { id },
        data: { isActive: false },
        include: { track: true },
      });

      return updated;
    },

    // Profile mutations
    updateProfile: async (
      _: unknown,
      { input }: { input: { name?: string; username?: string; bio?: string } },
      context: Context
    ) => {
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const data: any = {};
      if (input.name) data.name = input.name;
      if (input.username) data.username = input.username;
      if (input.bio) data.bio = input.bio;

      return prisma.user.update({
        where: { id: context.userId },
        data,
      });
    },
  },

  // Field resolvers
  User: {
    stats: async (parent: User) => {
      const [transactions, follows] = await Promise.all([
        prisma.transaction.findMany({
          where: {
            userId: parent.id,
            status: 'COMPLETED',
          },
        }),
        prisma.$transaction([
          prisma.follow.count({ where: { followerId: parent.id } }),
          prisma.follow.count({ where: { followingId: parent.id } }),
        ]),
      ]);

      const totalTrades = transactions.length;
      const totalInvested = transactions
        .filter((t) => t.type === 'BUY')
        .reduce((sum, t) => sum + t.amount, 0);

      const buys = transactions.filter((t) => t.type === 'BUY');
      const sells = transactions.filter((t) => t.type === 'SELL');
      const totalProfit = sells.reduce((sum, s) => sum + s.amount, 0) - buys.reduce((sum, b) => sum + b.amount, 0);

      const winRate = sells.length > 0 ? (sells.filter((s) => s.amount > 0).length / sells.length) * 100 : 0;

      return {
        totalTrades,
        totalInvested,
        totalProfit,
        winRate,
        followingCount: follows[0],
        followersCount: follows[1],
      };
    },
  },
};
