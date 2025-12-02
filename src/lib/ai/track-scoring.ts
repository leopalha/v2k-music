/**
 * V2K AI Track Scoring Engine
 *
 * Calcula um score de 0-100 para cada track baseado em múltiplos fatores:
 * - Performance de streaming (40%)
 * - Engajamento social (20%)
 * - Momentum de mercado (20%)
 * - Métricas de qualidade (20%)
 */

export interface TrackMetrics {
  // Streaming metrics
  totalStreams: number;
  spotifyStreams: number;
  youtubeViews: number;
  tiktokViews: number;

  // Market metrics
  currentPrice: number;
  initialPrice: number;
  priceChange24h: number;
  volume24h: number;
  holders: number;
  marketCap: number;

  // Quality metrics
  duration: number; // em segundos
  bpm?: number | null;

  // Time metrics
  createdAt: Date;

  // Social metrics
  commentsCount?: number;
  favoritesCount?: number;
}

export interface ScoringResult {
  totalScore: number; // 0-100
  breakdown: {
    streamingScore: number;    // 0-40
    engagementScore: number;   // 0-20
    momentumScore: number;     // 0-20
    qualityScore: number;      // 0-20
  };
  predictedROI: number;        // % estimado
  viralProbability: number;    // 0-1
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  insights: string[];
}

// Constantes de benchmark (médias do mercado)
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
  priceGrowth: {
    poor: -20,
    average: 0,
    good: 10,
    excellent: 50,
  },
};

/**
 * Normaliza um valor para uma escala de 0-1 usando uma curva logarítmica
 */
function normalizeLog(value: number, min: number, max: number): number {
  if (value <= min) return 0;
  if (value >= max) return 1;

  const logMin = Math.log(min + 1);
  const logMax = Math.log(max + 1);
  const logValue = Math.log(value + 1);

  return (logValue - logMin) / (logMax - logMin);
}

/**
 * Normaliza um valor para uma escala de 0-1 usando uma curva linear
 */
function normalizeLinear(value: number, min: number, max: number): number {
  if (value <= min) return 0;
  if (value >= max) return 1;
  return (value - min) / (max - min);
}

/**
 * Calcula o score de streaming (0-40 pontos)
 */
function calculateStreamingScore(metrics: TrackMetrics): number {
  const totalStreams = metrics.totalStreams || 0;
  const spotifyWeight = 0.5;
  const youtubeWeight = 0.3;
  const tiktokWeight = 0.2;

  // Score baseado em streams totais
  const streamsNormalized = normalizeLog(
    totalStreams,
    BENCHMARKS.streams.poor,
    BENCHMARKS.streams.viral
  );

  // Bônus por diversificação de plataformas
  let platformDiversityBonus = 0;
  const platforms = [
    metrics.spotifyStreams > 0,
    metrics.youtubeViews > 0,
    metrics.tiktokViews > 0,
  ].filter(Boolean).length;

  if (platforms >= 2) platformDiversityBonus = 0.1;
  if (platforms === 3) platformDiversityBonus = 0.2;

  const baseScore = streamsNormalized * 35;
  const diversityScore = platformDiversityBonus * 5;

  return Math.min(40, baseScore + diversityScore);
}

/**
 * Calcula o score de engajamento social (0-20 pontos)
 */
function calculateEngagementScore(metrics: TrackMetrics): number {
  const holders = metrics.holders || 0;
  const comments = metrics.commentsCount || 0;
  const favorites = metrics.favoritesCount || 0;

  // Holders score (mais importante)
  const holdersNormalized = normalizeLog(
    holders,
    BENCHMARKS.holders.poor,
    BENCHMARKS.holders.excellent
  );

  // Engagement ratio (comments + favorites per holder)
  const engagementRatio = holders > 0
    ? (comments + favorites) / holders
    : 0;
  const engagementNormalized = normalizeLinear(engagementRatio, 0, 2);

  const holdersScore = holdersNormalized * 12;
  const engagementScore = engagementNormalized * 8;

  return Math.min(20, holdersScore + engagementScore);
}

/**
 * Calcula o score de momentum de mercado (0-20 pontos)
 */
