# Monitoring and Logging Setup

This directory contains comprehensive monitoring and logging configuration for the MentorLink application.

## 📋 Overview

MentorLink uses a multi-layered monitoring approach:

- **Sentry**: Error tracking and performance monitoring
- **Better Stack**: Log aggregation and uptime monitoring
- **Vercel Analytics**: Frontend performance metrics
- **Supabase Logs**: Database and Edge Function logs

## 🚀 Quick Start

Get monitoring up and running in 15 minutes:

```bash
# Read the quick start guide
cat docs/MONITORING_QUICK_START.md

# Or follow these steps:
# 1. Create Sentry project and add DSN to Vercel
# 2. Create Better Stack account and configure log drain
# 3. Set up uptime monitors in Better Stack
# 4. Run verification script
```

## 📚 Documentation

### Setup Guides

- **[Quick Start Guide](docs/MONITORING_QUICK_START.md)** - Get started in 15 minutes
- **[Complete Setup Guide](docs/MONITORING_SETUP_GUIDE.md)** - Detailed step-by-step instructions
- **[Setup Checklist](docs/MONITORING_CHECKLIST.md)** - Comprehensive checklist for production

### Reference Documentation

- **[Monitoring and Logging Guide](docs/MONITORING_AND_LOGGING.md)** - Complete reference documentation
- **[Monitoring Configuration](monitoring-config.json)** - Uptime monitoring configuration
- **[Sentry Alerts Configuration](sentry-alerts.json)** - Alert rules for Sentry

## 🛠️ Configuration Files

### monitoring-config.json

Uptime monitoring configuration for Better Stack:

```json
{
  "monitors": [
    {
      "name": "Frontend - Production",
      "url": "https://your-domain.com",
      "interval": 60,
      "expectedStatus": 200
    }
  ]
}
```

### sentry-alerts.json

Alert rules for Sentry error tracking:

```json
{
  "alertRules": [
    {
      "name": "High Error Rate",
      "conditions": [
        {
          "type": "event_frequency",
          "value": 50,
          "interval": "5m"
        }
      ]
    }
  ]
}
```

## 🔧 Scripts

### Verification Script

Verify your monitoring setup:

```bash
# Windows PowerShell
.\scripts\verify-monitoring.ps1

# Unix/Linux/macOS
chmod +x scripts/verify-monitoring.sh
./scripts/verify-monitoring.sh
```

Expected output:
```
✓ VITE_SENTRY_DSN is configured
✓ Supabase API is accessible
✓ Sentry integration code exists
✓ Error boundary component exists
✓ @sentry/react is installed

Success Rate: 100%
✓ Monitoring verification completed successfully!
```

## 📊 Monitoring Components

### 1. Error Tracking (Sentry)

**Location**: `src/lib/sentry.ts`

**Features**:
- Automatic error capture
- Performance monitoring
- Session replay
- User context tracking
- Breadcrumbs

**Usage**:
```typescript
import { captureException, captureMessage } from '@/lib/sentry';

// Capture exception
try {
  // Your code
} catch (error) {
  captureException(error, { context: 'payment' });
}

// Capture message
captureMessage('Payment started', 'info');
```

### 2. Error Boundary

**Location**: `src/components/ErrorBoundary.tsx`

**Features**:
- Catches React component errors
- Displays user-friendly error page
- Automatically reports to Sentry
- Provides recovery options

### 3. Log Aggregation (Better Stack)

**Configuration**: Vercel log drain

**Features**:
- Centralized logs from all services
- Powerful search and filtering
- Real-time log streaming
- Saved views for common queries

### 4. Uptime Monitoring (Better Stack)

**Configuration**: `monitoring-config.json`

**Monitors**:
- Frontend application
- Supabase API
- AI Services health check
- Supabase Storage
- Edge Functions

### 5. Performance Monitoring

**Tools**:
- Sentry Performance (transaction tracking)
- Vercel Analytics (Core Web Vitals)
- Custom metrics

## 🔔 Alert Configuration

### Alert Channels

- **Email**: Primary notification method
- **Slack**: Team visibility and collaboration
- **SMS**: Critical alerts only
- **PagerDuty**: On-call escalation (optional)

### Alert Rules

1. **High Error Rate**: >50 errors in 5 minutes
2. **Payment Errors**: >5 payment errors in 1 hour
3. **Performance Degradation**: p95 >2s for 10 minutes
4. **Service Downtime**: Service down for 2 minutes
5. **AI Service Errors**: >10 errors in 15 minutes

## 📈 Dashboards

### Sentry Dashboard

Access: https://sentry.io/organizations/[org]/issues/

**Widgets**:
- Error count by type
- Response time percentiles
- User sessions
- Release comparison

### Better Stack Dashboard

Access: https://logs.betterstack.com/

**Widgets**:
- Service uptime
- Error log count
- Response time graph
- Alert frequency

### Vercel Analytics

Access: https://vercel.com/[team]/[project]/analytics

**Metrics**:
- Core Web Vitals
- Page performance
- Geographic distribution
- Device breakdown

## 🧪 Testing

### Test Error Tracking

```javascript
// In browser console on production site
throw new Error("Test Sentry Integration");
```

### Test Log Aggregation

```bash
# Make API requests and check Better Stack logs
curl https://your-domain.com/api/test
```

### Test Uptime Monitoring

```bash
# All monitors should show green status in Better Stack
# Temporarily stop a service to test alerts
```

## 💰 Cost Estimate

### Free Tier (MVP)
- Sentry: 5,000 errors/month
- Better Stack: 1 GB logs/month, 10 monitors
- Vercel Analytics: Basic metrics
- **Total: $0/month**

### Production Tier
- Sentry Team: $26/month
- Better Stack Starter: $20/month
- Vercel Analytics: Included
- **Total: $46/month**

## 🔍 Troubleshooting

### Sentry Not Receiving Errors

1. Verify DSN is correct in Vercel environment variables
2. Redeploy application after adding DSN
3. Check browser console for Sentry errors
4. Disable ad blockers

### Better Stack Not Receiving Logs

1. Verify log drain is configured in Vercel
2. Check source token is correct
3. Wait 2-3 minutes for logs to appear
4. Make requests to generate logs

### Monitors Showing Down

1. Verify URLs are correct
2. Check services are running
3. Verify API keys are valid
4. Check network connectivity

## 📞 Support

- **Sentry**: https://sentry.io/support/
- **Better Stack**: https://betterstack.com/support
- **Vercel**: https://vercel.com/support

## 🔄 Regular Maintenance

### Daily
- Review error dashboard
- Check for critical errors
- Monitor uptime status

### Weekly
- Review slow queries
- Analyze performance trends
- Update alert thresholds

### Monthly
- Review alert effectiveness
- Update runbooks
- Analyze incident patterns
- Optimize costs

## 📝 Next Steps

1. ✅ Complete setup using [Quick Start Guide](docs/MONITORING_QUICK_START.md)
2. ✅ Run verification script
3. ✅ Configure alert channels
4. ✅ Create custom dashboards
5. ✅ Train team on monitoring tools
6. ✅ Document runbooks
7. ✅ Schedule regular reviews

## 🎯 Success Criteria

Your monitoring is production-ready when:

- ✅ Sentry is receiving errors and performance data
- ✅ Better Stack is receiving logs from all services
- ✅ All uptime monitors are active and green
- ✅ Alert channels are configured and tested
- ✅ Dashboards are accessible
- ✅ Team is trained
- ✅ Verification script passes 100%

---

**Version**: 1.0.0
**Last Updated**: 2024-11-17
**Maintained By**: MentorLink Team
