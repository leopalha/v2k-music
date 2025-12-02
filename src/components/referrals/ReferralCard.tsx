"use client";

import { useState } from "react";
import { Users, Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui";
import { toast } from "sonner";

interface ReferralCardProps {
  referralCode: string;
  totalReferrals: number;
  completedCount: number;
  totalEarned: number;
}

export function ReferralCard({
  referralCode,
  totalReferrals,
  completedCount,
  totalEarned,
}: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const referralUrl = typeof window !== "undefined"
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : "";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success("Link copiado!");
  };

  const handleShare = (platform: "twitter" | "whatsapp" | "facebook") => {
    const text = `Junte-se a V2K e ganhe R$ 10 de bônus! Use meu código: ${referralCode}`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(referralUrl);

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  return (
    <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Programa de Referência
          </h3>
          <p className="text-sm text-text-tertiary">
            Convide amigos e ganhe recompensas
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-bg-elevated rounded-lg p-4">
          <p className="text-xs text-text-tertiary mb-1">Total Referidos</p>
          <p className="text-2xl font-bold text-text-primary">
            {totalReferrals}
          </p>
        </div>
        <div className="bg-bg-elevated rounded-lg p-4">
          <p className="text-xs text-text-tertiary mb-1">Completados</p>
          <p className="text-2xl font-bold text-success">
            {completedCount}
          </p>
        </div>
        <div className="bg-bg-elevated rounded-lg p-4">
          <p className="text-xs text-text-tertiary mb-1">Total Ganho</p>
          <p className="text-2xl font-bold text-primary-400">
            R$ {totalEarned.toFixed(2)}
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-bg-elevated rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-text-primary mb-2">
          Como funciona:
        </p>
        <ul className="space-y-1 text-xs text-text-secondary">
          <li>• Seu amigo ganha <strong className="text-success">R$ 10</strong> ao se cadastrar</li>
          <li>• Você ganha <strong className="text-primary-400">R$ 5</strong> quando ele fizer o primeiro investimento</li>
          <li>• Sem limite de convites!</li>
        </ul>
      </div>

      {/* Referral Code */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Seu Código de Referência
        </label>
        <div className="flex gap-2">
          <div className="flex-1 bg-bg-elevated border border-border-default rounded-lg px-4 py-3 font-mono text-lg font-semibold text-text-primary">
            {referralCode}
          </div>
          <Button
            variant="outline"
            size="md"
            onClick={handleCopyCode}
            className="px-4"
          >
            {copied ? (
              <Check className="w-5 h-5 text-success" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Referral URL */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Link de Convite
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralUrl}
            readOnly
            className="flex-1 bg-bg-elevated border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar
          </Button>
        </div>
      </div>

      {/* Share Buttons */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Compartilhar
        </label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("twitter")}
            className="flex-1"
            style={{
              borderColor: "#1DA1F2",
              color: "#1DA1F2",
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Twitter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("whatsapp")}
            className="flex-1"
            style={{
              borderColor: "#25D366",
              color: "#25D366",
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("facebook")}
            className="flex-1"
            style={{
              borderColor: "#1877F2",
              color: "#1877F2",
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Facebook
          </Button>
        </div>
      </div>
    </div>
  );
}
