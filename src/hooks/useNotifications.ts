"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { NotificationType } from "@prisma/client";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  unreadCount: number;
}

export function useNotifications(autoFetch = true) {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchNotifications = useCallback(
    async (offset = 0, limit = 20, unreadOnly = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString(),
        });

        if (unreadOnly) {
          params.append("unread", "true");
        }

        const res = await fetch(`/api/notifications?${params}`);

        if (!res.ok) {
          // Silent fail - don't throw, just log
          console.warn("Failed to fetch notifications:", res.status);
          return;
        }

        const data: NotificationsResponse = await res.json();

        if (offset === 0) {
          setNotifications(data.notifications);
        } else {
          setNotifications((prev) => [...prev, ...data.notifications]);
        }

        setUnreadCount(data.unreadCount);
        setHasMore(data.pagination.hasMore);
      } catch (err) {
        // Silent fail - just log, don't set error state
        console.warn("Error fetching notifications:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Failed to mark notification as read");
      }

      // Update local state optimistically
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchNotifications(notifications.length);
    }
  }, [hasMore, isLoading, notifications.length, fetchNotifications]);

  // Auto-fetch on mount (only if authenticated)
  useEffect(() => {
    if (autoFetch && status === "authenticated") {
      fetchNotifications();
    }
  }, [autoFetch, status, fetchNotifications]);

  // Poll for new notifications every 30 seconds (only if authenticated)
  useEffect(() => {
    if (!autoFetch || status !== "authenticated") return;

    const interval = setInterval(() => {
      fetchNotifications(0, 20);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoFetch, status, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
  };
}
