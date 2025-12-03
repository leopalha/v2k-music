"use client";

import { useState, useEffect } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button, DateRangePicker } from "@/components/ui";
import {
  Receipt,
  Download,
  Filter,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import { TransactionInsights } from "@/components/transactions/TransactionInsights";
import { PLChart } from "@/components/transactions/PLChart";
import { exportTransactionsToPDF } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "BUY" | "SELL" | "TRANSFER" | "ROYALTY_CLAIM" | "DEPOSIT" | "WITHDRAWAL";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  amount: number;
  price: number;
  totalValue: number;
  fee: number;
  paymentMethod?: string;
  txHash?: string;
  track: {
    id: string;
    title: string;
    artistName: string;
    coverUrl: string;
  };
  createdAt: string;
}

interface Summary {
  totalTransactions: number;
  totalVolume: number;
  totalFees: number;
  totalInvested: number;
  totalWithdrawn: number;
  totalRoyalties: number;
}

const TRANSACTION_TYPES = [
  { value: "", label: "Todos os tipos" },
  { value: "BUY", label: "Compras" },
  { value: "SELL", label: "Vendas" },
  { value: "ROYALTY_CLAIM", label: "Royalties" },
  { value: "TRANSFER", label: "Transferências" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "COMPLETED", label: "Concluídas" },
  { value: "PENDING", label: "Pendentes" },
  { value: "FAILED", label: "Falhadas" },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });

  // Pagination
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadTransactions();
  }, [typeFilter, statusFilter, dateRange, offset]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (typeFilter) params.append("type", typeFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (dateRange.startDate) {
        params.append("startDate", dateRange.startDate.toISOString().split("T")[0]);
      }
      if (dateRange.endDate) {
        params.append("endDate", dateRange.endDate.toISOString().split("T")[0]);
      }
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao carregar transações");
      }

      setTransactions(data.transactions);
      setSummary(data.summary);
      setTotal(data.pagination.total);
    } catch (error) {
      toast.error(
        "Erro ao carregar transações",
        error instanceof Error ? error.message : "Tente novamente"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setTypeFilter("");
    setStatusFilter("");
    setDateRange({ startDate: null, endDate: null });
    setOffset(0);
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error("Nenhuma transação para exportar");
      return;
    }

    const headers = [
      "Data",
      "Tipo",
      "Status",
      "Música",
      "Artista",
      "Quantidade",
      "Preço",
      "Total",
      "Taxa",
      "Hash",
    ];

    const rows = transactions.map((tx) => [
      new Date(tx.createdAt).toLocaleString("pt-BR"),
      tx.type,
      tx.status,
      tx.track.title,
      tx.track.artistName,
      tx.amount.toString(),
      `R$ ${tx.price.toFixed(2)}`,
      `R$ ${tx.totalValue.toFixed(2)}`,
      `R$ ${tx.fee.toFixed(2)}`,
      tx.txHash || "N/A",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transacoes-v2k-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Exportado", "Arquivo CSV baixado com sucesso");
  };

  const exportToPDF = () => {
    if (transactions.length === 0) {
      toast.error("Nenhuma transação para exportar");
      return;
    }

    if (!summary) {
      toast.error("Aguardando dados do resumo");
      return;
    }

    try {
      exportTransactionsToPDF(transactions, summary, {
        type: typeFilter,
        status: statusFilter,
        dateRange,
      });
      toast.success("Exportado", "Arquivo PDF baixado com sucesso");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erro ao exportar PDF", "Tente novamente");
    }
  };

  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "BUY":
        return <ArrowUpRight className="w-4 h-4" />;
      case "SELL":
        return <ArrowDownLeft className="w-4 h-4" />;
      case "ROYALTY_CLAIM":
        return <DollarSign className="w-4 h-4" />;
      case "TRANSFER":
        return <Repeat className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "BUY":
        return "Compra";
      case "SELL":
        return "Venda";
      case "ROYALTY_CLAIM":
        return "Royalty";
      case "TRANSFER":
        return "Transferência";
      case "DEPOSIT":
        return "Depósito";
      case "WITHDRAWAL":
        return "Saque";
      default:
        return type;
    }
  };

  const getTypeColor = (type: Transaction["type"]) => {
    switch (type) {
      case "BUY":
        return "text-accent-blue bg-accent-blue/10";
      case "SELL":
        return "text-accent-orange bg-accent-orange/10";
      case "ROYALTY_CLAIM":
        return "text-accent-green bg-accent-green/10";
      case "TRANSFER":
        return "text-accent-purple bg-accent-purple/10";
      default:
        return "text-text-secondary bg-bg-secondary";
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "text-accent-green bg-accent-green/10";
      case "PENDING":
        return "text-accent-yellow bg-accent-yellow/10";
      case "FAILED":
        return "text-accent-red bg-accent-red/10";
      case "REFUNDED":
        return "text-accent-orange bg-accent-orange/10";
      default:
        return "text-text-secondary bg-bg-secondary";
    }
  };

  const getStatusLabel = (status: Transaction["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "Concluída";
      case "PENDING":
        return "Pendente";
      case "FAILED":
        return "Falhou";
      case "REFUNDED":
        return "Reembolsada";
      default:
        return status;
    }
  };

  const hasActiveFilters =
    typeFilter !== "" ||
    statusFilter !== "" ||
    dateRange.startDate !== null ||
    dateRange.endDate !== null;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Histórico de Transações"
          subtitle="Acompanhe todas as suas transações na plataforma"
        />

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
              <p className="text-xs text-text-tertiary mb-1">Total Investido</p>
              <p className="text-2xl font-bold text-text-primary">
                R$ {summary.totalInvested.toFixed(2)}
              </p>
            </div>
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
              <p className="text-xs text-text-tertiary mb-1">Total em Royalties</p>
              <p className="text-2xl font-bold text-accent-green">
                R$ {summary.totalRoyalties.toFixed(2)}
              </p>
            </div>
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
              <p className="text-xs text-text-tertiary mb-1">Total Retirado</p>
              <p className="text-2xl font-bold text-accent-orange">
                R$ {summary.totalWithdrawn.toFixed(2)}
              </p>
            </div>
            <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4">
              <p className="text-xs text-text-tertiary mb-1">Transações</p>
              <p className="text-2xl font-bold text-text-primary">
                {summary.totalTransactions}
              </p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-bg-elevated border border-border-subtle rounded-lg hover:bg-bg-secondary transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filtros</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary-400 rounded-full" />
            )}
          </button>

          <div className="flex gap-2">
            <Button
              onClick={exportToPDF}
              variant="primary"
              size="sm"
              disabled={transactions.length === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              disabled={transactions.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-bg-elevated border border-border-subtle rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Tipo
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setOffset(0);
                  }}
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-primary-400"
                >
                  {TRANSACTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setOffset(0);
                  }}
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-primary-400"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Picker */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Período
                </label>
                <DateRangePicker
                  value={dateRange}
                  onChange={(range) => {
                    setDateRange(range);
                    setOffset(0);
                  }}
                  placeholder="Selecione o período"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4">
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Transaction Insights */}
        {transactions.length > 0 && (
          <div className="mb-6">
            <TransactionInsights transactions={transactions} />
          </div>
        )}

        {/* P&L Chart */}
        {transactions.length > 0 && (
          <div className="mb-6">
            <PLChart transactions={transactions} />
          </div>
        )}

        {/* Transactions List */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border-subtle">
                    <tr className="text-left">
                      <th className="px-4 py-3 text-xs font-medium text-text-tertiary">
                        Data
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-text-tertiary">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-text-tertiary">
                        Música
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-text-tertiary">
                        Quantidade
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-text-tertiary">
                        Valor Total
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-text-tertiary">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-border-subtle last:border-0 hover:bg-bg-secondary transition-colors"
                        data-testid="transaction-item"
                      >
                        <td className="px-4 py-3 text-sm text-text-secondary" data-testid="transaction-date">
                          {new Date(tx.createdAt).toLocaleDateString("pt-BR")}
                          <br />
                          <span className="text-xs text-text-tertiary">
                            {new Date(tx.createdAt).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(
                              tx.type
                            )}`}
                            data-testid="transaction-type"
                          >
                            {getTypeIcon(tx.type)}
                            {getTypeLabel(tx.type)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                              {tx.track.coverUrl ? (
                                <Image
                                  src={tx.track.coverUrl}
                                  alt={tx.track.title}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              ) : (
                                <Receipt className="w-5 h-5 text-text-tertiary" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate">
                                {tx.track.title}
                              </p>
                              <p className="text-xs text-text-tertiary truncate">
                                {tx.track.artistName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">
                          {tx.amount} tokens
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-text-primary" data-testid="transaction-amount">
                            R$ {tx.totalValue.toFixed(2)}
                          </p>
                          {tx.fee > 0 && (
                            <p className="text-xs text-text-tertiary">
                              Taxa: R$ {tx.fee.toFixed(2)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              tx.status
                            )}`}
                          >
                            {getStatusLabel(tx.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-border-subtle">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                          {tx.track.coverUrl ? (
                            <Image
                              src={tx.track.coverUrl}
                              alt={tx.track.title}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <Receipt className="w-6 h-6 text-text-tertiary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {tx.track.title}
                          </p>
                          <p className="text-xs text-text-tertiary truncate">
                            {tx.track.artistName}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(
                          tx.status
                        )}`}
                      >
                        {getStatusLabel(tx.status)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          tx.type
                        )}`}
                      >
                        {getTypeIcon(tx.type)}
                        {getTypeLabel(tx.type)}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-text-primary">
                          R$ {tx.totalValue.toFixed(2)}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {tx.amount} tokens
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-border-subtle text-xs text-text-tertiary">
                      {new Date(tx.createdAt).toLocaleString("pt-BR")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-text-secondary">
                  Página {currentPage} de {totalPages} • {total} transações
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                    className="p-2 rounded-lg bg-bg-elevated border border-border-subtle hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setOffset(offset + limit)}
                    disabled={offset + limit >= total}
                    className="p-2 rounded-lg bg-bg-elevated border border-border-subtle hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16" data-testid="empty-transactions">
            <Receipt className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Nenhuma transação encontrada
            </h3>
            <p className="text-text-secondary mb-6">
              {hasActiveFilters
                ? "Tente ajustar os filtros"
                : "Suas transações aparecerão aqui"}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Limpar Filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
