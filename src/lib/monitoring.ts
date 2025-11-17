/**
 * Monitoring and Logging Utilities
 * Provides structured logging and monitoring helpers
 */

import * as Sentry from "@sentry/react";

export type LogLevel = "debug" | "info" | "warning" | "error" | "critical";

interface LogContext {
  userId?: string;
  action?: string;
  component?: string;
  duration?: number;
  [key: string]: any;
}

/**
 * Structured logging function
 * Logs to console in development and sends to Better Stack in production
 */
export const log = (
  level: LogLevel,
  message: string,
  context?: LogContext
) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    level,
    message,
    timestamp,
    environment: import.meta.env.MODE,
    ...context,
  };

  // Console logging
  const consoleMethod = level === "error" || level === "critical" ? "error" : 
                       level === "warning" ? "warn" : 
                       level === "debug" ? "debug" : "log";
  
  if (import.meta.env.DEV) {
    console[consoleMethod](`[${level.toUpperCase()}]`, message, context);
  } else {
    // Structured JSON logging for Better Stack
    console[consoleMethod](JSON.stringify(logEntry));
  }

  // Add breadcrumb to Sentry
  if (level === "error" || level === "critical") {
    Sentry.addBreadcrumb({
      message,
      level: level === "critical" ? "fatal" : level,
      data: context,
    });
  }
};

/**
 * Performance monitoring helper
 * Tracks operation duration and logs performance metrics
 */
export class PerformanceMonitor {
  private startTime: number;
  private operation: string;
  private context?: LogContext;

  constructor(operation: string, context?: LogContext) {
    this.operation = operation;
    this.context = context;
    this.startTime = performance.now();
    
    log("debug", `Starting: ${operation}`, context);
  }

  finish(additionalContext?: LogContext) {
    const duration = performance.now() - this.startTime;
    const context = { ...this.context, ...additionalContext, duration };
    
    log("info", `Completed: ${this.operation}`, context);
    
    // Send to Sentry as custom metric
    Sentry.metrics.distribution(
      `operation.duration.${this.operation.replace(/\s+/g, "_").toLowerCase()}`,
      duration,
      {
        unit: "millisecond",
        tags: this.context,
      }
    );
    
    return duration;
  }

  error(error: Error, additionalContext?: LogContext) {
    const duration = performance.now() - this.startTime;
    const context = { ...this.context, ...additionalContext, duration };
    
    log("error", `Failed: ${this.operation}`, context);
    Sentry.captureException(error, { extra: context });
  }
}

/**
 * Track custom metrics
 */
export const trackMetric = (
  name: string,
  value: number,
  unit: string = "none",
  tags?: Record<string, string>
) => {
  log("info", `Metric: ${name}`, { value, unit, ...tags });
  
  Sentry.metrics.gauge(name, value, {
    unit,
    tags,
  });
};

/**
 * Track user actions
 */
export const trackAction = (
  action: string,
  category: string,
  context?: LogContext
) => {
  log("info", `Action: ${action}`, { category, ...context });
  
  Sentry.addBreadcrumb({
    message: action,
    category,
    level: "info",
    data: context,
  });
  
  // Increment action counter
  Sentry.metrics.increment(`action.${category}.${action.replace(/\s+/g, "_").toLowerCase()}`, 1, {
    tags: context as Record<string, string>,
  });
};

/**
 * Track API calls
 */
export const trackApiCall = (
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  context?: LogContext
) => {
  const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warning" : "info";
  
  log(level, `API Call: ${method} ${endpoint}`, {
    statusCode,
    duration,
    ...context,
  });
  
  Sentry.metrics.distribution("api.response_time", duration, {
    unit: "millisecond",
    tags: {
      endpoint,
      method,
      status: statusCode.toString(),
    },
  });
};

/**
 * Track page views
 */
export const trackPageView = (pageName: string, context?: LogContext) => {
  log("info", `Page View: ${pageName}`, context);
  
  Sentry.addBreadcrumb({
    message: `Viewed ${pageName}`,
    category: "navigation",
    level: "info",
    data: context,
  });
  
  Sentry.metrics.increment("page.view", 1, {
    tags: { page: pageName },
  });
};

/**
 * Monitor React Query operations
 */
export const monitorQuery = (
  queryKey: string,
  status: "loading" | "success" | "error",
  duration?: number,
  error?: Error
) => {
  if (status === "error" && error) {
    log("error", `Query failed: ${queryKey}`, { duration });
    Sentry.captureException(error, {
      extra: { queryKey, duration },
    });
  } else if (status === "success" && duration) {
    log("debug", `Query succeeded: ${queryKey}`, { duration });
    
    if (duration > 1000) {
      log("warning", `Slow query: ${queryKey}`, { duration });
    }
  }
};

/**
 * Error reporting with context
 */
export const reportError = (
  error: Error,
  context?: LogContext,
  level: "error" | "critical" = "error"
) => {
  log(level, error.message, { ...context, stack: error.stack });
  
  Sentry.captureException(error, {
    level: level === "critical" ? "fatal" : "error",
    extra: context,
  });
};

/**
 * Check if monitoring is enabled
 */
export const isMonitoringEnabled = (): boolean => {
  return !!import.meta.env.VITE_SENTRY_DSN;
};

/**
 * Get monitoring status
 */
export const getMonitoringStatus = () => {
  return {
    sentryEnabled: isMonitoringEnabled(),
    environment: import.meta.env.MODE,
    analyticsEnabled: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  };
};
