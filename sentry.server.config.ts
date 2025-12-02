/**
 * Sentry Server Configuration
 * This file configures the Sentry SDK for the server/Node.js side
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
  
  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove sensitive data from context
    if (event.request) {
      // Remove authorization headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-api-key'];
      }
      
      // Remove query parameters that might contain sensitive data
      if (event.request.query_string) {
        const params = new URLSearchParams(event.request.query_string);
        if (params.has('token')) params.delete('token');
        if (params.has('key')) params.delete('key');
        event.request.query_string = params.toString();
      }
    }
    
    // Remove sensitive data from extra context
    if (event.extra) {
      delete event.extra.apiKey;
      delete event.extra.password;
      delete event.extra.token;
    }
    
    return event;
  },
  
  // Ignore errors from health checks and metrics
  ignoreErrors: [
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
  ],
  
  // Don't send errors from certain URLs
  beforeSendTransaction(event) {
    // Ignore health check transactions
    if (event.transaction === 'GET /api/health') {
      return null;
    }
    
    // Ignore metrics transactions
    if (event.transaction === 'GET /api/metrics') {
      return null;
    }
    
    return event;
  },
});
