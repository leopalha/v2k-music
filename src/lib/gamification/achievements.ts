import { AchievementType, AchievementTier } from "@prisma/client";

export interface AchievementDefinition {
  type: AchievementType;
  tier: AchievementTier;
  title: string;
  description: string;
  points: number;
  target: number;
  icon: string;
}

// Achievement definitions with tiers
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // FIRST_INVESTMENT (one-time achievement)
  {
    type: "FIRST_INVESTMENT",
    tier: "BRONZE",
    title: "Primeiro Passo",
    description: "Realize seu primeiro investimento",
    points: 10,
    target: 1,
    icon: "rocket",
  },

  // TOTAL_INVESTED tiers
  {
    type: "TOTAL_INVESTED",
    tier: "BRONZE",
    title: "Investidor Iniciante",
    description: "Invista R$ 100 no total",
    points: 20,
    target: 100,
    icon: "coins",
  },
  {
    type: "TOTAL_INVESTED",
    tier: "SILVER",
    title: "Investidor Comprometido",
    description: "Invista R$ 1.000 no total",
    points: 50,
    target: 1000,
    icon: "coins",
  },
  {
    type: "TOTAL_INVESTED",
    tier: "GOLD",
    title: "Investidor Sério",
    description: "Invista R$ 10.000 no total",
    points: 100,
    target: 10000,
    icon: "coins",
  },
  {
    type: "TOTAL_INVESTED",
    tier: "PLATINUM",
    title: "Grande Investidor",
    description: "Invista R$ 50.000 no total",
    points: 250,
    target: 50000,
    icon: "coins",
  },
  {
    type: "TOTAL_INVESTED",
    tier: "DIAMOND",
    title: "Investidor Elite",
    description: "Invista R$ 100.000 no total",
    points: 500,
    target: 100000,
    icon: "coins",
  },

  // PROFIT_EARNED tiers
  {
    type: "PROFIT_EARNED",
    tier: "BRONZE",
    title: "Primeiro Lucro",
    description: "Ganhe R$ 10 em lucros",
    points: 15,
    target: 10,
    icon: "trending-up",
  },
  {
    type: "PROFIT_EARNED",
    tier: "SILVER",
    title: "Lucrativo",
    description: "Ganhe R$ 100 em lucros",
    points: 40,
    target: 100,
    icon: "trending-up",
  },
  {
    type: "PROFIT_EARNED",
    tier: "GOLD",
    title: "Alto Rendimento",
    description: "Ganhe R$ 1.000 em lucros",
    points: 80,
    target: 1000,
    icon: "trending-up",
  },
  {
    type: "PROFIT_EARNED",
    tier: "PLATINUM",
    title: "Mestre dos Lucros",
    description: "Ganhe R$ 10.000 em lucros",
    points: 200,
    target: 10000,
    icon: "trending-up",
  },
  {
    type: "PROFIT_EARNED",
    tier: "DIAMOND",
    title: "Rei dos Lucros",
    description: "Ganhe R$ 50.000 em lucros",
    points: 400,
    target: 50000,
    icon: "trending-up",
  },

  // TOTAL_TRADES tiers
  {
    type: "TOTAL_TRADES",
    tier: "BRONZE",
    title: "Trader Novato",
    description: "Complete 10 negociações",
    points: 10,
    target: 10,
    icon: "repeat",
  },
  {
    type: "TOTAL_TRADES",
    tier: "SILVER",
    title: "Trader Ativo",
    description: "Complete 50 negociações",
    points: 30,
    target: 50,
    icon: "repeat",
  },
  {
    type: "TOTAL_TRADES",
    tier: "GOLD",
    title: "Trader Experiente",
    description: "Complete 200 negociações",
    points: 60,
    target: 200,
    icon: "repeat",
  },
  {
    type: "TOTAL_TRADES",
    tier: "PLATINUM",
    title: "Trader Profissional",
    description: "Complete 1.000 negociações",
    points: 150,
    target: 1000,
    icon: "repeat",
  },
  {
    type: "TOTAL_TRADES",
    tier: "DIAMOND",
    title: "Trader Lendário",
    description: "Complete 5.000 negociações",
    points: 300,
    target: 5000,
    icon: "repeat",
  },

  // PORTFOLIO_DIVERSITY tiers
  {
    type: "PORTFOLIO_DIVERSITY",
    tier: "BRONZE",
    title: "Diversificador",
    description: "Invista em 3 músicas diferentes",
    points: 15,
    target: 3,
    icon: "layers",
  },
  {
    type: "PORTFOLIO_DIVERSITY",
    tier: "SILVER",
    title: "Portfólio Balanceado",
    description: "Invista em 10 músicas diferentes",
    points: 35,
    target: 10,
    icon: "layers",
  },
  {
    type: "PORTFOLIO_DIVERSITY",
    tier: "GOLD",
    title: "Portfólio Diverso",
    description: "Invista em 25 músicas diferentes",
    points: 70,
    target: 25,
    icon: "layers",
  },
  {
    type: "PORTFOLIO_DIVERSITY",
    tier: "PLATINUM",
    title: "Colecionador",
    description: "Invista em 50 músicas diferentes",
    points: 150,
    target: 50,
    icon: "layers",
  },

  // FOLLOWERS_COUNT tiers
  {
    type: "FOLLOWERS_COUNT",
    tier: "BRONZE",
    title: "Influencer Iniciante",
    description: "Consiga 10 seguidores",
    points: 10,
    target: 10,
    icon: "users",
  },
  {
    type: "FOLLOWERS_COUNT",
    tier: "SILVER",
    title: "Comunidade Crescente",
    description: "Consiga 50 seguidores",
    points: 25,
    target: 50,
    icon: "users",
  },
  {
    type: "FOLLOWERS_COUNT",
    tier: "GOLD",
    title: "Influencer Popular",
    description: "Consiga 200 seguidores",
    points: 60,
    target: 200,
    icon: "users",
  },
  {
    type: "FOLLOWERS_COUNT",
    tier: "PLATINUM",
    title: "Influencer Famoso",
    description: "Consiga 1.000 seguidores",
    points: 150,
    target: 1000,
    icon: "users",
  },

  // LOGIN_STREAK tiers
  {
    type: "LOGIN_STREAK",
    tier: "BRONZE",
    title: "Dedicado",
    description: "Login por 7 dias consecutivos",
    points: 15,
    target: 7,
    icon: "calendar",
  },
  {
    type: "LOGIN_STREAK",
    tier: "SILVER",
    title: "Comprometido",
    description: "Login por 30 dias consecutivos",
    points: 40,
    target: 30,
    icon: "calendar",
  },
  {
    type: "LOGIN_STREAK",
    tier: "GOLD",
    title: "Disciplinado",
    description: "Login por 90 dias consecutivos",
    points: 100,
    target: 90,
    icon: "calendar",
  },
  {
    type: "LOGIN_STREAK",
    tier: "PLATINUM",
    title: "Inabalável",
    description: "Login por 365 dias consecutivos",
    points: 300,
    target: 365,
    icon: "calendar",
  },

  // ROYALTIES_EARNED tiers
  {
    type: "ROYALTIES_EARNED",
    tier: "BRONZE",
    title: "Primeiros Royalties",
    description: "Ganhe R$ 10 em royalties",
    points: 15,
    target: 10,
    icon: "dollar-sign",
  },
  {
    type: "ROYALTIES_EARNED",
    tier: "SILVER",
    title: "Renda Passiva",
    description: "Ganhe R$ 100 em royalties",
    points: 40,
    target: 100,
    icon: "dollar-sign",
  },
  {
    type: "ROYALTIES_EARNED",
    tier: "GOLD",
    title: "Dinheiro Recorrente",
    description: "Ganhe R$ 1.000 em royalties",
    points: 80,
    target: 1000,
    icon: "dollar-sign",
  },
  {
    type: "ROYALTIES_EARNED",
    tier: "PLATINUM",
    title: "Fonte de Renda",
    description: "Ganhe R$ 10.000 em royalties",
    points: 200,
    target: 10000,
    icon: "dollar-sign",
  },

  // WHALE (special achievement)
  {
    type: "WHALE",
    tier: "DIAMOND",
    title: "Baleia",
    description: "Tenha um portfólio avaliado em R$ 100.000+",
    points: 500,
    target: 100000,
    icon: "crown",
  },

  // EARLY_ADOPTER (special achievement)
  {
    type: "EARLY_ADOPTER",
    tier: "GOLD",
    title: "Early Adopter",
    description: "Seja um dos primeiros 100 usuários",
    points: 100,
    target: 1,
    icon: "star",
  },

  // DIAMOND_HANDS (special achievement)
  {
    type: "DIAMOND_HANDS",
    tier: "GOLD",
    title: "Diamond Hands",
    description: "Mantenha um investimento por 1 ano",
    points: 150,
    target: 365,
    icon: "gem",
  },
];

