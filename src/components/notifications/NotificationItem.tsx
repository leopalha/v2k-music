"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DollarSign,
  Heart,
  MessageCircle,
  Users,
  TrendingUp,
  Music,
  CheckCircle,
  XCircle,
  AlertCircle,
  Gift,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClick?: () => void;
}

const notificationIcons: Record<NotificationType, React.ElementType> = {
  // Investments
  INVESTMENT_CONFIRMED: DollarSign,
  ROYALTY_RECEIVED: DollarSign,
  PRICE_ALERT: TrendingUp,

  // Social
  COMMENT_LIKE: Heart,
  COMMENT_REPLY: MessageCircle,
  COMMENT_MENTION: MessageCircle,
  NEW_FOLLOWER: Users,

  // Tracks
  NEW_TRACK_RELEASE: Music,
  TRACK_MILESTONE: TrendingUp,
  TRACK_APPROVED: CheckCircle,
  TRACK_REJECTED: XCircle,
  TRACK_UPLOADED: Music,

  // Referrals
  REFERRAL_SIGNUP: Users,
  REFERRAL_COMPLETED: CheckCircle,
  REFERRAL_REWARD: Gift,

  // System
  KYC_APPROVED: CheckCircle,
  KYC_REJECTED: XCircle,
  WITHDRAWAL_COMPLETED: DollarSign,
  GENERAL: AlertCircle,
};

const notificationColors: Record<NotificationType, string> = {
  // Investments
  INVESTMENT_CONFIRMED: "text-success",
  ROYALTY_RECEIVED: "text-primary-400",
  PRICE_ALERT: "text-warning",

  // Social
  COMMENT_LIKE: "text-error",
  COMMENT_REPLY: "text-info",
  COMMENT_MENTION: "text-secondary-400",
  NEW_FOLLOWER: "text-primary-400",

  // Tracks
  NEW_TRACK_RELEASE: "text-primary-400",
  TRACK_MILESTONE: "text-success",
  TRACK_APPROVED: "text-success",
  TRACK_REJECTED: "text-error",
  TRACK_UPLOADED: "text-info",

  // Referrals
  REFERRAL_SIGNUP: "text-info",
  REFERRAL_COMPLETED: "text-success",
  REFERRAL_REWARD: "text-primary-400",

  // System
  KYC_APPROVED: "text-success",
  KYC_REJECTED: "text-error",
  WITHDRAWAL_COMPLETED: "text-success",
  GENERAL: "text-text-secondary",
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  const router = useRouter();
  const Icon = notificationIcons[notification.type];
  const iconColor = notificationColors[notification.type];

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  const handleClick = () => {
    // Mark as read
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Navigate if there's a link
    if (notification.link) {
      router.push(notification.link);
    }

    // Call onClick callback
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        p-4 cursor-pointer transition-colors
        hover:bg-bg-elevated
        ${!notification.read ? "bg-primary-400/5" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`
          flex-shrink-0 w-10 h-10 rounded-full
          flex items-center justify-center
          ${!notification.read ? "bg-primary-400/10" : "bg-bg-secondary"}
        `}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  !notification.read ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {notification.title}
              </p>
              <p className="text-sm text-text-tertiary mt-0.5">
                {notification.message}
              </p>
              <p className="text-xs text-text-tertiary mt-1">{timeAgo}</p>
            </div>

            {/* Unread indicator */}
            {!notification.read && (
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-400 mt-1.5" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
