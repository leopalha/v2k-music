"use client";

import { useState } from "react";
import {
  Settings,
  Percent,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyTradeSettings {
  id: string;
  isActive: boolean;
  allocationPercent: number;
  maxPerTrade: number | null;
  copyBuys: boolean;
  copySells: boolean;
}

interface CopyTradingSettingsProps {
  copyTradeId: string;
  traderName: string;
  settings: CopyTradeSettings;
  onUpdate?: (settings: CopyTradeSettings) => void;
  onStop?: () => void;
}

export function CopyTradingSettings({
  copyTradeId,
  traderName,
  settings: initialSettings,
  onUpdate,
  onStop,
}: CopyTradingSettingsProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/copy-trading/${copyTradeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allocationPercent: settings.allocationPercent,
          maxPerTrade: settings.maxPerTrade,
          copyBuys: settings.copyBuys,
          copySells: settings.copySells,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar configurações");
      }

      toast.success("Configurações salvas");
      onUpdate?.(settings);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePause = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/copy-trading/${copyTradeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !settings.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status");
      }

      setSettings((prev) => ({ ...prev, isActive: !prev.isActive }));
      toast.success(
        settings.isActive ? "Copy trading pausado" : "Copy trading ativado"
      );
    } catch (error) {
      console.error("Error toggling pause:", error);
      toast.error("Erro ao atualizar status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (!confirm(`Tem certeza que deseja parar de copiar ${traderName}?`)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/copy-trading/${copyTradeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao encerrar copy trading");
      }

      toast.success("Copy trading encerrado");
      onStop?.();
    } catch (error) {
      console.error("Error stopping copy trading:", error);
      toast.error("Erro ao encerrar copy trading");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-bg-secondary border border-border-default p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-text-tertiary" />
        <h3 className="text-lg font-semibold text-text-primary">
          Configurações de Copy Trading
        </h3>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-bg-elevated">
        <div>
          <div className="text-sm text-text-tertiary">Status</div>
          <div className="flex items-center gap-2 mt-1">
            <div
              className={`w-2 h-2 rounded-full ${
                settings.isActive ? "bg-success" : "bg-warning"
              }`}
            />
            <span className="font-medium text-text-primary">
              {settings.isActive ? "Ativo" : "Pausado"}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTogglePause}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : settings.isActive ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pausar
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Ativar
            </>
          )}
        </Button>
      </div>

      {/* Settings Grid */}
      <div className="space-y-4">
        {/* Allocation Percent */}
        <div>
          <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
            <Percent className="w-4 h-4" />
            Alocação (% do saldo)
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={settings.allocationPercent}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                allocationPercent: parseInt(e.target.value),
              }))
            }
            className="w-full h-2 bg-bg-elevated rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-sm mt-1">
            <span className="text-text-tertiary">1%</span>
            <span className="font-medium text-primary">
              {settings.allocationPercent}%
            </span>
            <span className="text-text-tertiary">100%</span>
          </div>
        </div>

        {/* Max Per Trade */}
        <div>
          <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
            <DollarSign className="w-4 h-4" />
            Máximo por trade (opcional)
          </label>
          <input
            type="number"
            value={settings.maxPerTrade || ""}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                maxPerTrade: e.target.value ? parseFloat(e.target.value) : null,
              }))
            }
            placeholder="Sem limite"
            className="w-full px-4 py-2 rounded-lg bg-bg-elevated border border-border-default focus:border-primary focus:outline-none text-text-primary placeholder:text-text-tertiary"
          />
        </div>

        {/* Trade Types */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() =>
              setSettings((prev) => ({ ...prev, copyBuys: !prev.copyBuys }))
            }
            className={`p-4 rounded-lg border transition-all ${
              settings.copyBuys
                ? "bg-success/10 border-success/30 text-success"
                : "bg-bg-elevated border-border-default text-text-tertiary"
            }`}
          >
            <ArrowUpCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Copiar Compras</div>
          </button>
          <button
            onClick={() =>
              setSettings((prev) => ({ ...prev, copySells: !prev.copySells }))
            }
            className={`p-4 rounded-lg border transition-all ${
              settings.copySells
                ? "bg-error/10 border-error/30 text-error"
                : "bg-bg-elevated border-border-default text-text-tertiary"
            }`}
          >
            <ArrowDownCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Copiar Vendas</div>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-border-subtle">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Salvar Configurações"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleStop}
          disabled={isLoading}
          className="text-error border-error/30 hover:bg-error/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
