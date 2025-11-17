# Monitoring and Logging Guide

This guide provides comprehensive information about monitoring and logging for the MentorLink application.

## Table of Contents

1. [Overview](#overview)
2. [Sentry Error Tracking](#sentry-error-tracking)
3. [Better Stack Log Aggregation](#better-stack-log-aggregation)
4. [Uptime Monitoring](#uptime-monitoring)
5. [Performance Monitoring](#performance-monitoring)
6. [Alerts and Notifications](#alerts-and-notifications)
7. [Dashboards](#dashboards)
8. [Best Practices](#best-practices)

---

## Overview

MentorLink uses a comprehensive monitoring stack:

- **Sentry**: Error tracking and performance monitoring
- **Better Stack**: Log aggregation and uptime monitoring
- **Vercel Analytics**: Frontend performance metrics
- **Supabase Logs**: Database and Edge Function logs

### Monitoring Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  - Frontend (React)                                     │
│  - AI Services (Python)                                 │
│  - Edge Functions (Deno)                                │
└────────────┬────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────┬──────────────┐
             │              │              │              │
             ▼              ▼              ▼              ▼
      ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
      │  Sentry  │   │  Better  │   │  Vercel  │   │ Supabase │
      │  Errors  │   │  Stack   │   │Analytics │   │   Logs   │
      └──────────┘   └──────────┘   └──────────┘   └──────────┘
             │              │              │              │
             └──────────────┴──────────────┴──────────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  Alert Channels  │
                   │  - Email         │
                   │  - Slack         │
                   │  - SMS           │
                   └──────────────────┘
```

---

## Sentry Error Tracking

### Setup

Sentry is already configured in the application. To complete the setup:

#### 1. Create Sentry Project

1. Go to [Sentry.io](https://sentry.io/)
2. Create account or sign in
3. Click "Create Project"
4. Select platform: **React**
5. Name: **mentorlink-production**
6. Copy the DSN

#### 2. Configure Environment Variable

Add to Vercel environment variables:
```
VITE_SENTRY_DSN=https://[key]@o[org-id].ingest.sentry.io/[project-id]
VITE_SENTRY_ENVIRONMENT=production
```

#### 3. Verify Integration

Test Sentry integration:
```javascript
// In browser console
throw new Error("Test Sentry Integration");
```

Check Sentry dashboard for the error.

### Features

#### Error Tracking

**Automatic Error Capture:**
- Unhandled exceptions
- Promise rejections
- React component errors
- Network errors

**Manual Error Capture:**
```typescript
import { captureException, captureMessage } from '@/lib/sentry';

try {
  // Your code
} catch (error) {
  captureException(error, {
    context: 'payment-processing',
    userId: user.id,
    amount: 100
  });
}

// Or capture a message
captureMessage('Payment processing started', 'info');
```

#### Performance Monitoring

**Automatic Tracking:**
- Page load times
- API request durations
- Component render times
- Database query performance

**Sample Rate:**
- Production: 10% of transactions
- Development: 100% of transactions

**Custom Transactions:**
```typescript
import * as Sentry from '@sentry/react';

const transaction = Sentry.startTransaction({
  name: 'PDF Upload',
  op: 'file.upload'
});

try {
  await uploadPDF(file);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

#### Session Replay

**Configuration:**
- 10% of normal sessions recorded
- 100% of error sessions recorded
- All text and media masked for privacy

**Viewing Replays:**
1. Go to Sentry dashboard
2. Click on an error
3. Click "Replay" tab
4. Watch user session leading to error

#### User Context

**Automatic:**
```typescript
import { setUser } from '@/lib/sentry';

// After user login
setUser({
  id: user.id,
  email: user.email
});

// After logout
setUser(null);
```

#### Breadcrumbs

**Automatic:**
- Console logs
- Network requests
- User interactions
- Navigation events

**Manual:**
```typescript
import { addBreadcrumb } from '@/lib/sentry';

addBreadcrumb(
  'User started payment',
  'payment',
  'info',
  { amount: 100, currency: 'INR' }
);
```

### Sentry Dashboard

#### Issues Tab

**View and manage errors:**
- Error frequency and trends
- Stack traces
- User impact
- Release tracking

**Issue Actions:**
- Assign to team member
- Mark as resolved
- Ignore future occurrences
- Create GitHub issue

#### Performance Tab

**View performance metrics:**
- Transaction throughput
- Average response time
- Slow transactions
- Database query performance

#### Releases Tab

**Track deployments:**
- Associate errors with releases
- View release health
- Compare release performance
- Track regression

### Alerts

#### Create Alert Rule

1. Go to Alerts → Create Alert Rule
2. Choose conditions:
   - **Error count**: >50 in 5 minutes
   - **Error rate**: >1% of sessions
   - **Performance**: p95 response time >2s
3. Set actions:
   - Email notification
   - Slack message
   - PagerDuty incident
4. Save rule

#### Recommended Alerts

**Critical Errors:**
- Condition: >100 errors in 5 minutes
- Action: Email + SMS
- Frequency: Immediately

**Payment Failures:**
- Condition: Payment error >5 in 1 hour
- Action: Email + Slack
- Frequency: Every 15 minutes

**Performance Degradation:**
- Condition: p95 response time >3s
- Action: Email
- Frequency: Every 30 minutes

---

## Better Stack Log Aggregation

### Setup

#### 1. Create Better Stack Account

1. Go to [Better Stack](https://betterstack.com/)
2. Sign up for account
3. Create new source:
   - Type: **HTTP**
   - Name: **mentorlink-logs**
4. Copy the source token

#### 2. Configure Vercel Integration

1. Go to Vercel Dashboard
2. Navigate to Integrations
3. Search for "Better Stack"
4. Install integration
5. Connect to your project
6. Logs will automatically forward

#### 3. Configure AI Services

**Railway:**
1. Go to Railway project settings
2. Add log drain:
   - URL: `https://in.logs.betterstack.com/[source-token]`
3. Save settings

**Render:**
1. Go to service settings
2. Add log stream:
   - Destination: Better Stack
   - Token: [source-token]
3. Save settings

### Features

#### Log Search

**Search syntax:**
```
# Search for errors
level:error

# Search by service
service:frontend

# Search by user
user.id:abc123

# Combine filters
level:error AND service:ai-services

# Time range
timestamp:[now-1h TO now]
```

#### Log Parsing

**Structured logs:**
```typescript
// Frontend
console.log(JSON.stringify({
  level: 'info',
  message: 'User logged in',
  userId: user.id,
  timestamp: new Date().toISOString()
}));

// AI Services (Python)
import logging
import json

logger = logging.getLogger(__name__)
logger.info(json.dumps({
  'level': 'info',
  'message': 'PDF processed',
  'note_id': note_id,
  'duration_ms': duration
}))
```

#### Log Retention

**Plans:**
- **Free**: 7 days
- **Starter**: 30 days
- **Pro**: 90 days
- **Enterprise**: Custom

### Better Stack Dashboard

#### Live Tail

View logs in real-time:
1. Go to Logs → Live Tail
2. Select sources
3. Apply filters
4. Watch logs stream

#### Saved Views

Create custom views:
1. Apply filters
2. Click "Save View"
3. Name the view
4. Access from sidebar

**Recommended Views:**
- **Errors**: `level:error`
- **Payment Logs**: `category:payment`
- **AI Service Logs**: `service:ai-services`
- **Slow Queries**: `duration_ms:>1000`

---

## Uptime Monitoring

### Setup

#### 1. Create Monitors in Better Stack

**Frontend Monitor:**
- URL: `https://your-domain.com`
- Check interval: 1 minute
- Timeout: 10 seconds
- Locations: Multiple regions
- Expected status: 200

**API Monitor:**
- URL: `https://[project].supabase.co/rest/v1/`
- Check interval: 1 minute
- Headers: `apikey: [anon-key]`
- Expected status: 200

**AI Services Monitor:**
- URL: `https://[service].railway.app/health`
- Check interval: 2 minutes
- Expected status: 200
- Expected body: `{"status":"healthy"}`

#### 2. Configure Alerts

**Downtime Alert:**
- Trigger: Service down for 2 minutes
- Escalation: Email → SMS → Phone call
- Frequency: Immediate

**Slow Response Alert:**
- Trigger: Response time >3s for 5 minutes
- Action: Email notification
- Frequency: Every 15 minutes

### Health Check Endpoints

#### Frontend Health Check

Already handled by Vercel (automatic).

#### AI Services Health Check

Create `/health` endpoint:
```python
# app/main.py
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": await check_database(),
            "storage": await check_storage(),
            "llm": await check_llm()
        }
    }
```

#### Supabase Health Check

Use built-in health endpoint:
```
https://[project].supabase.co/rest/v1/
```

### Status Page

Create public status page:
1. Go to Better Stack → Status Pages
2. Click "Create Status Page"
3. Add monitors
4. Customize design
5. Publish at `status.your-domain.com`

---

## Performance Monitoring

### Vercel Analytics

#### Enable Analytics

1. Go to Vercel project
2. Navigate to Analytics tab
3. Click "Enable Analytics"
4. Choose plan (Hobby is free)

#### Core Web Vitals

**Metrics tracked:**
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1
- **TTFB** (Time to First Byte): <600ms

**View metrics:**
1. Go to Analytics tab
2. Select "Web Vitals"
3. View scores and trends

#### Real User Monitoring

**Automatic tracking:**
- Page load times
- Route transitions
- API request durations
- Geographic distribution

### Sentry Performance

#### Transaction Tracking

**Automatic:**
- Page loads
- Navigation
- API requests

**Manual:**
```typescript
import * as Sentry from '@sentry/react';

const span = Sentry.startSpan({
  name: 'Generate Flashcards',
  op: 'ai.generate'
}, async () => {
  return await generateFlashcards(noteId);
});
```

#### Database Query Performance

Monitor slow queries:
1. Go to Sentry → Performance
2. Filter by operation: `db.query`
3. Sort by duration
4. Identify slow queries

### Custom Metrics

#### Frontend Metrics

```typescript
// Track custom metric
import * as Sentry from '@sentry/react';

Sentry.metrics.increment('pdf.upload.started');
Sentry.metrics.distribution('pdf.upload.size', file.size);
Sentry.metrics.gauge('active.users', activeUsers);
```

#### Backend Metrics

```python
# Track custom metric
from sentry_sdk import metrics

metrics.increment('flashcard.generated')
metrics.distribution('flashcard.generation.duration', duration_ms)
```

---

## Alerts and Notifications

### Alert Channels

#### Email

**Setup:**
1. Add email in Sentry/Better Stack settings
2. Verify email address
3. Configure notification preferences

**Best for:**
- Non-urgent alerts
- Daily/weekly summaries
- Deployment notifications

#### Slack

**Setup:**
1. Install Slack integration
2. Connect workspace
3. Select channel
4. Configure alert rules

**Best for:**
- Team notifications
- Real-time alerts
- Deployment updates

#### SMS

**Setup:**
1. Add phone number in Better Stack
2. Verify number
3. Configure escalation policy

**Best for:**
- Critical alerts
- Downtime notifications
- On-call escalations

#### PagerDuty

**Setup:**
1. Install PagerDuty integration
2. Connect account
3. Configure escalation policy

**Best for:**
- On-call rotations
- Incident management
- Critical alerts

### Alert Rules

#### Error Rate Spike

```yaml
Condition: Error rate > 1% of sessions
Window: 5 minutes
Action: Email + Slack
Frequency: Every 15 minutes
Auto-resolve: When error rate < 0.5%
```

#### High Response Time

```yaml
Condition: p95 response time > 2s
Window: 10 minutes
Action: Email
Frequency: Every 30 minutes
Auto-resolve: When p95 < 1s
```

#### Service Downtime

```yaml
Condition: Service down
Window: 2 minutes
Action: Email + SMS + PagerDuty
Frequency: Immediate
Escalation: Phone call after 5 minutes
```

#### Payment Failures

```yaml
Condition: Payment errors > 5
Window: 1 hour
Action: Email + Slack
Frequency: Every 15 minutes
Auto-resolve: When errors < 2 in 1 hour
```

### On-Call Schedule

#### Setup in Better Stack

1. Go to Incidents → On-call
2. Create schedule:
   - **Primary**: Weekdays 9am-5pm
   - **Secondary**: Weekdays 5pm-9am
   - **Weekend**: 24/7 rotation
3. Add team members
4. Configure escalation:
   - Email immediately
   - SMS after 5 minutes
   - Phone call after 10 minutes

---

## Dashboards

### Sentry Dashboard

**Overview:**
- Error trends
- Performance metrics
- Release health
- User impact

**Custom Dashboard:**
1. Go to Dashboards → Create Dashboard
2. Add widgets:
   - Error count by type
   - Response time percentiles
   - User sessions
   - Release comparison
3. Save and share

### Better Stack Dashboard

**Overview:**
- Uptime status
- Log volume
- Alert history
- Incident timeline

**Custom Dashboard:**
1. Go to Dashboards → Create
2. Add widgets:
   - Service uptime
   - Error log count
   - Response time graph
   - Alert frequency
3. Save and share

### Vercel Analytics Dashboard

**Metrics:**
- Pageviews
- Unique visitors
- Top pages
- Referrers
- Devices
- Countries
- Core Web Vitals

### Custom Monitoring Dashboard

Create unified dashboard using:
- **Grafana**: For custom metrics
- **Datadog**: For infrastructure monitoring
- **New Relic**: For APM

---

## Best Practices

### 1. Log Levels

Use appropriate log levels:
- **DEBUG**: Detailed debugging information
- **INFO**: General informational messages
- **WARNING**: Warning messages
- **ERROR**: Error messages
- **CRITICAL**: Critical errors requiring immediate attention

### 2. Structured Logging

Always use structured logs:
```typescript
// Good
console.log(JSON.stringify({
  level: 'info',
  message: 'User action',
  userId: user.id,
  action: 'purchase',
  amount: 100
}));

// Bad
console.log('User ' + user.id + ' purchased for ' + amount);
```

### 3. Error Context

Always include context with errors:
```typescript
captureException(error, {
  userId: user.id,
  action: 'payment',
  amount: 100,
  paymentMethod: 'stripe'
});
```

### 4. Performance Budgets

Set performance budgets:
- LCP: <2.5s
- FID: <100ms
- CLS: <0.1
- API response: <500ms
- Database query: <100ms

### 5. Alert Fatigue

Avoid alert fatigue:
- Set appropriate thresholds
- Use auto-resolve
- Group related alerts
- Implement escalation policies
- Regular alert review

### 6. Privacy

Protect user privacy:
- Mask PII in logs
- Filter sensitive data in Sentry
- Use data scrubbing
- Comply with GDPR/privacy laws

### 7. Regular Reviews

Schedule regular reviews:
- **Daily**: Check error rates
- **Weekly**: Review slow queries
- **Monthly**: Analyze trends
- **Quarterly**: Update alert rules

---

## Troubleshooting

### Sentry Not Receiving Errors

**Check:**
1. DSN is correct
2. Environment variable is set
3. Sentry is initialized before app render
4. Network connectivity
5. Ad blockers not blocking Sentry

### Better Stack Not Receiving Logs

**Check:**
1. Source token is correct
2. Integration is installed
3. Log format is correct
4. Network connectivity
5. Rate limits not exceeded

### Alerts Not Triggering

**Check:**
1. Alert rules are enabled
2. Thresholds are correct
3. Notification channels are configured
4. Email/phone is verified
5. Alert frequency settings

---

## Cost Optimization

### Sentry

**Free Tier:**
- 5,000 errors/month
- 10,000 transactions/month
- 1 project

**Paid Plans:**
- Team: $26/month
- Business: $80/month
- Enterprise: Custom

**Optimization:**
- Adjust sample rates
- Filter noisy errors
- Use error grouping

### Better Stack

**Free Tier:**
- 1 GB logs/month
- 7-day retention
- 10 monitors

**Paid Plans:**
- Starter: $20/month
- Pro: $50/month
- Enterprise: Custom

**Optimization:**
- Filter unnecessary logs
- Reduce log verbosity
- Use log sampling

---

**Last Updated:** 2024-11-13
**Maintained By:** MentorLink Team