function calculateMomentumScore(metrics: TrackMetrics): number {
  const priceChange = metrics.priceChange24h || 0;
  const volume = metrics.volume24h || 0;
  const priceGrowth = metrics.initialPrice > 0
    ? ((metrics.currentPrice - metrics.initialPrice) / metrics.initialPrice) * 100
    : 0;

  // Price change 24h score
  const priceChangeNormalized = normalizeLinear(
    priceChange,
    BENCHMARKS.priceGrowth.poor,
    BENCHMARKS.priceGrowth.excellent
  );

  // Volume score
  const volumeNormalized = normalizeLog(
    volume,
    BENCHMARKS.volume24h.poor,
    BENCHMARKS.volume24h.excellent
  );

  // Overall price growth score
  const growthNormalized = normalizeLinear(priceGrowth, -50, 100);

  const priceChangeScore = priceChangeNormalized * 8;
  const volumeScore = volumeNormalized * 6;
  const growthScore = growthNormalized * 6;

  return Math.min(20, priceChangeScore + volumeScore + growthScore);
}

/**
 * Calcula o score de qualidade (0-20 pontos)
 */
function calculateQualityScore(metrics: TrackMetrics): number {
  let score = 10; // Base score

  // Duração ideal: 2-4 minutos
  const durationMinutes = metrics.duration / 60;
  if (durationMinutes >= 2 && durationMinutes <= 4) {
    score += 5;
  } else if (durationMinutes >= 1.5 && durationMinutes <= 5) {
    score += 3;
  }

  // BPM em range popular (100-140)
  if (metrics.bpm) {
    if (metrics.bpm >= 100 && metrics.bpm <= 140) {
      score += 5;
    } else if (metrics.bpm >= 80 && metrics.bpm <= 160) {
      score += 3;
    }
  } else {
    score += 2; // Valor neutro se não tiver BPM
  }

  return Math.min(20, score);
}

/**
 * Calcula o ROI previsto baseado no score
 */
function calculatePredictedROI(totalScore: number, metrics: TrackMetrics): number {
  // Base ROI baseado no score
  let baseROI = 0;

  if (totalScore >= 80) baseROI = 25;      // Excelente
  else if (totalScore >= 60) baseROI = 15; // Bom
  else if (totalScore >= 40) baseROI = 8;  // Médio
  else if (totalScore >= 20) baseROI = 3;  // Baixo
  else baseROI = 0;                         // Muito baixo

  // Ajuste baseado no momentum atual
  const momentumAdjust = metrics.priceChange24h * 0.5;

  // Ajuste baseado no volume
  const volumeAdjust = metrics.volume24h > 500 ? 5 :
                       metrics.volume24h > 100 ? 2 : 0;

  return Math.round((baseROI + momentumAdjust + volumeAdjust) * 10) / 10;
}

/**
 * Calcula a probabilidade viral (0-1)
 */
