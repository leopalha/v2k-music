"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check, Twitter, MessageCircle, Linkedin, Lock, Unlock } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { toast } from "sonner";

interface ShareSettings {
  portfolioPublic: boolean;
  shareSlug: string | null;
  showHoldings: boolean;
  showPerformance: boolean;
}

export function ShareCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ShareSettings | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/portfolio/sharing");
      const data = await res.json();

      if (res.ok) {
        setSettings(data.settings);
        setShareUrl(data.shareUrl);
      }
    } catch (error) {
      console.error("Error loading share settings:", error);
    }
  };

  const handleTogglePublic = async () => {
    if (!settings) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/portfolio/sharing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolioPublic: !settings.portfolioPublic,
          generateSlug: !settings.shareSlug && !settings.portfolioPublic, // Generate slug when making public
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setSettings(data.settings);
      setShareUrl(data.shareUrl);
      toast.success(
        data.settings.portfolioPublic
          ? "Portfolio público! Compartilhe com seus amigos."
          : "Portfolio privado. Apenas você pode visualizar."
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSetting = async (key: "showHoldings" | "showPerformance") => {
    if (!settings) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/portfolio/sharing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [key]: !settings[key],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setSettings(data.settings);
      toast.success("Configuração atualizada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copiado!");

    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    if (!shareUrl) return;

    const text = "Confira meu portfolio de investimentos em música na V2K! 🎵💰";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleShareWhatsApp = () => {
    if (!shareUrl) return;

    const text = `Confira meu portfolio de investimentos em música na V2K! 🎵💰\n\n${shareUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleShareLinkedIn = () => {
    if (!shareUrl) return;

    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(url, "_blank", "width=600,height=600");
  };

  if (!settings) return null;

  return (
    <>
      <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                settings.portfolioPublic
                  ? "bg-success/10 text-success"
                  : "bg-bg-elevated text-text-tertiary"
              }`}
            >
              {settings.portfolioPublic ? (
                <Unlock className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Compartilhar Portfolio
              </h3>
              <p className="text-sm text-text-tertiary">
                {settings.portfolioPublic
                  ? "Seu portfolio está público"
                  : "Torne público para compartilhar"}
              </p>
            </div>
          </div>

          <Button
            variant={settings.portfolioPublic ? "outline" : "primary"}
            size="sm"
            onClick={handleTogglePublic}
            disabled={isLoading}
          >
            {settings.portfolioPublic ? "Tornar Privado" : "Tornar Público"}
          </Button>
        </div>

        {settings.portfolioPublic && shareUrl && (
          <>
            {/* Share URL */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-text-secondary mb-2">
                Link de Compartilhamento
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-sm text-text-primary"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={handleShareTwitter}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>

              <button
                onClick={handleShareLinkedIn}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </button>
            </div>

            {/* Privacy Settings */}
            <div className="pt-4 border-t border-border-subtle">
              <h4 className="text-sm font-medium text-text-secondary mb-3">
                O que compartilhar
              </h4>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-bg-elevated rounded-lg cursor-pointer hover:bg-bg-elevated/80 transition-colors">
                  <span className="text-sm text-text-primary">Mostrar holdings</span>
                  <input
                    type="checkbox"
                    checked={settings.showHoldings}
                    onChange={() => handleToggleSetting("showHoldings")}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-border-default text-primary-400 focus:ring-2 focus:ring-primary-400"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-bg-elevated rounded-lg cursor-pointer hover:bg-bg-elevated/80 transition-colors">
                  <span className="text-sm text-text-primary">
                    Mostrar performance
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.showPerformance}
                    onChange={() => handleToggleSetting("showPerformance")}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-border-default text-primary-400 focus:ring-2 focus:ring-primary-400"
                  />
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
