/**
 * Audit Log System
 * Tracks sensitive actions for security and compliance
 */

import { prisma } from '@/lib/db/prisma';

export enum AuditAction {
  // Auth actions
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SIGNUP = 'SIGNUP',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE = 'PASSWORD_RESET_COMPLETE',
  
  // Trading actions
  TRADE_BUY = 'TRADE_BUY',
  TRADE_SELL = 'TRADE_SELL',
  LIMIT_ORDER_CREATE = 'LIMIT_ORDER_CREATE',
  LIMIT_ORDER_CANCEL = 'LIMIT_ORDER_CANCEL',
  
  // Portfolio actions
  ROYALTIES_CLAIM = 'ROYALTIES_CLAIM',
  PORTFOLIO_SHARE = 'PORTFOLIO_SHARE',
  
  // Payment actions
  PAYMENT_INITIATE = 'PAYMENT_INITIATE',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_REQUEST = 'REFUND_REQUEST',
  
  // API actions
  API_KEY_CREATE = 'API_KEY_CREATE',
  API_KEY_DELETE = 'API_KEY_DELETE',
  API_KEY_USED = 'API_KEY_USED',
  
  // Profile actions
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  EMAIL_CHANGE = 'EMAIL_CHANGE',
  KYC_COMPLETE = 'KYC_COMPLETE',
  
  // Admin actions
  USER_BAN = 'USER_BAN',
  USER_UNBAN = 'USER_UNBAN',
  TRACK_APPROVE = 'TRACK_APPROVE',
  TRACK_REJECT = 'TRACK_REJECT',
  
  // Security events
  FAILED_LOGIN = 'FAILED_LOGIN',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export interface AuditLogEntry {
  userId?: string;
  action: AuditAction;
  resource?: string; // e.g., "track:123", "user:456"
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  errorMessage?: string;
}

/**
 * Create audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // In production, this would write to a dedicated audit_logs table
    // For now, we'll log to console and optionally to a monitoring service
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', JSON.stringify(logEntry, null, 2));
    }

    // TODO: Write to database table
    // await prisma.auditLog.create({ data: logEntry });

    // TODO: Send to external monitoring (Sentry, DataDog, etc.)
    // await sendToMonitoring(logEntry);
  } catch (error) {
    // Never throw errors from audit logging to avoid breaking the main flow
    console.error('[AUDIT_ERROR]', error);
  }
}

/**
 * Log authentication events
 */
export async function logAuthEvent(
  action: AuditAction,
  userId: string | undefined,
  ipAddress: string | undefined,
  userAgent: string | undefined,
  status: 'SUCCESS' | 'FAILURE',
  details?: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action,
    ipAddress,
    userAgent,
    status,
    details,
  });
}

/**
 * Log trading events
 */
export async function logTradeEvent(
  userId: string,
  action: AuditAction,
  trackId: string,
  amount: number,
  price: number,
  status: 'SUCCESS' | 'FAILURE'
): Promise<void> {
  await createAuditLog({
    userId,
    action,
    resource: `track:${trackId}`,
    details: { amount, price, total: amount * price },
    status,
  });
}

/**
 * Log payment events
 */
export async function logPaymentEvent(
  userId: string,
  action: AuditAction,
  paymentId: string,
  amount: number,
  currency: string,
  status: 'SUCCESS' | 'FAILURE' | 'PENDING',
  errorMessage?: string
): Promise<void> {
  await createAuditLog({
    userId,
    action,
    resource: `payment:${paymentId}`,
    details: { amount, currency },
    status,
    errorMessage,
  });
}

/**
 * Log API key events
 */
export async function logAPIKeyEvent(
  userId: string,
  action: AuditAction,
  keyId: string,
  ipAddress?: string
): Promise<void> {
  await createAuditLog({
    userId,
    action,
    resource: `apikey:${keyId}`,
    ipAddress,
    status: 'SUCCESS',
  });
}

/**
 * Log security events
 */
export async function logSecurityEvent(
  action: AuditAction,
  userId: string | undefined,
  ipAddress: string | undefined,
  details: Record<string, any>
): Promise<void> {
  await createAuditLog({
    userId,
    action,
    ipAddress,
    details,
    status: 'FAILURE',
  });
}

/**
 * Get IP address from request
 */
export function getIPAddress(request: Request): string | undefined {
  // Try various headers (Vercel, CloudFlare, standard)
  const headers = request.headers;
  return (
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('cf-connecting-ip') ||
    undefined
  );
}

/**
 * Get User Agent from request
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined;
}

/**
 * Middleware helper to extract request metadata
 */
export function getRequestMetadata(request: Request) {
  return {
    ipAddress: getIPAddress(request),
    userAgent: getUserAgent(request),
  };
}
