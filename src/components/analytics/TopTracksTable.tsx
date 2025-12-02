'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrackData {
  trackId: string;
  title: string;
  artist: string;
  imageUrl: string;
  sharesOwned: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  roi: number;
  royaltiesEarned: number;
  performance: 'excellent' | 'good' | 'neutral' | 'poor';
}

interface TopTracksData {
  tracks: TrackData[];
  total: number;
}

export default function TopTracksTable() {
  const [sortBy, setSortBy] = useState<'roi' | 'profitLoss' | 'volume' | 'royalties'>('roi');
  const [data, setData] = useState<TopTracksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopTracks() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/analytics/top-tracks?sortBy=${sortBy}&limit=10`);

        if (!response.ok) {
          throw new Error('Failed to fetch top tracks');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching top tracks:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchTopTracks();
  }, [sortBy]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getPerformanceBadge = (performance: string) => {
    const badges = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      neutral: 'bg-gray-100 text-gray-800',
      poor: 'bg-red-100 text-red-800',
    };

    const labels = {
      excellent: 'Excelente',
      good: 'Bom',
      neutral: 'Neutro',
      poor: 'Fraco',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[performance as keyof typeof badges]}`}>
        {labels[performance as keyof typeof labels]}
      </span>
    );
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar tracks: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Top Tracks</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('roi')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'roi'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ROI
            </button>
            <button
              onClick={() => setSortBy('profitLoss')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'profitLoss'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              P&L
            </button>
            <button
              onClick={() => setSortBy('royalties')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'royalties'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Royalties
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : data && data.tracks.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Música
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Atual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.tracks.map((track) => (
                <tr key={track.trackId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/tracks/${track.trackId}`} className="flex items-center gap-3 group">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                        <Image
                          src={track.imageUrl || '/placeholder-track.png'}
                          alt={track.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {track.title}
                        </p>
                        <p className="text-sm text-gray-500">{track.artist}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {track.sharesOwned}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(track.totalInvested)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(track.currentValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {track.profitLoss >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={track.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(track.profitLoss)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${track.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {track.roi >= 0 ? '+' : ''}
                      {track.roi.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPerformanceBadge(track.performance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p>Nenhuma música no portfolio ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
