/**
 * Analytics Insights
 *
 * Generate actionable insights based on user's portfolio performance and behavior.
 */

import { TrackPerformance } from './calculations';

export interface Insight {
  type: 'opportunity' | 'warning' | 'achievement' | 'tip';
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

/**
 * Generate insights based on portfolio data
 */
export function generateInsights(params: {
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  roi: number;
  tracksOwned: number;
  totalRoyalties: number;
  trackPerformances: TrackPerformance[];
  avgPlatformROI?: number;
}): Insight[] {
  const insights: Insight[] = [];

  // Achievement: First profit
  if (params.profitLoss > 0 && params.profitLoss < 100) {
    insights.push({
      type: 'achievement',
      title: 'Primeiro Lucro! 🎉',
      description: `Você está em lucro de ${formatCurrency(params.profitLoss)}! Continue investindo com sabedoria.`,
    });
  }

  // Achievement: High ROI
  if (params.roi >= 20) {
    insights.push({
      type: 'achievement',
      title: 'ROI Excelente! 🚀',
      description: `Seu ROI de ${params.roi.toFixed(1)}% está acima da média da plataforma. Ótimo trabalho!`,
    });
  }

  // Warning: Negative performance
  if (params.profitLoss < 0 && params.totalInvested > 100) {
    insights.push({
      type: 'warning',
      title: 'Portfolio em Queda',
      description: `Você está com prejuízo de ${formatCurrency(Math.abs(params.profitLoss))}. Considere revisar sua estratégia de investimento.`,
      action: {
        label: 'Ver Top Tracks',
        href: '/marketplace',
      },
    });
  }

  // Opportunity: Low diversity
  if (params.tracksOwned > 0 && params.tracksOwned < 3) {
    insights.push({
      type: 'opportunity',
      title: 'Diversifique seu Portfolio',
      description: `Você possui apenas ${params.tracksOwned} música${params.tracksOwned === 1 ? '' : 's'}. Diversificar reduz riscos e aumenta oportunidades.`,
      action: {
        label: 'Explorar Músicas',
        href: '/marketplace',
      },
    });
  }

  // Opportunity: High diversity
  if (params.tracksOwned >= 10) {
    insights.push({
      type: 'achievement',
      title: 'Portfolio Diversificado! 📊',
      description: `Você possui ${params.tracksOwned} músicas diferentes. Excelente diversificação!`,
    });
  }

  // Tip: Royalties opportunity
  if (params.totalRoyalties > 0) {
    insights.push({
      type: 'tip',
      title: 'Royalties Acumulados',
      description: `Você já ganhou ${formatCurrency(params.totalRoyalties)} em royalties. A renda passiva está funcionando!`,
    });
  }

  // Opportunity: No royalties yet
  if (params.totalInvested > 0 && params.totalRoyalties === 0) {
    insights.push({
      type: 'tip',
      title: 'Maximize Royalties',
      description: 'Invista em tracks com alto volume de streams para receber royalties mensais.',
      action: {
        label: 'Ver Tracks Populares',
        href: '/marketplace?sort=streams',
      },
    });
  }

  // Opportunity: Underperforming tracks
  const underperformingTracks = params.trackPerformances.filter(
    t => t.performance === 'poor'
  );

  if (underperformingTracks.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Tracks com Baixa Performance',
      description: `${underperformingTracks.length} track${underperformingTracks.length === 1 ? '' : 's'} está${underperformingTracks.length === 1 ? '' : 'ão'} com ROI negativo. Considere rebalancear seu portfolio.`,
    });
  }

  // Achievement: All tracks profitable
  const allProfitable = params.trackPerformances.length > 0 &&
    params.trackPerformances.every(t => t.roi > 0);

  if (allProfitable && params.trackPerformances.length >= 3) {
    insights.push({
      type: 'achievement',
      title: '100% de Acertos! 🎯',
      description: 'Todas as suas músicas estão gerando lucro. Você é um investidor expert!',
    });
  }

  // Tip: Compare with platform average
  if (params.avgPlatformROI && params.roi > params.avgPlatformROI) {
    insights.push({
      type: 'achievement',
      title: 'Acima da Média!',
      description: `Seu ROI está ${(params.roi - params.avgPlatformROI).toFixed(1)}% acima da média da plataforma.`,
    });
  }

  // Opportunity: Small portfolio
  if (params.totalInvested < 100 && params.totalInvested > 0) {
    insights.push({
      type: 'opportunity',
      title: 'Aumente seu Investimento',
      description: 'Investimentos maiores têm potencial de retornos maiores. Considere aumentar seu portfolio.',
      action: {
        label: 'Adicionar Fundos',
        href: '/wallet',
      },
    });
  }

  // Tip: Best performing track
  if (params.trackPerformances.length > 0) {
    const best = params.trackPerformances.reduce((prev, current) =>
      current.roi > prev.roi ? current : prev
    );

    if (best.roi > 15) {
      insights.push({
        type: 'tip',
        title: 'Track Destaque',
        description: `Sua melhor música está com ROI de ${best.roi.toFixed(1)}%. Considere investir mais em tracks similares.`,
      });
    }
  }

  // Limit to 5 most relevant insights
  return insights.slice(0, 5);
}

/**
 * Format currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Generate investment recommendations based on user behavior
 */
export function generateRecommendations(params: {
  totalInvested: number;
  tracksOwned: number;
  avgROI: number;
  preferences?: string[];
}): string[] {
  const recommendations: string[] = [];

  // Beginner recommendations
  if (params.totalInvested < 500) {
    recommendations.push('Comece com investimentos pequenos para aprender o mercado');
    recommendations.push('Diversifique entre 3-5 tracks diferentes');
  }

  // Intermediate recommendations
  if (params.totalInvested >= 500 && params.totalInvested < 5000) {
    recommendations.push('Considere investir em tracks de diferentes gêneros');
    recommendations.push('Monitore o volume de streams das suas músicas');
    recommendations.push('Reinvista seus royalties para crescimento composto');
  }

  // Advanced recommendations
  if (params.totalInvested >= 5000) {
    recommendations.push('Balance entre tracks estabelecidas e novos lançamentos');
    recommendations.push('Analise o histórico de royalties antes de investir');
    recommendations.push('Mantenha 10-20% do portfolio em tracks de alto risco/recompensa');
  }

  // Performance-based
  if (params.avgROI < 5) {
    recommendations.push('Revise sua estratégia de seleção de tracks');
    recommendations.push('Estude os padrões das tracks mais lucrativas');
  }

  if (params.avgROI > 15) {
    recommendations.push('Mantenha sua estratégia atual, está funcionando!');
    recommendations.push('Considere aumentar gradualmente seus investimentos');
  }

  return recommendations;
}
