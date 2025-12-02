/**
 * Input Sanitization Library
 * Prevents XSS and other injection attacks
 */

/**
 * Remove HTML tags and dangerous characters from string
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, onerror, etc)
    .trim();
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  const cleaned = email.toLowerCase().trim();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    throw new Error('Invalid email format');
  }
  
  return cleaned;
}

/**
 * Sanitize CPF (Brazilian ID)
 */
export function sanitizeCPF(cpf: string): string {
  if (!cpf) return '';
  
  // Remove non-numeric characters
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) {
    throw new Error('CPF must have 11 digits');
  }
  
  return cleaned;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  
  // Remove non-numeric characters except + at start
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (cleaned.length < 10 || cleaned.length > 15) {
    throw new Error('Invalid phone number length');
  }
  
  return cleaned;
}

/**
 * Sanitize URL
 */
export function sanitizeURL(url: string): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    
    return parsed.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * Sanitize filename for uploads
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Prevent directory traversal (..)
    .substring(0, 255); // Limit length
}

/**
 * Sanitize JSON input
 */
export function sanitizeJSON<T = any>(input: string): T {
  try {
    const parsed = JSON.parse(input);
    
    // Recursively sanitize string values
    const sanitize = (obj: any): any => {
      if (typeof obj === 'string') {
        return sanitizeString(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          sanitized[key] = sanitize(obj[key]);
        }
        return sanitized;
      }
      return obj;
    };
    
    return sanitize(parsed);
  } catch {
    throw new Error('Invalid JSON format');
  }
}

/**
 * Validate and sanitize pagination parameters
 */
export function sanitizePagination(params: {
  page?: string | number;
  limit?: string | number;
}): { page: number; limit: number } {
  const page = Math.max(1, parseInt(String(params.page || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(params.limit || 20), 10)));
  
  return { page, limit };
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';
  
  return query
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/['"]/g, '') // Remove quotes to prevent SQL injection
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Escape HTML entities
 */
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Validate object against allowed keys (prevent prototype pollution)
 */
export function sanitizeObjectKeys<T extends Record<string, any>>(
  obj: T,
  allowedKeys: string[]
): Partial<T> {
  const sanitized: any = {};
  
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
}
