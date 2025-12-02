"use client";

import { useState, useEffect } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button, Badge } from "@/components/ui";
import { Bell, Trash2, Power, PowerOff, TrendingUp, TrendingDown, Plus, Mail, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

interface PriceAlert {
  id: string;
  targetPrice: number;
  condition: "ABOVE" | "BELOW";
  percentChange: number | null;
  isActive: boolean;
  triggered: boolean;
  triggeredAt: Date | null;
  lastChecked: Date | null;
  notifyEmail: boolean;
  notifyPush: boolean;
  createdAt: Date;
  track: {
    id: string;
    title: string;
    artistName: string;
    coverUrl: string | null;
    currentPrice: number;
  };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/alerts");

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();
      setAlerts(data.alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast.error("Erro ao carregar alertas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Delete alert
  const handleDelete = async (alertId: string) => {
    if (!confirm("Tem certeza que deseja excluir este alerta?")) {
      return;
    }

    try {
      setDeletingId(alertId);
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete alert");
      }

      toast.success("Alerta excluído com sucesso!");
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast.error("Erro ao excluir alerta");
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle alert active status
  const handleToggle = async (alertId: string, currentStatus: boolean) => {
    try {
      setTogglingId(alertId);
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle alert");
      }

      const data = await response.json();
      toast.success(data.alert.isActive ? "Alerta ativado!" : "Alerta pausado!");

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, isActive: data.alert.isActive } : alert
        )
      );
    } catch (error) {
      console.error("Error toggling alert:", error);
      toast.error("Erro ao atualizar alerta");
    } finally {
      setTogglingId(null);
    }
  };

  // Calculate price difference
  const calculatePriceDiff = (alert: PriceAlert) => {
    const diff = alert.targetPrice - alert.track.currentPrice;
    const percentDiff = ((diff / alert.track.currentPrice) * 100).toFixed(1);
    return { diff, percentDiff };
  };

  // Categorize alerts
  const activeAlerts = alerts.filter((a) => a.isActive && !a.triggered);
  const triggeredAlerts = alerts.filter((a) => a.triggered);
  const pausedAlerts = alerts.filter((a) => !a.isActive && !a.triggered);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Alertas de Preço"
          subtitle="Receba notificações quando o preço das músicas atingir seus objetivos"
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-bg-secondary border border-border-default rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total de Alertas</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{alerts.length}</p>
              </div>
              <Bell className="w-8 h-8 text-text-tertiary" />
            </div>
          </div>

          <div className="bg-bg-secondary border border-border-default rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Ativos</p>
                <p className="text-2xl font-bold text-success mt-1">{activeAlerts.length}</p>
              </div>
              <Power className="w-8 h-8 text-success" />
            </div>
          </div>

          <div className="bg-bg-secondary border border-border-default rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Disparados</p>
                <p className="text-2xl font-bold text-warning mt-1">{triggeredAlerts.length}</p>
              </div>
              <Bell className="w-8 h-8 text-warning" />
            </div>
          </div>

          <div className="bg-bg-secondary border border-border-default rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Pausados</p>
                <p className="text-2xl font-bold text-text-tertiary mt-1">{pausedAlerts.length}</p>
              </div>
              <PowerOff className="w-8 h-8 text-text-tertiary" />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!isLoading && alerts.length === 0 && (
          <div className="bg-bg-secondary border border-border-default rounded-lg p-12 text-center">
            <Bell className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Nenhum alerta configurado
            </h3>
            <p className="text-text-secondary mb-6">
              Configure alertas de preço para ser notificado quando uma música atingir o valor desejado
            </p>
            <Link href="/marketplace">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Explorar Marketplace
              </Button>
            </Link>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-text-secondary">Carregando alertas...</p>
          </div>
        )}

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Power className="w-5 h-5 text-success" />
              Alertas Ativos ({activeAlerts.length})
            </h2>
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  priceDiff={calculatePriceDiff(alert)}
                  onDelete={() => handleDelete(alert.id)}
                  onToggle={() => handleToggle(alert.id, alert.isActive)}
                  isDeleting={deletingId === alert.id}
                  isToggling={togglingId === alert.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Triggered Alerts */}
        {triggeredAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-warning" />
              Alertas Disparados ({triggeredAlerts.length})
            </h2>
            <div className="space-y-3">
              {triggeredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  priceDiff={calculatePriceDiff(alert)}
                  onDelete={() => handleDelete(alert.id)}
                  onToggle={() => handleToggle(alert.id, alert.isActive)}
                  isDeleting={deletingId === alert.id}
                  isToggling={togglingId === alert.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Paused Alerts */}
        {pausedAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <PowerOff className="w-5 h-5 text-text-tertiary" />
              Alertas Pausados ({pausedAlerts.length})
            </h2>
            <div className="space-y-3">
              {pausedAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  priceDiff={calculatePriceDiff(alert)}
                  onDelete={() => handleDelete(alert.id)}
                  onToggle={() => handleToggle(alert.id, alert.isActive)}
                  isDeleting={deletingId === alert.id}
                  isToggling={togglingId === alert.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

interface AlertCardProps {
  alert: PriceAlert;
  priceDiff: { diff: number; percentDiff: string };
  onDelete: () => void;
  onToggle: () => void;
  isDeleting: boolean;
  isToggling: boolean;
}

function AlertCard({ alert, priceDiff, onDelete, onToggle, isDeleting, isToggling }: AlertCardProps) {
  return (
    <div className="bg-bg-secondary border border-border-default rounded-lg p-4 hover:border-border-hover transition-colors">
      <div className="flex items-start gap-4">
        {/* Track Cover */}
        {alert.track.coverUrl && (
          <img
            src={alert.track.coverUrl}
            alt={alert.track.title}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        )}
        {!alert.track.coverUrl && (
          <div className="w-16 h-16 rounded-lg bg-bg-tertiary flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6 text-text-tertiary" />
          </div>
        )}

        {/* Alert Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <Link href={`/track/${alert.track.id}`}>
                <h3 className="font-semibold text-text-primary truncate hover:text-primary transition-colors">
                  {alert.track.title}
                </h3>
              </Link>
              <p className="text-sm text-text-secondary truncate">{alert.track.artistName}</p>
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {alert.triggered && (
                <Badge variant="warning" size="sm">
                  Disparado
                </Badge>
              )}
              {alert.isActive && !alert.triggered && (
                <Badge variant="success" size="sm">
                  Ativo
                </Badge>
              )}
              {!alert.isActive && !alert.triggered && (
                <Badge variant="default" size="sm">
                  Pausado
                </Badge>
              )}
            </div>
          </div>

          {/* Price Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <div>
              <p className="text-xs text-text-tertiary">Preço Atual</p>
              <p className="text-sm font-semibold text-text-primary">
                R$ {alert.track.currentPrice.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-tertiary">Preço Alvo</p>
              <div className="flex items-center gap-1">
                {alert.condition === "ABOVE" ? (
                  <TrendingUp className="w-3 h-3 text-success" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-error" />
                )}
                <p className="text-sm font-semibold text-text-primary">
                  R$ {alert.targetPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-text-tertiary">Diferença</p>
              <p
                className={`text-sm font-semibold ${
                  priceDiff.diff > 0 ? "text-success" : "text-error"
                }`}
              >
                {priceDiff.diff > 0 ? "+" : ""}
                {priceDiff.percentDiff}%
              </p>
            </div>

            <div>
              <p className="text-xs text-text-tertiary">Notificações</p>
              <div className="flex items-center gap-1 mt-1">
                {alert.notifyEmail && <Mail className="w-3 h-3 text-text-secondary" />}
                {alert.notifyPush && <Smartphone className="w-3 h-3 text-text-secondary" />}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-4 mb-3">
            <p className="text-xs text-text-tertiary">
              Criado {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: ptBR })}
            </p>
            {alert.lastChecked && (
              <p className="text-xs text-text-tertiary">
                Última verificação{" "}
                {formatDistanceToNow(new Date(alert.lastChecked), { addSuffix: true, locale: ptBR })}
              </p>
            )}
            {alert.triggeredAt && (
              <p className="text-xs text-warning">
                Disparado {formatDistanceToNow(new Date(alert.triggeredAt), { addSuffix: true, locale: ptBR })}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
              disabled={isToggling || alert.triggered}
              loading={isToggling}
            >
              {alert.isActive ? (
                <>
                  <PowerOff className="w-3 h-3 mr-1" />
                  Pausar
                </>
              ) : (
                <>
                  <Power className="w-3 h-3 mr-1" />
                  Ativar
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              loading={isDeleting}
              className="text-error hover:text-error hover:bg-error/10"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
