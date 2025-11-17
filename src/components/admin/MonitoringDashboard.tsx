/**
 * Monitoring Dashboard Component
 * Displays monitoring status and quick links to external services
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Activity, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { getMonitoringStatus } from "@/lib/monitoring";

export const MonitoringDashboard = () => {
  const status = getMonitoringStatus();

  const services = [
    {
      name: "Sentry",
      description: "Error tracking and performance monitoring",
      status: status.sentryEnabled ? "active" : "inactive",
      url: "https://sentry.io/",
      docs: "/docs/MONITORING_AND_LOGGING.md#sentry-error-tracking",
    },
    {
      name: "Better Stack",
      description: "Log aggregation and uptime monitoring",
      status: "configured",
      url: "https://betterstack.com/",
      docs: "/docs/MONITORING_AND_LOGGING.md#better-stack-log-aggregation",
    },
    {
      name: "Vercel Analytics",
      description: "Frontend performance and web vitals",
      status: status.analyticsEnabled ? "active" : "inactive",
      url: "https://vercel.com/analytics",
      docs: "/docs/MONITORING_AND_LOGGING.md#vercel-analytics",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "configured":
        return <Activity className="h-5 w-5 text-blue-500" />;
      case "inactive":
        return <XCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      configured: "secondary",
      inactive: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Monitoring & Logging</h2>
        <p className="text-muted-foreground">
          Monitor application health, errors, and performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </div>
                {getStatusBadge(service.status)}
              </div>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(service.url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(service.docs, "_blank")}
                >
                  Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
          <CardDescription>Current monitoring configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Environment</dt>
              <dd className="mt-1 text-sm font-semibold">{status.environment}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Sentry Status</dt>
              <dd className="mt-1 text-sm font-semibold">
                {status.sentryEnabled ? "Enabled" : "Disabled"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Analytics</dt>
              <dd className="mt-1 text-sm font-semibold">
                {status.analyticsEnabled ? "Enabled" : "Disabled"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common monitoring tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              throw new Error("Test error for Sentry");
            }}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Test Error Tracking
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open("/docs/MONITORING_AND_LOGGING.md", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
