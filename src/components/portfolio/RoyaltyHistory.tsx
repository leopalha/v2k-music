"use client";

import { Download, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui";

interface RoyaltyPayment {
  id: string;
  trackTitle: string;
  trackId: number;
  amount: number;
  source: string; // "Spotify", "YouTube", "Apple Music", etc.
  date: Date;
  txHash?: string;
  status: "pending" | "completed" | "failed";
}

interface RoyaltyHistoryProps {
  payments: RoyaltyPayment[];
}

export function RoyaltyHistory({ payments }: RoyaltyHistoryProps) {
  const totalEarned = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl">
      {/* Header */}
      <div className="p-6 border-b border-border-primary">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Histórico de Royalties
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Total recebido: {formatCurrency(totalEarned)}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary hover:bg-bg-elevated rounded-lg transition-colors text-sm">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-tertiary">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Música
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Fonte
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Data
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Valor
              </th>
              <th className="text-center px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="text-center px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                TX
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="text-text-secondary">
                    <p className="text-sm">Nenhum royalty recebido ainda</p>
                    <p className="text-xs mt-1">
                      Os royalties são distribuídos mensalmente
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-bg-tertiary/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <a
                      href={`/track/${payment.trackId}`}
                      className="text-sm font-medium text-text-primary hover:text-primary transition-colors"
                    >
                      {payment.trackTitle}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">
                      {payment.source}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">
                      {formatDate(payment.date)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-accent-green">
                      {formatCurrency(payment.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge
                      variant={
                        payment.status === "completed"
                          ? "success"
                          : payment.status === "pending"
                          ? "warning"
                          : "error"
                      }
                    >
                      {payment.status === "completed"
                        ? "Pago"
                        : payment.status === "pending"
                        ? "Pendente"
                        : "Falhou"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {payment.txHash ? (
                      <a
                        href={`https://polygonscan.com/tx/${payment.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-400 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-text-tertiary">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
