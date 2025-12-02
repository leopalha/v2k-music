/**
 * Script para atualizar AI Scores de todas as tracks
 *
 * Uso: node scripts/update-ai-scores.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Constantes de benchmark
const BENCHMARKS = {
  streams: {
    poor: 1000,
    average: 10000,
    good: 50000,
    excellent: 200000,
    viral: 1000000,
  },
  holders: {
    poor: 1,
    average: 10,
    good: 50,
    excellent: 200,
  },
  volume24h: {
    poor: 0,
    average: 100,
    good: 500,
    excellent: 2000,
  },
};

function normalizeLog(value, min, max) {
  if (value <= min) return 0;
  if (value >= max) return 1;
  const logMin = Math.log(min + 1);
  const logMax = Math.log(max + 1);
  const logValue = Math.log(value + 1);
  return (logValue - logMin) / (logMax - logMin);
}

function normalizeLinear(value, min, max) {
  if (value <= min) return 0;
  if (value >= max) return 1;
  return (value - min) / (max - min);
}

function calculateStreamingScore(track) {
  const totalStreams = track.totalStreams || 0;
  const streamsNormalized = normalizeLog(totalStreams, BENCHMARKS.streams.poor, BENCHMARKS.streams.viral);

  let platformDiversityBonus = 0;
  const platforms = [
    track.spotifyStreams > 0,
    track.youtubeViews > 0,
    track.tiktokViews > 0,
  ].filter(Boolean).length;

  if (platforms >= 2) platformDiversityBonus = 0.1;
  if (platforms === 3) platformDiversityBonus = 0.2;

  return Math.min(40, streamsNormalized * 35 + platformDiversityBonus * 5);
}

function calculateEngagementScore(track, commentsCount, favoritesCount) {
  const holders = track.holders || 0;
  const holdersNormalized = normalizeLog(holders, BENCHMARKS.holders.poor, BENCHMARKS.holders.excellent);

  const engagementRatio = holders > 0 ? (commentsCount + favoritesCount) / holders : 0;
  const engagementNormalized = normalizeLinear(engagementRatio, 0, 2);

  return Math.min(20, holdersNormalized * 12 + engagementNormalized * 8);
}

function calculateMomentumScore(track) {
  const priceChange = track.priceChange24h || 0;
  const volume = track.volume24h || 0;
  const priceGrowth = track.initialPrice > 0
    ? ((track.currentPrice - track.initialPrice) / track.initialPrice) * 100
    : 0;

  const priceChangeNormalized = normalizeLinear(priceChange, -20, 50);
  const volumeNormalized = normalizeLog(volume, BENCHMARKS.volume24h.poor, BENCHMARKS.volume24h.excellent);
  const growthNormalized = normalizeLinear(priceGrowth, -50, 100);

  return Math.min(20, priceChangeNormalized * 8 + volumeNormalized * 6 + growthNormalized * 6);
}

function calculateQualityScore(track) {
  let score = 10;
  const durationMinutes = track.duration / 60;

  if (durationMinutes >= 2 && durationMinutes <= 4) {
    score += 5;
  } else if (durationMinutes >= 1.5 && durationMinutes <= 5) {
    score += 3;
  }

  if (track.bpm) {
    if (track.bpm >= 100 && track.bpm <= 140) {
      score += 5;
    } else if (track.bpm >= 80 && track.bpm <= 160) {
      score += 3;
    }
  } else {
    score += 2;
  }

  return Math.min(20, score);
}

function calculatePredictedROI(totalScore, track) {
  let baseROI = 0;
  if (totalScore >= 80) baseROI = 25;
  else if (totalScore >= 60) baseROI = 15;
  else if (totalScore >= 40) baseROI = 8;
  else if (totalScore >= 20) baseROI = 3;

  const momentumAdjust = (track.priceChange24h || 0) * 0.5;
  const volumeAdjust = track.volume24h > 500 ? 5 : track.volume24h > 100 ? 2 : 0;

  return Math.round((baseROI + momentumAdjust + volumeAdjust) * 10) / 10;
}

function calculateViralProbability(track, totalScore) {
  let probability = 0;
  probability += (totalScore / 100) * 0.4;

  if (track.tiktokViews > 100000) probability += 0.3;
  else if (track.tiktokViews > 10000) probability += 0.15;

  if (track.priceChange24h > 20) probability += 0.2;
  else if (track.priceChange24h > 10) probability += 0.1;

  const ageInDays = (Date.now() - new Date(track.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays < 7) probability += 0.1;
  else if (ageInDays < 30) probability += 0.05;

  return Math.min(1, Math.round(probability * 100) / 100);
}

async function updateAIScores() {
  console.log('🤖 Iniciando atualização de AI Scores...\n');

  try {
    // Buscar todas as tracks com contagem de comments e favorites
    const tracks = await prisma.track.findMany({
      include: {
        _count: {
          select: {
            comments: true,
            favorites: true,
          },
        },
      },
    });

    console.log(`📊 Encontradas ${tracks.length} tracks para analisar\n`);

    for (const track of tracks) {
      const commentsCount = track._count.comments;
      const favoritesCount = track._count.favorites;

      // Calcular scores
      const streamingScore = calculateStreamingScore(track);
      const engagementScore = calculateEngagementScore(track, commentsCount, favoritesCount);
      const momentumScore = calculateMomentumScore(track);
      const qualityScore = calculateQualityScore(track);

      const totalScore = Math.round(streamingScore + engagementScore + momentumScore + qualityScore);
      const predictedROI = calculatePredictedROI(totalScore, track);
      const viralProbability = calculateViralProbability(track, totalScore);

      // Atualizar track
      await prisma.track.update({
        where: { id: track.id },
        data: {
          aiScore: totalScore,
          predictedROI: predictedROI,
          viralProbability: viralProbability,
        },
      });

      console.log(`✅ ${track.title}`);
      console.log(`   Score: ${totalScore} | ROI: ${predictedROI}% | Viral: ${Math.round(viralProbability * 100)}%`);
      console.log(`   Breakdown: Streaming=${streamingScore.toFixed(1)} Engagement=${engagementScore.toFixed(1)} Momentum=${momentumScore.toFixed(1)} Quality=${qualityScore.toFixed(1)}`);
      console.log('');
    }

    console.log('✨ Atualização de AI Scores concluída!');

  } catch (error) {
    console.error('❌ Erro ao atualizar AI Scores:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateAIScores();
