/**
 * API Keys Utilities
 * Functions for generating, hashing, and validating API keys
 */

import crypto from 'crypto';

export interface ApiKeyGenerateResult {
  key: string;           // The plain text key to show to user (only once)
  hashedKey: string;     // Hashed version to store in database
  prefix: string;        // First 8 chars for display
}

/**
 * Generate a new API key
 * Format: sk_live_[random_32_chars] or sk_test_[random_32_chars]
 */
export function generateApiKey(environment: 'PRODUCTION' | 'SANDBOX' = 'PRODUCTION'): ApiKeyGenerateResult {
  const prefix = environment === 'PRODUCTION' ? 'sk_live_' : 'sk_test_';
  const randomBytes = crypto.randomBytes(24).toString('base64url'); // URL-safe base64
  const key = `${prefix}${randomBytes}`;
  
  // Hash the key for storage (using SHA256)
  const hashedKey = hashApiKey(key);
  
  // Store only the prefix for display (first 8 chars after prefix)
  const displayPrefix = key.substring(0, prefix.length + 8);
  
  return {
    key,
    hashedKey,
    prefix: displayPrefix,
  };
}

/**
 * Hash an API key using SHA256
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(key: string): boolean {
  // Must start with sk_live_ or sk_test_ followed by at least 20 chars
  const regex = /^sk_(live|test)_[A-Za-z0-9_-]{20,}$/;
  return regex.test(key);
}

/**
 * Extract environment from API key
 */
export function getKeyEnvironment(key: string): 'PRODUCTION' | 'SANDBOX' | null {
  if (key.startsWith('sk_live_')) return 'PRODUCTION';
  if (key.startsWith('sk_test_')) return 'SANDBOX';
  return null;
}

/**
 * Mask API key for display
 * Example: sk_live_12345678... → sk_live_12345678...****
 */
export function maskApiKey(prefix: string): string {
  return `${prefix}${'*'.repeat(32)}`;
}
