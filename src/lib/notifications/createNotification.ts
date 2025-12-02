import { prisma } from "@/lib/db/prisma";
import { NotificationType } from "@prisma/client";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  trackId?: string;
  commentId?: string;
  referralId?: string;
  data?: Record<string, any>;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        trackId: params.trackId,
        commentId: params.commentId,
        referralId: params.referralId,
        data: params.data,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Create a notification for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, "userId">
) {
  try {
    const notifications = await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        trackId: params.trackId,
        commentId: params.commentId,
        referralId: params.referralId,
        data: params.data,
      })),
    });

    return notifications;
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    throw error;
  }
}

// ====== SPECIFIC NOTIFICATION HELPERS ======

/**
 * Notify user when someone likes their comment
 */
export async function notifyCommentLike(
  commentOwnerId: string,
  likerName: string,
  trackTitle: string,
  commentId: string,
  trackId: string
) {
  return createNotification({
    userId: commentOwnerId,
    type: "COMMENT_LIKE",
    title: "Novo curtida no seu comentário",
    message: `${likerName} curtiu seu comentário em "${trackTitle}"`,
    link: `/track/${trackId}?comment=${commentId}`,
    trackId,
    commentId,
  });
}

/**
 * Notify user when someone replies to their comment
 */
export async function notifyCommentReply(
  commentOwnerId: string,
  replierName: string,
  trackTitle: string,
  commentId: string,
  trackId: string
) {
  return createNotification({
    userId: commentOwnerId,
    type: "COMMENT_REPLY",
    title: "Nova resposta no seu comentário",
    message: `${replierName} respondeu seu comentário em "${trackTitle}"`,
    link: `/track/${trackId}?comment=${commentId}`,
    trackId,
    commentId,
  });
}

/**
 * Notify user when someone mentions them in a comment
 */
export async function notifyCommentMention(
  mentionedUserId: string,
  mentionerName: string,
  trackTitle: string,
  commentId: string,
  trackId: string
) {
  return createNotification({
    userId: mentionedUserId,
    type: "COMMENT_MENTION",
    title: "Você foi mencionado",
    message: `${mentionerName} mencionou você em "${trackTitle}"`,
    link: `/track/${trackId}?comment=${commentId}`,
    trackId,
    commentId,
  });
}

/**
 * Notify referrer when someone signs up with their code
 */
export async function notifyReferralSignup(
  referrerId: string,
  refereeName: string,
  referralId: string
) {
  return createNotification({
    userId: referrerId,
    type: "REFERRAL_SIGNUP",
    title: "Novo referido!",
    message: `${refereeName} se cadastrou usando seu código de referência`,
    link: "/referrals",
    referralId,
  });
}

/**
 * Notify referrer when referee completes first investment
 */
export async function notifyReferralCompleted(
  referrerId: string,
  refereeName: string,
  reward: number,
  referralId: string
) {
  return createNotification({
    userId: referrerId,
    type: "REFERRAL_COMPLETED",
    title: "Referência completada!",
    message: `${refereeName} fez o primeiro investimento. Você ganhou R$ ${reward.toFixed(2)}!`,
    link: "/referrals",
    referralId,
    data: { reward },
  });
}

/**
 * Notify user when someone follows them
 */
export async function notifyNewFollower(
  userId: string,
  followerName: string,
  followerUsername: string | null,
  followerId: string
) {
  return createNotification({
    userId,
    type: "NEW_FOLLOWER",
    title: "Novo seguidor!",
    message: `${followerName}${followerUsername ? ` (@${followerUsername})` : ""} começou a seguir você`,
    link: `/profile/${followerId}`,
    data: { followerId },
  });
}

/**
 * Notify referee when they receive signup bonus
 */
export async function notifyReferralReward(
  refereeId: string,
  reward: number,
  referralId: string
) {
  return createNotification({
    userId: refereeId,
    type: "REFERRAL_REWARD",
    title: "Bônus de boas-vindas!",
    message: `Você ganhou R$ ${reward.toFixed(2)} de bônus por se cadastrar com um código de referência`,
    link: "/wallet",
    referralId,
    data: { reward },
  });
}

/**
 * Notify user when they receive royalties
 */
export async function notifyRoyaltyReceived(
  userId: string,
  amount: number,
  trackTitle: string,
  trackId: string
) {
  return createNotification({
    userId,
    type: "ROYALTY_RECEIVED",
    title: "Royalties recebidos!",
    message: `Você recebeu R$ ${amount.toFixed(2)} em royalties de "${trackTitle}"`,
    link: `/track/${trackId}`,
    trackId,
    data: { amount },
  });
}

/**
 * Notify user when investment is confirmed
 */
export async function notifyInvestmentConfirmed(
  userId: string,
  trackTitle: string,
  amount: number,
  shares: number,
  trackId: string
) {
  return createNotification({
    userId,
    type: "INVESTMENT_CONFIRMED",
    title: "Investimento confirmado!",
    message: `Seu investimento de R$ ${amount.toFixed(2)} em "${trackTitle}" foi confirmado (${shares} ações)`,
    link: `/track/${trackId}`,
    trackId,
    data: { amount, shares },
  });
}

/**
 * Notify user when KYC is approved
 */
export async function notifyKycApproved(userId: string) {
  return createNotification({
    userId,
    type: "KYC_APPROVED",
    title: "KYC Aprovado!",
    message: "Sua verificação de identidade foi aprovada. Agora você pode investir sem limites!",
    link: "/profile",
  });
}

/**
 * Notify user when KYC is rejected
 */
export async function notifyKycRejected(userId: string, reason?: string) {
  return createNotification({
    userId,
    type: "KYC_REJECTED",
    title: "KYC Rejeitado",
    message: reason || "Sua verificação de identidade foi rejeitada. Entre em contato com o suporte.",
    link: "/profile",
    data: { reason },
  });
}

/**
 * Notify users when a new track is released
 */
export async function notifyNewTrackRelease(
  userIds: string[],
  artistName: string,
  trackTitle: string,
  trackId: string
) {
  return createBulkNotifications(userIds, {
    type: "NEW_TRACK_RELEASE",
    title: "Nova música disponível!",
    message: `${artistName} lançou "${trackTitle}"`,
    link: `/track/${trackId}`,
    trackId,
  });
}
