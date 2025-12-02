'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lightbulb, TrendingUp, AlertTriangle, Trophy, ArrowRight } from 'lucide-react';

interface Insight {
  type: 'opportunity' | 'warning' | 'achievement' | 'tip';
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

interface InsightsData {
  insights: Insight[];
  meta: {
    totalInvested: number;
    currentValue: number;
    roi: number;
    tracksOwned: number;
    avgPlatformROI: number;
  };
}

export default function InsightsPanel() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const response = await fetch('/api/analytics/insights');

        if (!response.ok) {
          throw new Error('Failed to fetch insights');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'achievement':
        return <Trophy className="w-5 h-5" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-900',
        };
      case 'achievement':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          title: 'text-green-900',
        };
      case 'tip':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          icon: 'text-purple-600',
          title: 'text-purple-900',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-900',
        };
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar insights: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Insights & Recomendações</h3>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : data && data.insights.length > 0 ? (
        <div className="space-y-4">
          {data.insights.map((insight, index) => {
            const colors = getInsightColor(insight.type);
            return (
              <div
                key={index}
                className={`border ${colors.border} ${colors.bg} rounded-lg p-4 transition-all hover:shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${colors.icon} mt-0.5`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${colors.title} mb-1`}>
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <Link
                        href={insight.action.href}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {insight.action.label}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            Nenhum insight disponível no momento
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Comece a investir para receber recomendações personalizadas
          </p>
        </div>
      )}
    </div>
  );
}
