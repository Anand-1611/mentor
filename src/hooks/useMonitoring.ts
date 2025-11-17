/**
 * React hook for monitoring and tracking
 * Provides easy access to monitoring utilities in components
 */

import { useEffect, useCallback } from "react";
import {
  trackPageView,
  trackAction,
  PerformanceMonitor,
  reportError,
  log,
} from "@/lib/monitoring";

export const useMonitoring = () => {
  /**
   * Track page view on mount
   */
  const trackPage = useCallback((pageName: string, context?: Record<string, any>) => {
    trackPageView(pageName, context);
  }, []);

  /**
   * Track user action
   */
  const track = useCallback((
    action: string,
    category: string,
    context?: Record<string, any>
  ) => {
    trackAction(action, category, context);
  }, []);

  /**
   * Create performance monitor
   */
  const startMonitor = useCallback((operation: string, context?: Record<string, any>) => {
    return new PerformanceMonitor(operation, context);
  }, []);

  /**
   * Report error
   */
  const logError = useCallback((
    error: Error,
    context?: Record<string, any>,
    level: "error" | "critical" = "error"
  ) => {
    reportError(error, context, level);
  }, []);

  /**
   * Log message
   */
  const logMessage = useCallback((
    level: "debug" | "info" | "warning" | "error" | "critical",
    message: string,
    context?: Record<string, any>
  ) => {
    log(level, message, context);
  }, []);

  return {
    trackPage,
    track,
    startMonitor,
    logError,
    log: logMessage,
  };
};

/**
 * Hook to track page views automatically
 */
export const usePageTracking = (pageName: string, context?: Record<string, any>) => {
  useEffect(() => {
    trackPageView(pageName, context);
  }, [pageName, context]);
};

/**
 * Hook to monitor component lifecycle performance
 */
export const useComponentMonitoring = (componentName: string) => {
  useEffect(() => {
    const monitor = new PerformanceMonitor(`Component Mount: ${componentName}`);
    
    return () => {
      monitor.finish({ event: "unmount" });
    };
  }, [componentName]);
};
