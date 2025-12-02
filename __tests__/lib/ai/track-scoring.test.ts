import { describe, it, expect } from '@jest/globals';
import { calculateTrackScore } from '@/lib/ai/track-scoring';

describe('AI Track Scoring', () => {
  it('should return score within 0-100', () => {
    const result = calculateTrackScore({
      totalStreams: 700000,
      spotifyStreams: 300000,
      youtubeViews: 350000,
      tiktokViews: 20000,
      currentPrice: 1.2,
      initialPrice: 1.0,
      priceChange24h: 5,
      volume24h: 10000,
      holders: 800,
      marketCap: 500000,
      duration: 180,
      bpm: 120,
      createdAt: new Date(),
      commentsCount: 200,
      favoritesCount: 500,
    });
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
    expect(result.breakdown).toBeDefined();
  });

  it('should assign higher score with strong momentum and engagement', () => {
    const low = calculateTrackScore({
      totalStreams: 4000,
      spotifyStreams: 1000,
      youtubeViews: 2000,
      tiktokViews: 100,
      currentPrice: 0.9,
      initialPrice: 1.0,
      priceChange24h: -2,
      volume24h: 100,
      holders: 5,
      marketCap: 10000,
      duration: 90,
      bpm: 60,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      commentsCount: 2,
      favoritesCount: 5,
    });

    const high = calculateTrackScore({
      totalStreams: 1200000,
      spotifyStreams: 600000,
      youtubeViews: 500000,
      tiktokViews: 80000,
      currentPrice: 1.6,
      initialPrice: 1.0,
      priceChange24h: 8,
      volume24h: 50000,
      holders: 2000,
      marketCap: 2000000,
      duration: 200,
      bpm: 128,
      createdAt: new Date(),
      commentsCount: 400,
      favoritesCount: 1000,
    });

    expect(high.totalScore).toBeGreaterThan(low.totalScore);
  });
});
