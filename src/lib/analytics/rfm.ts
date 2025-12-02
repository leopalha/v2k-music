/**
 * RFM Analysis (Recency, Frequency, Monetary)
 * Segmentação de usuários por comportamento
 */

import { prisma } from '@/lib/db/prisma';

export interface RFMScore {
  userId: string;
  recency: number; // 1-5 (5 = mais recente)
  frequency: number; // 1-5 (5 = mais frequente)
  monetary: number; // 1-5 (5 = maior volume)
  totalScore: number; // soma
  segment: RFMSegment;
}

export type RFMSegment =
  | 'Champions' // 13-15
  | 'Loyal' // 10-12
  | 'Potential' // 7-9
  | 'At Risk' // 4-6
  | 'Dormant'; // 3

export interface RFMDistribution {
  segment: RFMSegment;
  count: number;
  percentage: number;
  totalRevenue: number;
  avgRevenue: number;
}

/**
 * Calcula scores RFM para todos os usuários
 */
export async function calculateRFMScores(): Promise<RFMScore[]> {
  const now = new Date();
  
  // Buscar todos os usuários com pelo menos 1 transação
  const users = await prisma.user.findMany({
    where: {
      transactions: {
        some: {
          status: 'COMPLETED',
        },
      },
    },
    include: {
      transactions: {
        where: { status: 'COMPLETED' },
        select: {
          createdAt: true,
          amount: true,
          type: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Calcular scores para cada usuário
  const scores: RFMScore[] = users.map((user) => {
    const transactions = user.transactions;
    
    // Recency: dias desde última transação
    const lastTx = transactions[0];
    const daysSinceLastTx = Math.floor(
      (now.getTime() - new Date(lastTx.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const recency = calculateRecencyScore(daysSinceLastTx);
    
    // Frequency: número de transações
    const frequency = calculateFrequencyScore(transactions.length);
    
    // Monetary: volume total investido
    const totalAmount = transactions
      .filter((t) => t.type === 'BUY')
      .reduce((sum, t) => sum + t.amount, 0);
    const monetary = calculateMonetaryScore(totalAmount);
    
    const totalScore = recency + frequency + monetary;
    const segment = getSegment(totalScore);
    
    return {
      userId: user.id,
      recency,
      frequency,
      monetary,
      totalScore,
      segment,
    };
  });

  return scores;
}

/**
 * Score de recência (1-5)
 */
function calculateRecencyScore(days: number): number {
  if (days <= 7) return 5; // última semana
  if (days <= 30) return 4; // último mês
  if (days <= 90) return 3; // últimos 3 meses
  if (days <= 180) return 2; // últimos 6 meses
  return 1; // mais de 6 meses
}

/**
 * Score de frequência (1-5)
 */
function calculateFrequencyScore(count: number): number {
  if (count >= 50) return 5;
  if (count >= 20) return 4;
  if (count >= 10) return 3;
  if (count >= 5) return 2;
  return 1;
}

/**
 * Score monetário (1-5)
 */
function calculateMonetaryScore(amount: number): number {
  const amountInReais = amount / 100;
  if (amountInReais >= 10000) return 5;
  if (amountInReais >= 5000) return 4;
  if (amountInReais >= 1000) return 3;
  if (amountInReais >= 500) return 2;
  return 1;
}

/**
 * Determina segmento baseado no score total
 */
function getSegment(totalScore: number): RFMSegment {
  if (totalScore >= 13) return 'Champions';
  if (totalScore >= 10) return 'Loyal';
  if (totalScore >= 7) return 'Potential';
  if (totalScore >= 4) return 'At Risk';
  return 'Dormant';
}

/**
 * Agrupa usuários por segmento
 */
export async function segmentUsers(): Promise<RFMScore[]> {
  return calculateRFMScores();
}

/**
 * Distribuição por segmento
 */
export async function getRFMDistribution(): Promise<RFMDistribution[]> {
  const scores = await calculateRFMScores();
  const total = scores.length;

  const segments: Record<RFMSegment, RFMScore[]> = {
    Champions: [],
    Loyal: [],
    Potential: [],
    'At Risk': [],
    Dormant: [],
  };

  scores.forEach((score) => {
    segments[score.segment].push(score);
  });

  // Buscar revenue por segmento
  const distribution: RFMDistribution[] = await Promise.all(
    Object.entries(segments).map(async ([segment, users]) => {
      const userIds = users.map((u) => u.userId);
      
      const revenue = await prisma.transaction.aggregate({
        where: {
          userId: { in: userIds },
          type: 'BUY',
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      });

      return {
        segment: segment as RFMSegment,
        count: users.length,
        percentage: (users.length / total) * 100,
        totalRevenue: revenue._sum.amount || 0,
        avgRevenue: users.length > 0 ? (revenue._sum.amount || 0) / users.length : 0,
      };
    })
  );

  return distribution.sort((a, b) => b.count - a.count);
}

/**
 * Segmentos recomendados para ações
 */
export function getSegmentRecommendations(segment: RFMSegment): {
  actions: string[];
  description: string;
} {
  switch (segment) {
    case 'Champions':
      return {
        description: 'Seus melhores clientes - alta recência, frequência e valor',
        actions: [
          'Oferecer programa VIP',
          'Early access a novas tracks',
          'Recompensas por referrals',
          'Pedir feedback e reviews',
        ],
      };
    case 'Loyal':
      return {
        description: 'Clientes fiéis - engajam regularmente',
        actions: [
          'Upsell para premium features',
          'Cross-sell tracks similares',
          'Envolver em beta testing',
          'Programa de pontos',
        ],
      };
    case 'Potential':
      return {
        description: 'Potencial de crescimento - precisam de incentivo',
        actions: [
          'Educação sobre plataforma',
          'Primeiro investimento gratuito',
          'Newsletter com dicas',
          'Promoções personalizadas',
        ],
      };
    case 'At Risk':
      return {
        description: 'Em risco de churn - engajamento declinando',
        actions: [
          'Win-back campaign',
          'Pesquisa de satisfação',
          'Desconto especial',
          'Re-engagement emails',
        ],
      };
    case 'Dormant':
      return {
        description: 'Inativos - última atividade há muito tempo',
        actions: [
          'Campanha de reativação',
          'Oferta irresistível',
          'Lembrete de portfolio',
          'Novos recursos',
        ],
      };
  }
}
