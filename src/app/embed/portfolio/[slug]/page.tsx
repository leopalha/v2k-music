import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { parseWidgetParams } from '@/lib/widgets/builder';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function PortfolioEmbedContent({ slug, searchParams }: { slug: string; searchParams: any }) {
  // Buscar usuário pelo ID (slug deve ser o userId)
  const user = await prisma.user.findFirst({
    where: { id: slug },
    include: {
      _count: {
        select: { portfolio: true, transactions: true },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Buscar portfolio
  const portfolios = await prisma.portfolio.findMany({
    where: { userId: user.id },
    include: {
      track: true,
    },
    orderBy: { unrealizedPnL: 'desc' },
    take: 5,
  });

  // Parse query params
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      params.append(key, value);
    }
  });
  
  const { theme } = parseWidgetParams(params);

  const totalValue = portfolios.reduce((sum, p) => sum + p.currentValue, 0);
  const totalInvested = portfolios.reduce((sum, p) => sum + p.totalInvested, 0);
  const unrealizedPnL = portfolios.reduce((sum, p) => sum + p.unrealizedPnL, 0);
  const pnlPercent = totalInvested > 0 ? (unrealizedPnL / totalInvested) * 100 : 0;

  return (
    <div
      className={`min-h-screen p-4 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <div className="max-w-2xl mx-auto">
        {/* User Info */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">{user.name || 'Investor'}</h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {user._count.transactions} trades • {user._count.portfolio} holdings
          </p>
        </div>

        {/* Portfolio Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Value
            </div>
            <div className="text-lg font-bold">R$ {totalValue.toFixed(2)}</div>
          </div>
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Invested
            </div>
            <div className="text-lg font-bold">R$ {totalInvested.toFixed(2)}</div>
          </div>
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              P&L
            </div>
            <div
              className={`text-lg font-bold ${
                unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {pnlPercent > 0 ? '+' : ''}
              {pnlPercent.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Top Holdings */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Top Holdings</h3>
          <div className="space-y-2">
            {portfolios.map((portfolio) => {
              const pnl = portfolio.unrealizedPnL;
              const pnlPercent =
                portfolio.totalInvested > 0
                  ? (pnl / portfolio.totalInvested) * 100
                  : 0;

              return (
                <div
                  key={portfolio.id}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={portfolio.track.coverUrl}
                      alt={portfolio.track.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <div className="font-medium">{portfolio.track.title}</div>
                      <div
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {portfolio.amount.toFixed(2)} tokens
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      R$ {portfolio.currentValue.toFixed(2)}
                    </div>
                    <div
                      className={`text-sm ${
                        pnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {pnlPercent > 0 ? '+' : ''}
                      {pnlPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Powered by V2K */}
        <a
          href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/share/${slug}`}
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

export default async function PortfolioEmbedPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <PortfolioEmbedContent slug={resolvedParams.slug} searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
