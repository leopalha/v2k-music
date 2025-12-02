import { describe, it, expect } from '@jest/globals';
import { calculateTaxSummary } from '@/lib/tax/calculations';

// Helper para criar transações no formato esperado
const makeTx = (overrides: Partial<any> = {}) => ({
  id: overrides.id || 'tx_1',
  createdAt: overrides.createdAt || new Date('2025-01-10'),
  type: overrides.type || 'BUY',
  trackId: overrides.trackId || 'track_1',
  track: { title: overrides.trackTitle || 'Track 1' },
  amount: overrides.quantity ?? 10,
  price: overrides.price ?? 100,
  totalValue: (overrides.quantity ?? 10) * (overrides.price ?? 100),
  fee: overrides.fee ?? 0,
});

describe('Tax Calculations - FIFO & Rates', () => {
  it('should compute zero tax for no transactions', () => {
    const result = calculateTaxSummary([], new Date('2025-01-01'), new Date('2025-12-31'));
    expect(result.totalInvested).toBe(0);
    expect(result.totalReceived).toBe(0);
    expect(result.realizedGains).toBe(0);
    expect(result.realizedLosses).toBe(0);
    expect(result.estimatedTax).toBe(0);
  });

  it('should handle simple buy then sell with gain', () => {
    const txs = [
      makeTx({ id: 'buy1', type: 'BUY', quantity: 10, price: 100, createdAt: new Date('2025-01-10') }),
      makeTx({ id: 'sell1', type: 'SELL', quantity: 10, price: 120, createdAt: new Date('2025-02-10') }),
    ];
    const result = calculateTaxSummary(txs, new Date('2025-01-01'), new Date('2025-12-31'));
    expect(result.totalInvested).toBe(1000);
    expect(result.totalReceived).toBe(1200);
    expect(result.realizedGains).toBeCloseTo(200, 5);
    expect(result.realizedLosses).toBe(0);
    // Tax rate minimal tier 15%
    expect(result.estimatedTax).toBeCloseTo(30, 1);
  });

  it('should apply FIFO when multiple buys before sell', () => {
    const txs = [
      makeTx({ id: 'buy1', type: 'BUY', quantity: 5, price: 100, createdAt: new Date('2025-01-10') }),
      makeTx({ id: 'buy2', type: 'BUY', quantity: 5, price: 200, createdAt: new Date('2025-01-20') }),
      makeTx({ id: 'sell1', type: 'SELL', quantity: 6, price: 150, createdAt: new Date('2025-02-10') }),
    ];
    const result = calculateTaxSummary(txs, new Date('2025-01-01'), new Date('2025-12-31'));
    // Realized gain: 6 sold with cost basis: 5x100 + 1x200 = 700; proceeds 6x150 = 900 => gain 200
    expect(result.realizedGains).toBeCloseTo(200, 5);
    expect(result.realizedLosses).toBe(0);
  });
});
