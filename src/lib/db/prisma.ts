import 'server-only';
import { PrismaClient } from '@prisma/client';
import { queryLoggerWithMetrics } from './query-logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Add query logging middleware
prisma.$use(queryLoggerWithMetrics);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
