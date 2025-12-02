/**
 * Analytics Calculations
 *
 * Utility functions for calculating investment metrics, ROI, P&L, and performance indicators.
 */

export interface PortfolioMetrics {
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  roi: number;
}

export interface TrackPerformance {
  trackId: string;
  invested: number;
  currentValue: number;
  profitLoss: number;
  roi: number;
  royaltiesEarned: number;
  performance: 'excellent' | 'good' | 'neutral' | 'poor';
}

/**
 * Calculate portfolio-wide metrics
 */
export function calculatePortfolioMetrics(
  totalInvested: number,
  currentValue: number
): PortfolioMetrics {
  const profitLoss = currentValue - totalInvested;
  const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
  const roi = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    profitLoss,
    profitLossPercent,
    roi,
  };
}

/**
 * Calculate ROI for a single investment
 */
export function calculateROI(invested: number, currentValue: number): number {
  if (invested === 0) return 0;
  return ((currentValue - invested) / invested) * 100;
}

/**
 * Calculate profit/loss
 */
export function calculateProfitLoss(invested: number, currentValue: number): number {
  return currentValue - invested;
}

/**
 * Calculate profit/loss percentage
 */
export function calculateProfitLossPercent(invested: number, currentValue: number): number {
  if (invested === 0) return 0;
  return ((currentValue - invested) / invested) * 100;
}

/**
 * Determine performance rating based on ROI
 */
export function getPerformanceRating(roi: number): 'excellent' | 'good' | 'neutral' | 'poor' {
  if (roi >= 20) return 'excellent';
  if (roi >= 10) return 'good';
  if (roi >= 0) return 'neutral';
  return 'poor';
}

/**
 * Calculate track performance metrics
 */
export function calculateTrackPerformance(
  trackId: string,
  invested: number,
  currentValue: number,
  royaltiesEarned: number
): TrackPerformance {
  const profitLoss = calculateProfitLoss(invested, currentValue);
  const roi = calculateROI(invested, currentValue);
  const performance = getPerformanceRating(roi);

  return {
    trackId,
    invested,
    currentValue,
    profitLoss,
    roi,
    royaltiesEarned,
    performance,
  };
}

/**
 * Calculate average ROI across multiple investments
 */
export function calculateAverageROI(investments: { invested: number; currentValue: number }[]): number {
  if (investments.length === 0) return 0;

  const totalROI = investments.reduce((sum, inv) => {
    return sum + calculateROI(inv.invested, inv.currentValue);
  }, 0);

  return totalROI / investments.length;
}

/**
 * Calculate portfolio diversity score (0-100)
 * Based on number of different tracks and distribution
 */
export function calculateDiversityScore(holdings: { amount: number; currentValue: number }[]): number {
  if (holdings.length === 0) return 0;
  if (holdings.length === 1) return 20; // Single investment = low diversity

  // Calculate Herfindahl index (concentration)
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  if (totalValue === 0) return 0;

  const herfindahl = holdings.reduce((sum, h) => {
    const share = h.currentValue / totalValue;
    return sum + (share * share);
  }, 0);

  // Convert to diversity score (inverse of concentration)
  // Herfindahl ranges from 1/n (perfect diversity) to 1 (total concentration)
  // We map this to 0-100 scale
  const maxDiversity = 1 / holdings.length; // Perfect diversity
  const diversityRatio = (1 - herfindahl) / (1 - maxDiversity);

  return Math.min(100, Math.max(0, diversityRatio * 100));
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Generate performance history data points
 * Useful for charts when actual historical data is not available
 */
export function generatePerformanceHistory(
  currentValue: number,
  days: number,
  volatility: number = 0.05
): { date: string; value: number }[] {
  const history: { date: string; value: number }[] = [];
  let value = currentValue * 0.7; // Start at 70% of current value

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));

    // Random walk with drift towards current value
    const drift = (currentValue - value) * 0.05;
    const randomChange = (Math.random() - 0.5) * currentValue * volatility;
    value = Math.max(0, value + drift + randomChange);

    history.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
    });
  }

  // Ensure last value matches current value
  history[history.length - 1].value = currentValue;

  return history;
}

/**
 * Calculate win rate (percentage of profitable investments)
 */
export function calculateWinRate(investments: { profitLoss: number }[]): number {
  if (investments.length === 0) return 0;

  const profitable = investments.filter(inv => inv.profitLoss > 0).length;
  return (profitable / investments.length) * 100;
}

/**
 * Find best and worst performing investments
 */
export function findBestWorst(
  investments: TrackPerformance[]
): { best: TrackPerformance | null; worst: TrackPerformance | null } {
  if (investments.length === 0) {
    return { best: null, worst: null };
  }

  const sorted = [...investments].sort((a, b) => b.roi - a.roi);

  return {
    best: sorted[0],
    worst: sorted[sorted.length - 1],
  };
}
