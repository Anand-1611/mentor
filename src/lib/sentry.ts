import * as Sentry from "@sentry/react";

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;

  // Only initialize Sentry if DSN is provided
  if (!dsn) {
    console.warn("Sentry DSN not configured. Error monitoring is disabled.");
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: environment === "production" ? 0.1 : 1.0, // 10% in production, 100% in dev
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          if (breadcrumb.data) {
            // Remove potential PII
            delete breadcrumb.data.email;
            delete breadcrumb.data.password;
            delete breadcrumb.data.token;
          }
          return breadcrumb;
        });
      }
      
      // Remove sensitive request data
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.Authorization;
          delete event.request.headers.Cookie;
        }
      }
      
      return event;
    },
    
    // Ignore common errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      "chrome-extension://",
      "moz-extension://",
      // Network errors
      "NetworkError",
      "Network request failed",
      // Cancelled requests
      "AbortError",
      "The user aborted a request",
    ],
  });
};

// Helper to capture exceptions with context
export const captureException = (
  error: Error,
  context?: Record<string, any>
) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Helper to capture messages
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = "info"
) => {
  Sentry.captureMessage(message, level);
};

// Helper to set user context
export const setUser = (user: { id: string; email?: string } | null) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  } else {
    Sentry.setUser(null);
  }
};

// Helper to add breadcrumb
export const addBreadcrumb = (
  message: string,
  category: string,
  level: Sentry.SeverityLevel = "info",
  data?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
};
