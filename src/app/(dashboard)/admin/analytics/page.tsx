'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RFMDistribution {
  segment: string;
  count: number;
  percentage: number;
  totalRevenue: number;
  avgRevenue: number;
  recommendations: {
    description: string;
    actions: string[];
  };
}

interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  conversionRate: number;
}

export default function AnalyticsPage() {
  const [rfmData, setRfmData] = useState<{
    distribution: RFMDistribution[];
    totalUsers: number;
  } | null>(null);
  const [funnelData, setFunnelData] = useState<{
    steps: FunnelStep[];
    overallConversion: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rfm' | 'funnel'>('rfm');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rfmRes, funnelRes] = await Promise.all([
        fetch('/api/analytics/rfm'),
        fetch('/api/analytics/funnels'),
      ]);

      if (rfmRes.ok) {
        const rfm = await rfmRes.json();
        setRfmData(rfm);
      }

      if (funnelRes.ok) {
        const funnel = await funnelRes.json();
        setFunnelData(funnel.funnel);
      }
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando analytics...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        <p className="text-muted-foreground">Insights avançados sobre usuários e conversão</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('rfm')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'rfm'
              ? 'border-primary text-primary'
              : 'border-transparent hover:text-primary'
          }`}
        >
          Segmentação RFM
        </button>
        <button
          onClick={() => setActiveTab('funnel')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'funnel'
              ? 'border-primary text-primary'
              : 'border-transparent hover:text-primary'
          }`}
        >
          Análise de Funil
        </button>
      </div>

      {/* RFM Tab */}
      {activeTab === 'rfm' && rfmData && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Segmentação de Usuários (RFM)</h2>
            <p className="text-muted-foreground">
              {rfmData.totalUsers} usuários segmentados por Recência, Frequência e Valor Monetário
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rfmData.distribution.map((segment) => (
              <Card key={segment.segment}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{segment.segment}</span>
                    <Badge variant={
                      segment.segment === 'Champions' ? 'default' :
                      segment.segment === 'Loyal' ? 'secondary' :
                      segment.segment === 'Potential' ? 'outline' :
                      segment.segment === 'At Risk' ? 'warning' :
                      'error'
                    }>
                      {segment.count}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {segment.recommendations.description}
                      </div>
                      <div className="text-2xl font-bold">
                        {segment.percentage.toFixed(1)}%
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="text-sm text-muted-foreground mb-1">Receita Total</div>
                      <div className="text-lg font-semibold">
                        R$ {(segment.totalRevenue / 100).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Receita Média</div>
                      <div className="text-lg font-semibold">
                        R$ {(segment.avgRevenue / 100).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="text-sm font-medium mb-2">Ações Recomendadas:</div>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        {segment.recommendations.actions.slice(0, 3).map((action, i) => (
                          <li key={i}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Funnel Tab */}
      {activeTab === 'funnel' && funnelData && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Funil de Conversão</h2>
            <p className="text-muted-foreground">
              Conversão geral: {funnelData.overallConversion.toFixed(2)}%
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Steps do Funil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.steps.map((step, index) => (
                  <div key={step.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{step.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {step.count.toLocaleString()} usuários
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {step.conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {step.percentage.toFixed(1)}% do total
                        </div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${step.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
