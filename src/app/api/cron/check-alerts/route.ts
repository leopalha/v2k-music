import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

// GET /api/cron/check-alerts - Cron job to check price alerts
// Call this every 5 minutes via Vercel Cron or external service
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active, non-triggered alerts
    const alerts = await prisma.priceAlert.findMany({
      where: {
        isActive: true,
        triggered: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            notifyPriceAlerts: true,
          },
        },
        track: {
          select: {
            id: true,
            title: true,
            artistName: true,
            coverUrl: true,
            currentPrice: true,
          },
        },
      },
    });

    const triggeredAlerts = [];
    const now = new Date();

    for (const alert of alerts) {
      const currentPrice = alert.track.currentPrice;
      let shouldTrigger = false;

      // Check price condition
      if (alert.condition === "ABOVE" && currentPrice >= alert.targetPrice) {
        shouldTrigger = true;
      } else if (alert.condition === "BELOW" && currentPrice <= alert.targetPrice) {
        shouldTrigger = true;
      }

      // Check percent change if set
      if (alert.percentChange && !shouldTrigger) {
        // Calculate percent change from target
        const changePercent = ((currentPrice - alert.targetPrice) / alert.targetPrice) * 100;

        if (Math.abs(changePercent) >= Math.abs(alert.percentChange)) {
          shouldTrigger = true;
        }
      }

      if (shouldTrigger) {
        // Update alert status
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: {
            triggered: true,
            triggeredAt: now,
            lastChecked: now,
          },
        });

        triggeredAlerts.push(alert);

        // Send email notification if enabled
        if (alert.notifyEmail && alert.user.notifyPriceAlerts) {
          try {
            await sendEmail({
              to: alert.user.email,
              subject: `Price Alert: ${alert.track.title}`,
              html: generateAlertEmail(alert, currentPrice),
            });
          } catch (emailError) {
            console.error("Error sending alert email:", emailError);
          }
        }

        // TODO: Send push notification if alert.notifyPush is true
        // Implement Web Push API or use service like OneSignal
      } else {
        // Update last checked time
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: { lastChecked: now },
        });
      }
    }

    return NextResponse.json({
      success: true,
      checked: alerts.length,
      triggered: triggeredAlerts.length,
      alerts: triggeredAlerts.map((a) => ({
        id: a.id,
        track: a.track.title,
        condition: a.condition,
        targetPrice: a.targetPrice,
        currentPrice: a.track.currentPrice,
      })),
    });
  } catch (error) {
    console.error("Error checking price alerts:", error);
    return NextResponse.json(
      { error: "Failed to check alerts" },
      { status: 500 }
    );
  }
}

// Generate HTML email for price alert
function generateAlertEmail(alert: any, currentPrice: number): string {
  const conditionText =
    alert.condition === "ABOVE"
      ? `rose above R$ ${alert.targetPrice.toFixed(2)}`
      : `fell below R$ ${alert.targetPrice.toFixed(2)}`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://v2k.music";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Price Alert Triggered</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🔔 Price Alert Triggered!</h1>
    </div>

    <div style="background: #f7f7f7; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
      <h2 style="margin-top: 0; color: #667eea;">${alert.track.title}</h2>
      <p style="color: #666; margin: 5px 0;">by ${alert.track.artistName}</p>

      <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
        <p style="margin: 0; font-size: 14px; color: #888;">Current Price</p>
        <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: bold; color: #667eea;">
          R$ ${currentPrice.toFixed(2)}
        </p>
      </div>

      <p style="margin-top: 15px; padding: 10px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px;">
        The price ${conditionText}
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/track/${alert.trackId}"
         style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        View Track Details
      </a>
    </div>

    <div style="text-align: center; color: #888; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
      <p>You're receiving this because you set up a price alert on V2K.</p>
      <p>
        <a href="${appUrl}/profile" style="color: #667eea;">Manage your alerts</a>
      </p>
    </div>
  </body>
</html>`;
}
