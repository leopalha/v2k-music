/**
 * Tax Calculations Library
 * Handles Brazilian tax calculations for investment gains/losses
 */

export interface TaxTransaction {
  id: string;
  date: Date;
  type: 'BUY' | 'SELL';
  trackId: string;
  trackTitle: string;
  amount: number;
  price: number;
  totalValue: number;
  fee: number;
  costBasis?: number;
  gainLoss?: number;
}

export interface TaxSummary {
  period: {
    start: Date;
    end: Date;
  };
  totalBuys: number;
  totalSells: number;
  totalInvested: number;
  totalReceived: number;
  realizedGains: number;
  realizedLosses: number;
  netGainLoss: number;
  estimatedTax: number;
  taxRate: number;
  transactions: TaxTransaction[];
  byTrack: Record<string, {
    trackTitle: string;
    totalBuys: number;
    totalSells: number;
    gainLoss: number;
  }>;
}

/**
 * Calculate Brazilian IR tax rate for investment gains
 * Alíquotas do Imposto de Renda sobre ganhos de capital:
 * - Até R$ 5 milhões: 15%
 * - De R$ 5 milhões a R$ 10 milhões: 17.5%
 * - De R$ 10 milhões a R$ 30 milhões: 20%
 * - Acima de R$ 30 milhões: 22.5%
 */
export function calculateTaxRate(gainAmount: number): number {
  if (gainAmount <= 0) return 0;
  
  if (gainAmount <= 5_000_000) return 0.15; // 15%
  if (gainAmount <= 10_000_000) return 0.175; // 17.5%
  if (gainAmount <= 30_000_000) return 0.20; // 20%
  return 0.225; // 22.5%
}

/**
 * Calculate estimated tax on net gains
 */
export function calculateEstimatedTax(netGainLoss: number): number {
  if (netGainLoss <= 0) return 0;
  
  const taxRate = calculateTaxRate(netGainLoss);
  return netGainLoss * taxRate;
}

/**
 * Calculate gain/loss for a sell transaction using FIFO method
 * FIFO (First In, First Out) é o método aceito pela Receita Federal
 */
export function calculateGainLoss(
  sellPrice: number,
  sellAmount: number,
  costBasis: number
): number {
  const saleProceeds = sellPrice * sellAmount;
  const totalCost = costBasis * sellAmount;
  return saleProceeds - totalCost;
}

/**
 * Process transactions and calculate tax summary
 */
export function calculateTaxSummary(
  transactions: Array<{
    id: string;
    createdAt: Date;
    type: 'BUY' | 'SELL';
    trackId: string;
    track: { title: string };
    amount: number;
    price: number;
    totalValue: number;
    fee: number;
  }>,
  startDate: Date,
  endDate: Date
): TaxSummary {
  // Track cost basis for each track (FIFO)
  const costBasisByTrack = new Map<string, Array<{ amount: number; price: number }>>();
  
  const taxTransactions: TaxTransaction[] = [];
  let totalBuys = 0;
  let totalSells = 0;
  let totalInvested = 0;
  let totalReceived = 0;
  let realizedGains = 0;
  let realizedLosses = 0;
  
  const byTrack: Record<string, {
    trackTitle: string;
    totalBuys: number;
    totalSells: number;
    gainLoss: number;
  }> = {};

  // Sort transactions by date
  const sortedTxs = [...transactions].sort((a, b) => 
    a.createdAt.getTime() - b.createdAt.getTime()
  );

  for (const tx of sortedTxs) {
    const taxTx: TaxTransaction = {
      id: tx.id,
      date: tx.createdAt,
      type: tx.type,
      trackId: tx.trackId,
      trackTitle: tx.track.title,
      amount: tx.amount,
      price: tx.price,
      totalValue: tx.totalValue,
      fee: tx.fee,
    };

    // Initialize track summary
    if (!byTrack[tx.trackId]) {
      byTrack[tx.trackId] = {
        trackTitle: tx.track.title,
        totalBuys: 0,
        totalSells: 0,
        gainLoss: 0,
      };
    }

    if (tx.type === 'BUY') {
      // Add to cost basis (FIFO)
      if (!costBasisByTrack.has(tx.trackId)) {
        costBasisByTrack.set(tx.trackId, []);
      }
      costBasisByTrack.get(tx.trackId)!.push({
        amount: tx.amount,
        price: tx.price,
      });

      totalBuys++;
      totalInvested += tx.totalValue;
      byTrack[tx.trackId].totalBuys += tx.totalValue;
    } else if (tx.type === 'SELL') {
      // Calculate gain/loss using FIFO
      const costBasis = costBasisByTrack.get(tx.trackId) || [];
      let remainingAmount = tx.amount;
      let totalCost = 0;

      while (remainingAmount > 0 && costBasis.length > 0) {
        const firstBatch = costBasis[0];
        const amountToUse = Math.min(remainingAmount, firstBatch.amount);
        
        totalCost += amountToUse * firstBatch.price;
        remainingAmount -= amountToUse;
        firstBatch.amount -= amountToUse;

        if (firstBatch.amount === 0) {
          costBasis.shift();
        }
      }

      const avgCostBasis = totalCost / tx.amount;
      const gainLoss = (tx.price - avgCostBasis) * tx.amount;

      taxTx.costBasis = avgCostBasis;
      taxTx.gainLoss = gainLoss;

      if (gainLoss > 0) {
        realizedGains += gainLoss;
      } else {
        realizedLosses += Math.abs(gainLoss);
      }

      totalSells++;
      totalReceived += tx.totalValue;
      byTrack[tx.trackId].totalSells += tx.totalValue;
      byTrack[tx.trackId].gainLoss += gainLoss;
    }

    taxTransactions.push(taxTx);
  }

  const netGainLoss = realizedGains - realizedLosses;
  const estimatedTax = calculateEstimatedTax(netGainLoss);
  const taxRate = calculateTaxRate(netGainLoss);

  return {
    period: {
      start: startDate,
      end: endDate,
    },
    totalBuys,
    totalSells,
    totalInvested,
    totalReceived,
    realizedGains,
    realizedLosses,
    netGainLoss,
    estimatedTax,
    taxRate,
    transactions: taxTransactions,
    byTrack,
  };
}

/**
 * Format currency for Brazilian Real
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
