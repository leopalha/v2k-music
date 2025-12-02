/**
 * Sentry Edge Runtime Configuration
 * This file configures the Sentry SDK for Edge Runtime (middleware, edge functions)
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Debug mode (only in development)
  debug: false,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
});
