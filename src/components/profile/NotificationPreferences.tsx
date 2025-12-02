"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Preferences {
  emailNotifications: boolean;
  notifyInvestments: boolean;
  notifyRoyalties: boolean;
  notifyPriceAlerts: boolean;
  notifyNewTracks: boolean;
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/notifications/preferences");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao carregar preferências");
      }

      setPreferences(data.preferences);
    } catch (error) {
      toast.error(
        "Erro ao carregar preferências",
        error instanceof Error ? error.message : "Tente novamente"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (key: keyof Preferences) => {
    if (!preferences) return;

    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    // Optimistic update
    setPreferences(newPreferences);

    try {
      setIsSaving(true);
      const res = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPreferences),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar preferências");
      }

      toast.success("Preferências atualizadas", "Suas configurações foram salvas");
    } catch (error) {
      // Revert on error
      setPreferences(preferences);
      toast.error(
        "Erro ao atualizar",
        error instanceof Error ? error.message : "Tente novamente"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!preferences) {
    return null;
  }

  const options = [
    {
      key: "emailNotifications" as keyof Preferences,
      label: "Notificações por Email",
      description: "Ativar/desativar todas as notificações por email",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      key: "notifyInvestments" as keyof Preferences,
      label: "Confirmações de Investimento",
      description: "Receber email quando um investimento for confirmado",
      disabled: !preferences.emailNotifications,
    },
    {
      key: "notifyRoyalties" as keyof Preferences,
      label: "Distribuição de Royalties",
      description: "Ser notificado quando receber novos royalties",
      disabled: !preferences.emailNotifications,
    },
    {
      key: "notifyPriceAlerts" as keyof Preferences,
      label: "Alertas de Preço",
      description: "Avisar sobre mudanças significativas de preço",
      disabled: !preferences.emailNotifications,
    },
    {
      key: "notifyNewTracks" as keyof Preferences,
      label: "Novas Músicas",
      description: "Receber email sobre novas músicas disponíveis",
      disabled: !preferences.emailNotifications,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          Preferências de Notificação
        </h3>
        <p className="text-sm text-text-secondary">
          Gerencie como você deseja ser notificado sobre atividades na plataforma
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.key}
            className={`bg-bg-elevated border border-border-subtle rounded-lg p-4 ${
              option.disabled ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {option.icon}
                  <h4 className="font-medium text-text-primary">{option.label}</h4>
                </div>
                <p className="text-sm text-text-secondary">{option.description}</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={preferences[option.key]}
                  onChange={() => handleToggle(option.key)}
                  disabled={option.disabled || isSaving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-bg-secondary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-400"></div>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-bg-secondary border border-border-subtle rounded-lg">
        <p className="text-xs text-text-tertiary">
          💡 <strong>Dica:</strong> Você pode gerenciar suas preferências de notificação
          a qualquer momento. Emails importantes (confirmações de transação) sempre
          serão enviados independente das configurações.
        </p>
      </div>
    </div>
  );
}
