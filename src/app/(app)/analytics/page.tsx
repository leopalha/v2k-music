import { Metadata } from 'next';
import OverviewCards from '@/components/analytics/OverviewCards';
import PerformanceChart from '@/components/analytics/PerformanceChart';
import TopTracksTable from '@/components/analytics/TopTracksTable';
import InsightsPanel from '@/components/analytics/InsightsPanel';

export const metadata: Metadata = {
  title: 'Analytics - V2K Music',
  description: 'Análise detalhada do seu portfolio musical',
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe a performance do seu portfolio e receba insights personalizados
          </p>
        </div>

        {/* Overview Cards */}
        <div className="mb-8">
          <OverviewCards />
        </div>

        {/* Performance Chart */}
        <div className="mb-8">
          <PerformanceChart />
        </div>

        {/* Two Column Layout: Top Tracks + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Tracks - Takes 2 columns */}
          <div className="lg:col-span-2">
            <TopTracksTable />
          </div>

          {/* Insights - Takes 1 column */}
          <div className="lg:col-span-1">
            <InsightsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
