import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { parseWidgetParams } from '@/lib/widgets/builder';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function TrackEmbedContent({ id, searchParams }: { id: string; searchParams: any }) {
  // Buscar track
  const track = await prisma.track.findUnique({
    where: { id },
  });

  if (!track) {
    notFound();
  }

  // Parse query params
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      params.append(key, value);
    }
  });
  
  const { theme, autoplay } = parseWidgetParams(params);

  return (
    <div
      className={`min-h-screen p-4 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <div className="max-w-md mx-auto">
        {/* Track Info */}
        <div className="mb-4">
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full aspect-square object-cover rounded-lg mb-3"
          />
          <h2 className="text-xl font-bold">{track.title}</h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {track.artistName}
          </p>
        </div>

        {/* Audio Player */}
        {track.audioUrl && (
          <audio
            controls
            autoPlay={autoplay}
            className="w-full"
            style={{
              filter: theme === 'dark' ? 'invert(1)' : 'none',
            }}
          >
            <source src={track.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )}

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Preço</div>
            <div className="font-bold">R$ {track.currentPrice.toFixed(2)}</div>
          </div>
          <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>24h</div>
            <div
              className={`font-bold ${
                track.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {track.priceChange24h > 0 ? '+' : ''}
              {track.priceChange24h.toFixed(2)}%
            </div>
          </div>
          <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Volume</div>
            <div className="font-bold">
              R$ {(track.volume24h / 1000).toFixed(1)}k
            </div>
          </div>
        </div>

        {/* Powered by V2K */}
        <a
          href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/track/${track.id}`}
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

export default async function TrackEmbedPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <TrackEmbedContent id={resolvedParams.id} searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
