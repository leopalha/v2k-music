/**
 * Sentry Client Configuration
 * This file configures the Sentry SDK for the browser/client side
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Percentage of events to send to Sentry
  tracesSampleRate: 1.0,
  
  // Session replay sampling
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  // Debug mode (only in development)
  debug: false,
  
  // Environment
  environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development',
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],
  
  // Filter out common errors
  beforeSend(event, hint) {
    // Filter out network errors from external services
    if (event.exception?.values) {
      const error = hint.originalException;
      
      // Filter out ResizeObserver errors (common browser quirk)
      if (error && error.toString().includes('ResizeObserver')) {
        return null;
      }
      
      // Filter out browser extension errors
      if (event.exception.values.some(ex => 
        ex.stacktrace?.frames?.some(frame => 
          frame.filename?.includes('chrome-extension://') ||
          frame.filename?.includes('moz-extension://')
        )
      )) {
        return null;
      }
    }
    
    return event;
  },
  
  // Ignore certain URLs
  ignoreErrors: [
    // Network errors
    'NetworkError',
    'Network request failed',
    'Failed to fetch',
    
    // Browser extensions
    'top.GLOBALS',
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    
    // Common harmless errors
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],
});