// Get achievement definition
export function getAchievementDefinition(
  type: AchievementType,
  tier: AchievementTier
): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find(
    (def) => def.type === type && def.tier === tier
  );
}

// Get all achievements for a type (all tiers)
export function getAchievementsByType(
  type: AchievementType
): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter((def) => def.type === type);
}

// Calculate XP from level
export function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Calculate level from XP
export function calculateLevelFromXP(xp: number): number {
  let level = 1;
  let requiredXP = 100;

  while (xp >= requiredXP) {
    level++;
    requiredXP = calculateXPForLevel(level);
  }

  return level;
}

// Calculate progress to next level
export function calculateLevelProgress(xp: number): {
  currentLevel: number;
  nextLevel: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  const currentLevel = calculateLevelFromXP(xp);
  const nextLevel = currentLevel + 1;
  const currentLevelXP = calculateXPForLevel(currentLevel);
  const nextLevelXP = calculateXPForLevel(nextLevel);
  const xpIntoLevel = xp - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const progress = (xpIntoLevel / xpNeededForLevel) * 100;

  return {
    currentLevel,
    nextLevel,
    currentLevelXP,
    nextLevelXP,
    progress: Math.min(100, Math.max(0, progress)),
  };
}

// Get tier color for UI
export function getTierColor(tier: AchievementTier): string {
  const colors: Record<AchievementTier, string> = {
    BRONZE: "text-orange-600",
    SILVER: "text-gray-400",
    GOLD: "text-yellow-500",
    PLATINUM: "text-cyan-400",
    DIAMOND: "text-blue-400",
  };
  return colors[tier];
}

// Get tier badge color for UI
export function getTierBadgeColor(tier: AchievementTier): string {
  const colors: Record<AchievementTier, string> = {
    BRONZE: "bg-orange-600/10 text-orange-600 border-orange-600/20",
    SILVER: "bg-gray-400/10 text-gray-400 border-gray-400/20",
    GOLD: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    PLATINUM: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
    DIAMOND: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  };
  return colors[tier];
}
