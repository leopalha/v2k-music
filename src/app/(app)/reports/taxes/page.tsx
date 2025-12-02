'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaxReportCard } from '@/components/reports/TaxReportCard';
import { TaxTransactionsTable } from '@/components/reports/TaxTransactionsTable';

interface TaxData {
  period: {
    start: string;
    end: string;
    year: number;
  };
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
  transactions: Array<{
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
  }>;
  byTrack: Record<string, {
    trackTitle: string;
    totalBuys: number;
    totalSells: number;
    gainLoss: number;
  }>;
}

export default function TaxReportsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [taxData, setTaxData] = useState<TaxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Generate year options (current year and past 5 years)
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchTaxData();
  }, [selectedYear]);

  const fetchTaxData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/tax-summary?year=${selectedYear}`);
      if (res.ok) {
        const data = await res.json();
        setTaxData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tax data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!taxData) return;

    setExporting(true);

    try {
      // Prepare CSV content
      const headers = [
        'Data',
        'Tipo',
        'Música',
        'Quantidade',
        'Preço',
        'Valor Total',
        'Custo Médio',
        'Ganho/Perda',
      ];

      const rows = taxData.transactions.map(tx => [
        new Date(tx.date).toLocaleDateString('pt-BR'),
        tx.type === 'BUY' ? 'COMPRA' : 'VENDA',
        tx.trackTitle,
        tx.amount.toString(),
        tx.price.toFixed(2),
        tx.totalValue.toFixed(2),
        tx.costBasis?.toFixed(2) || '-',
        tx.gainLoss?.toFixed(2) || '-',
      ]);

      // Add summary at the end
      rows.push([]);
      rows.push(['RESUMO']);
      rows.push(['Total Investido', '', '', '', '', taxData.summary.totalInvested.toFixed(2)]);
      rows.push(['Total Recebido', '', '', '', '', taxData.summary.totalReceived.toFixed(2)]);
      rows.push(['Ganhos Realizados', '', '', '', '', taxData.summary.realizedGains.toFixed(2)]);
      rows.push(['Perdas Realizadas', '', '', '', '', taxData.summary.realizedLosses.toFixed(2)]);
      rows.push(['Resultado Líquido', '', '', '', '', taxData.summary.netGainLoss.toFixed(2)]);
      rows.push(['Imposto Estimado', '', '', '', '', taxData.summary.estimatedTax.toFixed(2)]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio-fiscal-${selectedYear}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Erro ao exportar relatório');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-emerald-500" />
          <h1 className="text-3xl font-bold">Relatórios Fiscais</h1>
        </div>
        <p className="text-gray-400">
          Relatório de ganhos de capital para declaração do Imposto de Renda
        </p>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Year Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <label className="text-sm font-medium">Ano-calendário:</label>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <Button
            onClick={exportToCSV}
            disabled={exporting || !taxData || taxData.transactions.length === 0}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-900/10 border border-blue-800 rounded text-sm text-gray-400">
          ⚠️ Este relatório é uma estimativa baseada em suas transações. 
          Para declaração oficial, consulte um contador credenciado.
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      )}

      {/* Content */}
      {!loading && taxData && (
        <div className="space-y-6">
          {/* Summary Card */}
          <TaxReportCard summary={taxData.summary} />

          {/* Transactions Table */}
          <TaxTransactionsTable transactions={taxData.transactions} />

          {/* By Track Breakdown */}
          {Object.keys(taxData.byTrack).length > 0 && (
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-lg font-bold">Resultado por Música</h3>
                <p className="text-sm text-gray-400">
                  Ganhos e perdas consolidados por track
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(taxData.byTrack).map(([trackId, data]) => {
                    const isProfit = data.gainLoss > 0;
                    return (
                      <div
                        key={trackId}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                      >
                        <h4 className="font-semibold mb-2 truncate">{data.trackTitle}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Compras:</span>
                            <span className="font-mono">
                              R$ {data.totalBuys.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Vendas:</span>
                            <span className="font-mono">
                              R$ {data.totalSells.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-700">
                            <span className="text-gray-400 font-semibold">Resultado:</span>
                            <span
                              className={`font-mono font-semibold ${
                                isProfit ? 'text-emerald-500' : 'text-red-500'
                              }`}
                            >
                              {isProfit ? '+' : ''}R$ {data.gainLoss.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
