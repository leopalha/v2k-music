"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Users, Trophy, Clock, CheckCircle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { ReferralCard } from "@/components/referrals/ReferralCard";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Referral {
  id: string;
  code: string;
  status: "PENDING" | "COMPLETED" | "REWARDED" | "CANCELLED";
  referrerReward: number;
  refereeReward: number;
  completedAt: string | null;
  rewardPaidAt: string | null;
  createdAt: string;
  referee: {
    id: string;
    name: string | null;
    email: string;
    profileImageUrl: string | null;
    createdAt: string;
  };
}

interface ReferralData {
  referralCode: string;
  referrals: Referral[];
  stats: {
    totalReferrals: number;
    pendingCount: number;
    completedCount: number;
    totalEarned: number;
    pendingRewards: number;
  };
  wasReferred: boolean;
}

export default function ReferralsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ReferralData | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const res = await fetch("/api/referrals");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Error fetching referrals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchReferrals();
    }
  }, [status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const getStatusBadge = (status: Referral["status"]) => {
    const styles = {
      PENDING: {
        bg: "bg-warning/10",
        text: "text-warning",
        icon: Clock,
        label: "Pendente",
      },
      COMPLETED: {
        bg: "bg-info/10",
        text: "text-info",
        icon: CheckCircle,
        label: "Completado",
      },
      REWARDED: {
        bg: "bg-success/10",
        text: "text-success",
        icon: Trophy,
        label: "Recompensado",
      },
      CANCELLED: {
        bg: "bg-error/10",
        text: "text-error",
        icon: Clock,
        label: "Cancelado",
      },
    };

    const style = styles[status];
    const Icon = style.icon;

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${style.bg}`}>
        <Icon className={`w-3.5 h-3.5 ${style.text}`} />
        <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Programa de Referência"
        subtitle="Convide amigos e ganhe recompensas juntos"
      />

      {/* Referral Card */}
      <ReferralCard
        referralCode={data.referralCode}
        totalReferrals={data.stats.totalReferrals}
        completedCount={data.stats.completedCount}
        totalEarned={data.stats.totalEarned}
      />

      {/* Referrals List */}
      <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Seus Referidos ({data.stats.totalReferrals})
        </h3>

        {data.referrals.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary font-medium mb-2">
              Nenhum referido ainda
            </p>
            <p className="text-sm text-text-tertiary">
              Compartilhe seu link e comece a ganhar recompensas!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.referrals.map((referral) => {
              const joinedAt = formatDistanceToNow(
                new Date(referral.referee.createdAt),
                { addSuffix: true, locale: ptBR }
              );

              const completedAt = referral.completedAt
                ? formatDistanceToNow(new Date(referral.completedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })
                : null;

              return (
                <div
                  key={referral.id}
                  className="bg-bg-elevated border border-border-subtle rounded-lg p-4 hover:border-primary-400/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-start gap-3 flex-1">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-secondary">
                          {referral.referee.profileImageUrl ? (
                            <Image
                              src={referral.referee.profileImageUrl}
                              alt={referral.referee.name || "User"}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-400 text-white text-lg font-bold">
                              {(referral.referee.name || referral.referee.email)[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary truncate">
                          {referral.referee.name || "Usuário"}
                        </p>
                        <p className="text-sm text-text-tertiary truncate">
                          {referral.referee.email}
                        </p>
                        <p className="text-xs text-text-tertiary mt-1">
                          Entrou {joinedAt}
                        </p>
                        {completedAt && (
                          <p className="text-xs text-success mt-0.5">
                            Primeiro investimento {completedAt}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status & Reward */}
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(referral.status)}
                      {(referral.status === "COMPLETED" || referral.status === "REWARDED") && (
                        <div className="text-right">
                          <p className="text-xs text-text-tertiary">Sua recompensa</p>
                          <p className="text-lg font-bold text-primary-400">
                            R$ {referral.referrerReward.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {referral.status === "PENDING" && (
                        <div className="text-right">
                          <p className="text-xs text-text-tertiary">Potencial</p>
                          <p className="text-sm font-medium text-warning">
                            R$ {referral.referrerReward.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Was Referred Banner */}
      {data.wasReferred && (
        <div className="bg-gradient-to-r from-primary-400/10 to-secondary-400/10 border border-primary-400/30 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-primary-400" />
            <div>
              <p className="font-medium text-text-primary">
                Você foi referido!
              </p>
              <p className="text-sm text-text-secondary">
                Parabéns por fazer parte do programa de referência V2K
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
