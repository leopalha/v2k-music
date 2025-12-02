'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface TopHoldersTableProps {
  holders: Array<{
    userId: string;
    username: string;
    profileImageUrl: string | null;
    tokens: number;
    percentage: number;
  }>;
}

export default function TopHoldersTable({ holders }: TopHoldersTableProps) {
  if (!holders || holders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-tertiary">Nenhum holder encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
              Holder
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
              Tokens
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
              % Portfolio
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {holders.map((holder, index) => (
            <tr
              key={holder.userId}
              className="hover:bg-bg-elevated transition-colors"
            >
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-text-secondary">
                    #{index + 1}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <Link
                  href={`/profile/${holder.username || holder.userId}`}
                  className="flex items-center gap-3 hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center overflow-hidden">
                    {holder.profileImageUrl ? (
                      <img
                        src={holder.profileImageUrl}
                        alt={holder.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-text-tertiary" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {holder.username}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <span className="text-sm font-semibold text-text-primary">
                  {formatNumber(holder.tokens)}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <span className="text-sm font-medium text-accent-green">
                  {holder.percentage.toFixed(2)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
