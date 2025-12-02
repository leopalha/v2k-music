import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { parseWidgetParams } from '@/lib/widgets/builder';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function LeaderboardEmbedContent({ searchParams }: { searchParams: any }) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      params.append(key, value);
    }
  });
  
  const { theme, limit } = parseWidgetParams(params);
  const take = limit || 10;

  const leaderboard = await prisma.userStats.findMany({
    where: {
      user: {
        kycStatus: 'VERIFIED',
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { totalProfit: 'desc' },
    take,
  });

  return (
    <div
      className={`min-h-screen p-4 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Top Investors</h2>
        <div className="space-y-2">
          {leaderboard.map((stats, index) => {
            const roiPercent =
              stats.totalInvested > 0
                ? (stats.totalProfit / stats.totalInvested) * 100
                : 0;

            return (
              <div
                key={stats.userId}
                className={`p-3 rounded-lg flex items-center gap-3 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                }`}
              >
                <div className="text-2xl font-bold text-gray-400 w-8">
                  #{index + 1}
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <div>
                    <div className="font-medium">{stats.user.name || 'Anonymous'}</div>
                    <div
                      className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {stats.totalTrades} trades • {stats.portfolioValue.toFixed(0)} tokens
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">R$ {stats.totalProfit.toFixed(2)}</div>
                  <div
                    className={`text-sm ${
                      roiPercent >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {roiPercent > 0 ? '+' : ''}
                    {roiPercent.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <a
          href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/leaderboard`}
          target="_blank"
          rel="noopener noreferrer"
          className={`block mt-4 text-center text-sm ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          } hover:underline`}
        >
          Powered by V2K Music
        </a>
      </div>
    </div>
  );
}

export default async function LeaderboardEmbedPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <LeaderboardEmbedContent searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
