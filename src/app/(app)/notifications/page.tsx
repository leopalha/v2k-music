"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Bell, CheckCheck, Filter } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui";

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filterUnread, setFilterUnread] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
    fetchNotifications,
  } = useNotifications();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications(0, 20, filterUnread);
    }
  }, [status, filterUnread, fetchNotifications]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Notificações"
        subtitle="Acompanhe suas atualizações e interações"
      />

      {/* Actions Bar */}
      <div className="bg-bg-secondary border border-border-default rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {/* Filter Toggle */}
            <button
              onClick={() => setFilterUnread(!filterUnread)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${
                  filterUnread
                    ? "bg-primary-400 text-white"
                    : "bg-bg-elevated text-text-secondary hover:bg-bg-elevated/80"
                }
              `}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                {filterUnread ? "Não lidas" : "Todas"}
              </span>
            </button>

            {/* Unread Count */}
            {unreadCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Bell className="w-4 h-4" />
                <span>
                  {unreadCount} {unreadCount === 1 ? "não lida" : "não lidas"}
                </span>
              </div>
            )}
          </div>

          {/* Mark All as Read */}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-bg-secondary border border-border-default rounded-xl overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Bell className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary font-medium mb-2">
              {filterUnread
                ? "Nenhuma notificação não lida"
                : "Nenhuma notificação"}
            </p>
            <p className="text-sm text-text-tertiary">
              {filterUnread
                ? "Todas as suas notificações foram lidas"
                : "Você receberá notificações sobre suas atividades aqui"}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border-subtle">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="p-4 border-t border-border-default bg-bg-elevated">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={loadMore}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    "Carregar mais"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