function calculateViralProbability(metrics: TrackMetrics, totalScore: number): number {
  let probability = 0;

  // Score alto aumenta probabilidade
  probability += (totalScore / 100) * 0.4;

  // TikTok views são indicador forte de viralidade
  if (metrics.tiktokViews > 100000) {
    probability += 0.3;
  } else if (metrics.tiktokViews > 10000) {
    probability += 0.15;
  }

  // Crescimento rápido indica potencial viral
  if (metrics.priceChange24h > 20) {
    probability += 0.2;
  } else if (metrics.priceChange24h > 10) {
    probability += 0.1;
  }

  // Track recente tem mais potencial
  const ageInDays = (Date.now() - new Date(metrics.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays < 7) {
    probability += 0.1;
  } else if (ageInDays < 30) {
    probability += 0.05;
  }

  return Math.min(1, Math.round(probability * 100) / 100);
}

/**
 * Determina o nível de risco
 */
function calculateRiskLevel(metrics: TrackMetrics, totalScore: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  // Fatores de risco
  let riskFactors = 0;

  // Score baixo = mais risco
  if (totalScore < 30) riskFactors += 2;
  else if (totalScore < 50) riskFactors += 1;

  // Poucos holders = mais risco (menos liquidez)
  if (metrics.holders < 5) riskFactors += 2;
  else if (metrics.holders < 20) riskFactors += 1;

  // Baixo volume = mais risco
  if (metrics.volume24h < 50) riskFactors += 1;

  // Queda de preço = mais risco
  if (metrics.priceChange24h < -10) riskFactors += 2;
  else if (metrics.priceChange24h < 0) riskFactors += 1;

  // Poucos streams = mais incerteza
  if (metrics.totalStreams < 5000) riskFactors += 1;

  if (riskFactors >= 5) return 'HIGH';
  if (riskFactors >= 2) return 'MEDIUM';
  return 'LOW';
}

/**
 * Gera insights baseados na análise
 */
function generateInsights(metrics: TrackMetrics, result: Omit<ScoringResult, 'insights'>): string[] {
  const insights: string[] = [];

  // Insight de streaming
  if (result.breakdown.streamingScore >= 30) {
    insights.push('Excelente performance de streaming - track com alta visibilidade');
  } else if (result.breakdown.streamingScore >= 20) {
    insights.push('Boa performance de streaming - crescimento consistente');
  } else if (result.breakdown.streamingScore < 10) {
    insights.push('Streaming abaixo da média - potencial de crescimento limitado');
  }

  // Insight de engajamento
  if (metrics.holders >= 50) {
    insights.push('Base sólida de holders - boa liquidez');
  } else if (metrics.holders < 10) {
    insights.push('Poucos holders - liquidez pode ser limitada');
  }

  // Insight de momentum
  if (metrics.priceChange24h > 10) {
    insights.push('Momentum positivo forte - track em alta demanda');
  } else if (metrics.priceChange24h < -10) {
    insights.push('Correção de preço em andamento - possível oportunidade de entrada');
  }

  // Insight de viralidade
  if (result.viralProbability > 0.5) {
    insights.push('Alto potencial viral - indicadores favoráveis');
  }

  // Insight de risco
  if (result.riskLevel === 'LOW') {
    insights.push('Perfil de risco baixo - investimento mais conservador');
  } else if (result.riskLevel === 'HIGH') {
    insights.push('Alto risco - recomendado para investidores experientes');
  }

  // Insight de ROI
  if (result.predictedROI >= 20) {
    insights.push(`ROI estimado de ${result.predictedROI}% - retorno potencial acima da média`);
  } else if (result.predictedROI >= 10) {
    insights.push(`ROI estimado de ${result.predictedROI}% - retorno potencial moderado`);
  }

  return insights.slice(0, 4); // Máximo 4 insights
}

/**
 * Função principal de scoring
 */
export function calculateTrackScore(metrics: TrackMetrics): ScoringResult {
  const streamingScore = calculateStreamingScore(metrics);
  const engagementScore = calculateEngagementScore(metrics);
  const momentumScore = calculateMomentumScore(metrics);
  const qualityScore = calculateQualityScore(metrics);

  const totalScore = Math.round(streamingScore + engagementScore + momentumScore + qualityScore);

  const predictedROI = calculatePredictedROI(totalScore, metrics);
  const viralProbability = calculateViralProbability(metrics, totalScore);
  const riskLevel = calculateRiskLevel(metrics, totalScore);

  const breakdown = {
    streamingScore: Math.round(streamingScore * 10) / 10,
    engagementScore: Math.round(engagementScore * 10) / 10,
    momentumScore: Math.round(momentumScore * 10) / 10,
    qualityScore: Math.round(qualityScore * 10) / 10,
  };

  const resultWithoutInsights = {
    totalScore,
    breakdown,
    predictedROI,
    viralProbability,
    riskLevel,
  };

  const insights = generateInsights(metrics, resultWithoutInsights);

  return {
    ...resultWithoutInsights,
    insights,
  };
}

/**
 * Classifica o score em uma categoria
 */
export function getScoreCategory(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 80) {
    return {
      label: 'Excelente',
      color: 'emerald',
      description: 'Track com métricas excepcionais e alto potencial',
    };
  }
  if (score >= 60) {
    return {
      label: 'Bom',
      color: 'green',
      description: 'Track com bom desempenho e potencial sólido',
    };
  }
  if (score >= 40) {
    return {
      label: 'Regular',
      color: 'yellow',
      description: 'Track com desempenho médio',
    };
  }
  if (score >= 20) {
    return {
      label: 'Baixo',
      color: 'orange',
      description: 'Track com métricas abaixo da média',
    };
  }
  return {
    label: 'Muito Baixo',
    color: 'red',
    description: 'Track com métricas muito baixas - alto risco',
  };
}
