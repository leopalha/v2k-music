/**
 * Query Performance Logger
 * Logs slow queries for monitoring and optimization
 */

import { Prisma } from '@prisma/client';

const SLOW_QUERY_THRESHOLD = 100; // milliseconds

interface QueryLog {
  model: string;
  action: string;
  duration: number;
  timestamp: Date;
  args?: any;
}

/**
 * Prisma middleware for logging slow queries
 */
export const queryLoggerMiddleware: Prisma.Middleware = async (params, next) => {
  const start = Date.now();
  
  try {
    const result = await next(params);
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > SLOW_QUERY_THRESHOLD) {
      const log: QueryLog = {
        model: params.model || 'unknown',
        action: params.action,
        duration,
        timestamp: new Date(),
      };
      
      // In development, log to console
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[SLOW QUERY] ${log.model}.${log.action} took ${duration}ms`,
          params.args
        );
      }
      
      // In production, you could send to monitoring service
      // e.g., Sentry, DataDog, etc.
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to monitoring service
        // await sendToMonitoring(log);
      }
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    // Log failed queries
    console.error(
      `[QUERY ERROR] ${params.model}.${params.action} failed after ${duration}ms`,
      error
    );
    
    throw error;
  }
};

/**
 * Query metrics collector
 */
class QueryMetrics {
  private queries: QueryLog[] = [];
  private maxLogs = 100; // Keep last 100 queries
  
  add(log: QueryLog) {
    this.queries.push(log);
    
    // Keep only recent queries
    if (this.queries.length > this.maxLogs) {
      this.queries = this.queries.slice(-this.maxLogs);
    }
  }
  
  getSlowQueries(threshold = SLOW_QUERY_THRESHOLD): QueryLog[] {
    return this.queries.filter(q => q.duration > threshold);
  }
  
  getStats() {
    if (this.queries.length === 0) {
      return {
        total: 0,
        averageDuration: 0,
        slowQueries: 0,
        slowestQuery: null,
      };
    }
    
    const durations = this.queries.map(q => q.duration);
    const slowQueries = this.getSlowQueries();
    const slowest = this.queries.reduce((prev, current) => 
      prev.duration > current.duration ? prev : current
    );
    
    return {
      total: this.queries.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      slowQueries: slowQueries.length,
      slowestQuery: {
        model: slowest.model,
        action: slowest.action,
        duration: slowest.duration,
      },
    };
  }
  
  clear() {
    this.queries = [];
  }
}

export const queryMetrics = new QueryMetrics();

/**
 * Enhanced middleware with metrics collection
 */
export const queryLoggerWithMetrics: Prisma.Middleware = async (params, next) => {
  const start = Date.now();
  
  try {
    const result = await next(params);
    const duration = Date.now() - start;
    
    const log: QueryLog = {
      model: params.model || 'unknown',
      action: params.action,
      duration,
      timestamp: new Date(),
    };
    
    // Add to metrics
    queryMetrics.add(log);
    
    // Log slow queries
    if (duration > SLOW_QUERY_THRESHOLD) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[SLOW QUERY] ${log.model}.${log.action} took ${duration}ms`
        );
      }
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    console.error(
      `[QUERY ERROR] ${params.model}.${params.action} failed after ${duration}ms`,
      error
    );
    
    throw error;
  }
};
