"use client";

import { calculateLevelProgress } from "@/lib/gamification/achievements";

interface LevelBadgeProps {
  level: number;
  xp: number;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
}

export function LevelBadge({
  level,
  xp,
  size = "md",
  showProgress = true,
}: LevelBadgeProps) {
  const levelProgress = calculateLevelProgress(xp);

  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-20 h-20 text-3xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Level Circle */}
      <div className="relative">
        {/* Progress Ring */}
        {showProgress && (
          <svg
            className={`${sizeClasses[size]} transform -rotate-90`}
            viewBox="0 0 100 100"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-bg-tertiary"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${
                2 * Math.PI * 45 * (1 - levelProgress.progress / 100)
              }`}
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className="text-primary-400" stopColor="currentColor" />
                <stop offset="100%" className="text-secondary-400" stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* Level Number */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            font-bold bg-gradient-to-br from-primary-400 to-secondary-400
            bg-clip-text text-transparent
            ${sizeClasses[size]}
          `}
        >
          {level}
        </div>
      </div>

      {/* XP Info */}
      {showProgress && (
        <div className="text-center">
          <div className="text-xs text-text-tertiary">
            {xp.toLocaleString()} / {levelProgress.nextLevelXP.toLocaleString()}{" "}
            XP
          </div>
          <div className="text-xs font-medium text-primary-400">
            Nível {levelProgress.nextLevel}
          </div>
        </div>
      )}
    </div>
  );
}
