import { prisma } from '@/lib/db/prisma';
import {
  sendEmail,
  investmentConfirmationEmail,
  royaltyDistributionEmail,
  priceAlertEmail,
  welcomeEmail,
  kycApprovedEmail,
  passwordResetEmail,
} from '@/lib/email';

export async function sendInvestmentConfirmation({
  userId,
  trackId,
  tokensAmount,
  totalValue,
  txHash,
}: {
  userId: string;
  trackId: string;
  tokensAmount: number;
  totalValue: number;
  txHash?: string;
}) {
  try {
    // Get user with preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        emailNotifications: true,
        notifyInvestments: true,
      },
    });

    if (!user || !user.emailNotifications || !user.notifyInvestments) {
      console.log('Skipping investment email: user preferences disabled');
      return { success: false, reason: 'preferences_disabled' };
    }

    // Get track data
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      select: {
        title: true,
        artistName: true,
      },
    });

    if (!track) {
      console.error('Track not found for notification');
      return { success: false, reason: 'track_not_found' };
    }

    const emailData = investmentConfirmationEmail({
      userName: user.name || 'Investidor',
      trackTitle: track.title,
      artistName: track.artistName,
      tokensAmount,
      totalValue,
      txHash,
    });

    await sendEmail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send investment confirmation:', error);
    return { success: false, error };
  }
}

export async function sendRoyaltyNotification({
  userId,
  trackId,
  royaltyAmount,
  totalTokens,
}: {
  userId: string;
  trackId: string;
  royaltyAmount: number;
  totalTokens: number;
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        emailNotifications: true,
        notifyRoyalties: true,
      },
    });

    if (!user || !user.emailNotifications || !user.notifyRoyalties) {
      return { success: false, reason: 'preferences_disabled' };
    }

    const track = await prisma.track.findUnique({
      where: { id: trackId },
      select: {
        title: true,
        artistName: true,
      },
    });

    if (!track) {
      return { success: false, reason: 'track_not_found' };
    }

    const emailData = royaltyDistributionEmail({
      userName: user.name || 'Investidor',
      trackTitle: track.title,
      artistName: track.artistName,
      royaltyAmount,
      totalTokens,
    });

    await sendEmail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send royalty notification:', error);
    return { success: false, error };
  }
}

export async function sendPriceAlert({
  userId,
  trackId,
  oldPrice,
  newPrice,
  changePercent,
}: {
  userId: string;
  trackId: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        emailNotifications: true,
        notifyPriceAlerts: true,
      },
    });

    if (!user || !user.emailNotifications || !user.notifyPriceAlerts) {
      return { success: false, reason: 'preferences_disabled' };
    }

    const track = await prisma.track.findUnique({
      where: { id: trackId },
      select: {
        title: true,
        artistName: true,
      },
    });

    if (!track) {
      return { success: false, reason: 'track_not_found' };
    }

    const emailData = priceAlertEmail({
      userName: user.name || 'Investidor',
      trackTitle: track.title,
      artistName: track.artistName,
      oldPrice,
      newPrice,
      changePercent,
    });

    await sendEmail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send price alert:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail({ userId }: { userId: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        emailNotifications: true,
      },
    });

    if (!user || !user.emailNotifications) {
      return { success: false, reason: 'preferences_disabled' };
    }

    const emailData = welcomeEmail({
      userName: user.name || 'Investidor',
      email: user.email,
    });

    await sendEmail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

export async function sendKYCApprovalEmail({ userId }: { userId: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        emailNotifications: true,
      },
    });

    if (!user || !user.emailNotifications) {
      return { success: false, reason: 'preferences_disabled' };
    }

    const emailData = kycApprovedEmail({
      userName: user.name || 'Investidor',
    });

    await sendEmail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send KYC approval email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail({
  userId,
  email,
  resetToken,
}: {
  userId: string;
  email: string;
  resetToken: string;
}) {
  try {
    // Get user details - password reset doesn't check preferences
    // since it's a critical account security email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
      },
    });

    if (!user) {
      console.error('User not found for password reset');
      return { success: false, reason: 'user_not_found' };
    }

    const emailData = passwordResetEmail({
      userName: user.name || 'Usuário',
      resetToken,
    });

    await sendEmail({
      to: email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error };
  }
}
