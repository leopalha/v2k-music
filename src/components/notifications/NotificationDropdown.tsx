"use client";

import { CheckCheck, Loader2 } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui";
import Link from "next/link";

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] bg-bg-secondary border border-border-default rounded-xl shadow-lg overflow-hidden z-50">
      {/* Header */}
      <div className="p-4 border-b border-border-default">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            Notificações
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-text-secondary">Sem notificações</p>
            <p className="text-sm text-text-tertiary mt-1">
              Você receberá notificações sobre suas atividades aqui
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onClick={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-border-default bg-bg-elevated">
          <Link href="/notifications" onClick={onClose}>
            <Button variant="ghost" size="sm" className="w-full">
              Ver todas as notificações
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
