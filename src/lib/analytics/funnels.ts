/**
 * Funnel Analysis
 * Análise de conversão signup → first trade → active trader
 */

import { prisma } from '@/lib/db/prisma';

export interface FunnelStep {
  name: string;
  count: number;
  percentage: number; // % do total inicial
  conversionRate: number; // % do step anterior
  avgTimeFromPrevious?: number; // dias médios do step anterior
}

export interface FunnelData {
  totalStarted: number;
  steps: FunnelStep[];
  overallConversion: number;
  avgTimeToComplete: number;
}

/**
 * Calcula funil de conversão
 */
export async function calculateFunnel(
  startDate?: Date,
  endDate?: Date
): Promise<FunnelData> {
  const whereDate = startDate && endDate ? {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  } : {};

  // Step 1: Signups
  const totalSignups = await prisma.user.count({
    where: whereDate,
  });

  // Step 2: KYC Complete
  const kycCompleted = await prisma.user.findMany({
    where: {
      ...whereDate,
      kycStatus: 'VERIFIED',
    },
    select: {
      id: true,
      createdAt: true,
      kycVerifiedAt: true,
    },
  });

  // Step 3: First Trade
  const usersWithTrades = await prisma.user.findMany({
    where: {
      ...whereDate,
      transactions: {
        some: {
          status: 'COMPLETED',
        },
      },
    },
    select: {
      id: true,
      createdAt: true,
      transactions: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  // Step 4: Active Traders (5+ trades)
  const activeTraders = await prisma.user.findMany({
    where: {
      ...whereDate,
      transactions: {
        some: {
          status: 'COMPLETED',
        },
      },
    },
    select: {
      id: true,
      createdAt: true,
      _count: {
        select: {
          transactions: {
            where: { status: 'COMPLETED' },
          },
        },
      },
      transactions: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'asc' },
        take: 5,
        select: { createdAt: true },
      },
    },
  });

  const activeCount = activeTraders.filter(
    (u) => u._count.transactions >= 5
  ).length;

  // Step 5: Power Users (20+ trades)
  const powerUsers = activeTraders.filter(
    (u) => u._count.transactions >= 20
  ).length;

  // Calcular tempos médios
  const avgTimeKyc = kycCompleted.reduce((sum, u) => {
    if (!u.kycVerifiedAt) return sum;
    const days = Math.floor(
      (new Date(u.kycVerifiedAt).getTime() - new Date(u.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return sum + days;
  }, 0) / (kycCompleted.length || 1);

  const avgTimeFirstTrade = usersWithTrades.reduce((sum, u) => {
    const firstTx = u.transactions[0];
    if (!firstTx) return sum;
    const days = Math.floor(
      (new Date(firstTx.createdAt).getTime() - new Date(u.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return sum + days;
  }, 0) / (usersWithTrades.length || 1);

  const avgTimeActive = activeTraders
    .filter((u) => u._count.transactions >= 5)
    .reduce((sum, u) => {
      const fifthTx = u.transactions[4];
      if (!fifthTx) return sum;
      const days = Math.floor(
        (new Date(fifthTx.createdAt).getTime() - new Date(u.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return sum + days;
    }, 0) / (activeCount || 1);

  // Montar steps
  const steps: FunnelStep[] = [
    {
      name: 'Signup',
      count: totalSignups,
      percentage: 100,
      conversionRate: 100,
    },
    {
      name: 'KYC Complete',
      count: kycCompleted.length,
      percentage: (kycCompleted.length / totalSignups) * 100,
      conversionRate: (kycCompleted.length / totalSignups) * 100,
      avgTimeFromPrevious: avgTimeKyc,
    },
    {
      name: 'First Trade',
      count: usersWithTrades.length,
      percentage: (usersWithTrades.length / totalSignups) * 100,
      conversionRate: (usersWithTrades.length / kycCompleted.length) * 100,
      avgTimeFromPrevious: avgTimeFirstTrade,
    },
    {
      name: '5+ Trades (Active)',
      count: activeCount,
      percentage: (activeCount / totalSignups) * 100,
      conversionRate: (activeCount / usersWithTrades.length) * 100,
      avgTimeFromPrevious: avgTimeActive,
    },
    {
      name: '20+ Trades (Power User)',
      count: powerUsers,
      percentage: (powerUsers / totalSignups) * 100,
      conversionRate: (powerUsers / activeCount) * 100,
    },
  ];

  return {
    totalStarted: totalSignups,
    steps,
    overallConversion: (powerUsers / totalSignups) * 100,
    avgTimeToComplete: avgTimeKyc + avgTimeFirstTrade + avgTimeActive,
  };
}

/**
 * Identifica onde usuários abandonam mais
 */
export async function getFunnelDropoff(
  startDate?: Date,
  endDate?: Date
): Promise<{ step: string; dropoffRate: number; count: number }[]> {
  const funnel = await calculateFunnel(startDate, endDate);

  const dropoffs = [];
  for (let i = 1; i < funnel.steps.length; i++) {
    const current = funnel.steps[i];
    const previous = funnel.steps[i - 1];
    const dropped = previous.count - current.count;
    const dropoffRate = (dropped / previous.count) * 100;

    dropoffs.push({
      step: `${previous.name} → ${current.name}`,
      dropoffRate,
      count: dropped,
    });
  }

  return dropoffs.sort((a, b) => b.dropoffRate - a.dropoffRate);
}

/**
 * Tempo médio entre steps
 */
export async function getTimeToConversion(): Promise<{
  avgDaysToKyc: number;
  avgDaysToFirstTrade: number;
  avgDaysToActive: number;
  avgDaysToComplete: number;
}> {
  const funnel = await calculateFunnel();

  return {
    avgDaysToKyc: funnel.steps[1].avgTimeFromPrevious || 0,
    avgDaysToFirstTrade: funnel.steps[2].avgTimeFromPrevious || 0,
    avgDaysToActive: funnel.steps[3].avgTimeFromPrevious || 0,
    avgDaysToComplete: funnel.avgTimeToComplete,
  };
}
