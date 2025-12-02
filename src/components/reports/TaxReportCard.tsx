'use client';

import { TrendingUp, TrendingDown, DollarSign, Calculator } from 'lucide-react';
import { formatBRL, formatPercentage } from '@/lib/tax/calculations';

interface TaxReportCardProps {
  summary: {
    totalBuys: number;
    totalSells: number;
    totalInvested: number;
    totalReceived: number;
    realizedGains: number;
    realizedLosses: number;
    netGainLoss: number;
    estimatedTax: number;
    taxRate: number;
  };
}

export function TaxReportCard({ summary }: TaxReportCardProps) {
  const isProfit = summary.netGainLoss > 0;
  const hasTransactions = summary.totalBuys > 0 || summary.totalSells > 0;

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-emerald-800/30 px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-emerald-500" />
          <div>
            <h2 className="text-xl font-bold">Resumo Fiscal</h2>
            <p className="text-sm text-gray-400">Ganhos de Capital - Imposto de Renda</p>
          </div>
        </div>
      </div>

      {!hasTransactions ? (
        <div className="p-8 text-center text-gray-400">
          <p>Nenhuma transação no período selecionado</p>
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            {/* Total Invested */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-500" />
                <p className="text-sm text-gray-400">Total Investido</p>
              </div>
              <p className="text-2xl font-bold">{formatBRL(summary.totalInvested)}</p>
              <p className="text-xs text-gray-500 mt-1">{summary.totalBuys} compras</p>
            </div>

            {/* Total Received */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-purple-500" />
                <p className="text-sm text-gray-400">Total Recebido</p>
              </div>
              <p className="text-2xl font-bold">{formatBRL(summary.totalReceived)}</p>
              <p className="text-xs text-gray-500 mt-1">{summary.totalSells} vendas</p>
            </div>

            {/* Realized Gains */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <p className="text-sm text-gray-400">Ganhos Realizados</p>
              </div>
              <p className="text-2xl font-bold text-emerald-500">
                {formatBRL(summary.realizedGains)}
              </p>
            </div>

            {/* Realized Losses */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <p className="text-sm text-gray-400">Perdas Realizadas</p>
              </div>
              <p className="text-2xl font-bold text-red-500">
                {formatBRL(summary.realizedLosses)}
              </p>
            </div>
          </div>

          {/* Net Gain/Loss and Tax */}
          <div className="border-t border-gray-800 bg-gray-800/30 px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Net Gain/Loss */}
              <div>
                <p className="text-sm text-gray-400 mb-1">Resultado Líquido</p>
                <p className={`text-3xl font-bold ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatBRL(summary.netGainLoss)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isProfit ? 'Lucro' : 'Prejuízo'}
                </p>
              </div>

              {/* Tax Rate */}
              <div>
                <p className="text-sm text-gray-400 mb-1">Alíquota IR</p>
                <p className="text-3xl font-bold text-blue-500">
                  {formatPercentage(summary.taxRate)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Sobre ganhos de capital
                </p>
              </div>

              {/* Estimated Tax */}
              <div>
                <p className="text-sm text-gray-400 mb-1">Imposto Estimado</p>
                <p className="text-3xl font-bold text-orange-500">
                  {formatBRL(summary.estimatedTax)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.estimatedTax > 0 ? 'A pagar' : 'Nenhum imposto devido'}
                </p>
              </div>
            </div>
          </div>

          {/* Tax Info */}
          <div className="border-t border-gray-800 px-6 py-4 bg-blue-900/10">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded">
                <Calculator className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Informações Importantes</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Método de cálculo: FIFO (First In, First Out) - aceito pela Receita Federal</li>
                  <li>• Alíquotas: 15% até R$ 5mi, 17.5% até R$ 10mi, 20% até R$ 30mi, 22.5% acima</li>
                  <li>• Prazo: Imposto deve ser pago até o último dia útil do mês seguinte à venda</li>
                  <li>• Este relatório é apenas uma estimativa. Consulte um contador para declaração oficial.</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
