/**
 * Environment Variables Validation
 * Ensures critical env vars are present at startup
 */

import { z } from 'zod';

const envSchema = z.object({
  // Database (REQUIRED)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Auth (REQUIRED)
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

  // Payments (REQUIRED)
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_'),

  // Stripe Webhook (REQUIRED in production)
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Cloudinary (REQUIRED for uploads)
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Redis (OPTIONAL - cache and rate limiting)
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Monitoring (OPTIONAL)
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // Pusher (OPTIONAL - real-time)
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  NEXT_PUBLIC_PUSHER_KEY: z.string().optional(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().optional(),

  // Email (OPTIONAL)
  RESEND_API_KEY: z.string().optional(),

  // Cron (REQUIRED for cron jobs)
  CRON_SECRET: z.string().min(16, 'CRON_SECRET must be at least 16 characters').optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * Validate environment variables
 * Throws error if required vars are missing
 */
export function validateEnv(): Env {
  // Return cached if already validated
  if (cachedEnv) {
    return cachedEnv;
  }

  try {
    const env = envSchema.parse(process.env);
    cachedEnv = env;

    console.log('[ENV] ✅ Environment variables validated successfully');
    console.log('[ENV] Database:', env.DATABASE_URL.substring(0, 30) + '...');
    console.log('[ENV] Auth:', env.NEXTAUTH_URL);
    console.log('[ENV] Stripe:', env.STRIPE_SECRET_KEY.substring(0, 12) + '...');
    console.log('[ENV] Redis:', env.REDIS_URL ? 'Enabled' : 'Disabled');
    console.log('[ENV] Sentry:', env.SENTRY_DSN ? 'Enabled' : 'Disabled');
    console.log('[ENV] Pusher:', env.PUSHER_KEY ? 'Enabled' : 'Disabled');

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[ENV] ❌ Environment validation failed:');
      error.issues.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Environment validation failed. Check console for details.');
    }
    throw error;
  }
}

/**
 * Get validated env vars
 * Safe to call after initial validation
 */
export function getEnv(): Env {
  if (!cachedEnv) {
    return validateEnv();
  }
  return cachedEnv;
}

/**
 * Check if env var is present (for optional vars)
 */
export function hasEnv(key: keyof Env): boolean {
  const env = getEnv();
  return !!env[key];
}
