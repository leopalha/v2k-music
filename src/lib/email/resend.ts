import { Resend } from 'resend';

// Check if we have a valid API key
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const isMockMode = !RESEND_API_KEY || RESEND_API_KEY === 'mock' || RESEND_API_KEY === '';

// Initialize Resend client (use placeholder key in mock mode)
export const resend = isMockMode ? null : new Resend(RESEND_API_KEY);

export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'V2K Music <noreply@v2kmusic.com>',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@v2kmusic.com',
};

// Email sending helper
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  // Mock mode - just log the email
  if (isMockMode || !resend) {
    console.log('📧 [MOCK] Email would be sent:');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   From: ${EMAIL_CONFIG.from}`);
    return { success: true, data: { id: 'mock-email-id' } };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error(error.message);
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
