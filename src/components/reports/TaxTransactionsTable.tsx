'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatBRL } from '@/lib/tax/calculations';

interface TaxTransaction {
  id: string;
  date: string;
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

interface TaxTransactionsTableProps {
  transactions: TaxTransaction[];
}

export function TaxTransactionsTable({ transactions }: TaxTransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center text-gray-400">
        <p>Nenhuma transação para exibir</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800">
        <h3 className="text-lg font-bold">Detalhamento de Transações</h3>
        <p className="text-sm text-gray-400">Todas as transações do período para fins fiscais</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-6 py-3 text-left">Data</th>
              <th className="px-6 py-3 text-left">Tipo</th>
              <th className="px-6 py-3 text-left">Música</th>
              <th className="px-6 py-3 text-right">Quantidade</th>
              <th className="px-6 py-3 text-right">Preço</th>
              <th className="px-6 py-3 text-right">Valor Total</th>
              <th className="px-6 py-3 text-right">Custo Médio</th>
              <th className="px-6 py-3 text-right">Ganho/Perda</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {transactions.map((tx) => {
              const isBuy = tx.type === 'BUY';
              const isSell = tx.type === 'SELL';
              const hasGainLoss = isSell && tx.gainLoss !== undefined;
              const isProfit = hasGainLoss && tx.gainLoss! > 0;

              return (
                <tr key={tx.id} className="hover:bg-gray-800/30 transition-colors">
                  {/* Date */}
                  <td className="px-6 py-4 text-sm">
                    {new Date(tx.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {isBuy ? (
                        <>
                          <div className="p-1 bg-blue-500/20 rounded">
                            <ArrowDownRight className="w-3 h-3 text-blue-500" />
                          </div>
                          <span className="text-sm font-medium text-blue-500">COMPRA</span>
                        </>
                      ) : (
                        <>
                          <div className="p-1 bg-purple-500/20 rounded">
                            <ArrowUpRight className="w-3 h-3 text-purple-500" />
                          </div>
                          <span className="text-sm font-medium text-purple-500">VENDA</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Track */}
                  <td className="px-6 py-4 text-sm max-w-xs truncate">
                    {tx.trackTitle}
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 text-sm text-right font-mono">
                    {tx.amount.toLocaleString('pt-BR')}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 text-sm text-right font-mono">
                    {formatBRL(tx.price)}
                  </td>

                  {/* Total Value */}
                  <td className="px-6 py-4 text-sm text-right font-mono font-semibold">
                    {formatBRL(tx.totalValue)}
                  </td>

                  {/* Cost Basis */}
                  <td className="px-6 py-4 text-sm text-right font-mono">
                    {tx.costBasis !== undefined ? formatBRL(tx.costBasis) : '-'}
                  </td>

                  {/* Gain/Loss */}
                  <td className="px-6 py-4 text-sm text-right font-mono">
                    {hasGainLoss ? (
                      <span className={`font-semibold ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isProfit ? '+' : ''}{formatBRL(tx.gainLoss!)}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800 bg-gray-800/30 text-xs text-gray-400">
        <p>Total de {transactions.length} transações no período</p>
      </div>
    </div>
  );
}
