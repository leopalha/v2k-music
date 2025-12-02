import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@v2k-music.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';

interface User {
  email: string;
  name?: string | null;
}

interface Trade {
  id: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  totalValue: number;
}

interface Track {
  id: string;
  title: string;
  artistName: string;
  currentPrice: number;
}

interface Alert {
  id: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
}

/**
 * Send trade confirmation email
 */
export async function sendTradeConfirmationEmail(
  user: User,
  trade: Trade,
  track: Track
): Promise<boolean> {
  if (!resend) {
    console.warn('[EMAIL] Resend not configured');
    return false;
  }

  try {
    const subject = `Trade Confirmed - ${track.title}`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .details { background: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #000; }
            .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎵 V2K Music</h1>
              <p>Trade Confirmation</p>
            </div>
            <div class="content">
              <p>Hi ${user.name || 'there'},</p>
              <p>Your ${trade.type.toLowerCase()} order has been confirmed!</p>
              
              <div class="details">
                <h3>${track.title}</h3>
                <p><strong>Artist:</strong> ${track.artistName}</p>
                <p><strong>Type:</strong> ${trade.type}</p>
                <p><strong>Quantity:</strong> ${trade.amount} tokens</p>
                <p><strong>Price per token:</strong> R$ ${trade.price.toFixed(2)}</p>
                <p><strong>Total:</strong> R$ ${trade.totalValue.toFixed(2)}</p>
              </div>
              
              <p>View your updated portfolio:</p>
              <a href="${APP_URL}/portfolio" class="button">View Portfolio</a>
            </div>
            <div class="footer">
              <p>V2K Music - Invest in Music Royalties</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send trade confirmation:', error);
    return false;
  }
}

/**
 * Send KYC approved email
 */
export async function sendKycApprovedEmail(user: User): Promise<boolean> {
  if (!resend) {
    console.warn('[EMAIL] Resend not configured');
    return false;
  }

  try {
    const subject = 'KYC Verified - Start Trading!';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #10b981; color: #fff; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ KYC Verified!</h1>
            </div>
            <div class="content">
              <p>Hi ${user.name || 'there'},</p>
              <p>Great news! Your KYC verification has been approved.</p>
              <p>You can now:</p>
              <ul>
                <li>Trade music royalties</li>
                <li>Build your portfolio</li>
                <li>Earn passive income from streams</li>
                <li>Withdraw your earnings</li>
              </ul>
              <a href="${APP_URL}/marketplace" class="button">Start Trading</a>
            </div>
            <div class="footer">
              <p>V2K Music - Invest in Music Royalties</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send KYC approved email:', error);
    return false;
  }
}

/**
 * Send price alert triggered email
 */
export async function sendAlertTriggeredEmail(
  user: User,
  alert: Alert,
  track: Track
): Promise<boolean> {
  if (!resend) {
    console.warn('[EMAIL] Resend not configured');
    return false;
  }

  try {
    const subject = `Price Alert - ${track.title} reached R$ ${alert.targetPrice}`;
    const condition = alert.condition === 'ABOVE' ? 'above' : 'below';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .alert-box { background: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #f59e0b; }
            .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: #fff; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Price Alert Triggered</h1>
            </div>
            <div class="content">
              <p>Hi ${user.name || 'there'},</p>
              <p>Your price alert has been triggered!</p>
              
              <div class="alert-box">
                <h3>${track.title}</h3>
                <p><strong>Artist:</strong> ${track.artistName}</p>
                <p><strong>Current Price:</strong> R$ ${track.currentPrice.toFixed(2)}</p>
                <p><strong>Target:</strong> ${condition} R$ ${alert.targetPrice.toFixed(2)}</p>
              </div>
              
              <p>Consider reviewing this track:</p>
              <a href="${APP_URL}/track/${track.id}" class="button">View Track</a>
            </div>
            <div class="footer">
              <p>V2K Music - Invest in Music Royalties</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send alert email:', error);
    return false;
  }
}
