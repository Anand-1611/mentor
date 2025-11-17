# Monitoring and Logging Setup Guide

This guide walks you through setting up complete monitoring and logging for MentorLink in production.

## Prerequisites

- Vercel account (for frontend deployment)
- Supabase project (already configured)
- Access to production environment variables

## Step 1: Configure Sentry Error Tracking

### 1.1 Create Sentry Project

1. Go to [Sentry.io](https://sentry.io/) and sign up/login
2. Click **"Create Project"**
3. Select platform: **React**
4. Project name: **mentorlink-production**
5. Copy the DSN (looks like: `https://[key]@o[org-id].ingest.sentry.io/[project-id]`)

### 1.2 Add Sentry DSN to Environment Variables

**For Vercel:**
```bash
# Go to Vercel Dashboard > Your Project > Settings > Environment Variables
# Add the following:
VITE_SENTRY_DSN=https://[your-key]@o[org-id].ingest.sentry.io/[project-id]
VITE_SENTRY_ENVIRONMENT=production
```

**For Local Development:**
```bash
# Add to .env file
VITE_SENTRY_DSN=https://[your-key]@o[org-id].ingest.sentry.io/[project-id]
```

### 1.3 Configure Sentry Source Maps (Optional but Recommended)

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Login to Sentry
sentry-cli login

# Add to package.json scripts
"build:production": "vite build && sentry-cli releases files [release-version] upload-sourcemaps ./dist"
```

### 1.4 Set Up Sentry Alert Rules

1. Go to Sentry Dashboard > **Alerts** > **Create Alert Rule**
2. Create the following alert rules:

**High Error Rate Alert:**
- Condition: Error count > 50 in 5 minutes
- Environment: production
- Action: Email + Slack notification
- Frequency: Every 15 minutes

**Payment Processing Errors:**
- Condition: Error count > 5 in 1 hour
- Filter: Tag `category` equals `payment`
- Action: Email + Slack notification
- Frequency: Every 5 minutes

**Performance Degradation:**
- Condition: p95 response time > 2000ms for 10 minutes
- Action: Email notification
- Frequency: Every 30 minutes

**Critical Errors:**
- Condition: Any error with level `fatal` or `critical`
- Action: Email + Slack + PagerDuty
- Frequency: Immediately

### 1.5 Test Sentry Integration

```javascript
// In browser console on your deployed site
throw new Error("Test Sentry Integration");
```

Check Sentry dashboard to confirm the error appears.

## Step 2: Set Up Better Stack for Log Aggregation

### 2.1 Create Better Stack Account

1. Go to [Better Stack](https://betterstack.com/) and sign up
2. Navigate to **Logs** > **Sources**
3. Click **"Add Source"**
4. Select type: **HTTP**
5. Name: **mentorlink-logs**
6. Copy the source token

### 2.2 Configure Vercel Log Drain

1. Go to Vercel Dashboard > Your Project > **Settings** > **Integrations**
2. Search for **"Log Drains"**
3. Add new log drain:
   - **Endpoint**: `https://in.logs.betterstack.com/[your-source-token]`
   - **Format**: JSON
4. Save configuration

Logs will now automatically forward from Vercel to Better Stack.

### 2.3 Configure AI Services Log Forwarding

**For Railway:**
```bash
# Go to Railway project > Settings > Log Drains
# Add log drain:
URL: https://in.logs.betterstack.com/[your-source-token]
Format: JSON
```

**For Render:**
```bash
# Go to service > Settings > Log Streams
# Add log stream:
Destination: Better Stack
Token: [your-source-token]
```

### 2.4 Configure Supabase Log Forwarding (Optional)

1. Go to Supabase Dashboard > Project Settings > **Integrations**
2. Look for log forwarding options
3. Add Better Stack webhook URL

### 2.5 Create Better Stack Saved Views

Create these saved views for quick access:

**Error Logs:**
```
level:error OR level:fatal
```

**Payment Logs:**
```
category:payment
```

**AI Service Logs:**
```
service:ai-services
```

**Slow Queries:**
```
duration_ms:>1000
```

## Step 3: Set Up Uptime Monitoring

### 3.1 Create Uptime Monitors in Better Stack

1. Go to Better Stack > **Uptime** > **Create Monitor**

**Frontend Monitor:**
- Name: **MentorLink Frontend**
- URL: `https://your-domain.com`
- Method: GET
- Check interval: 1 minute
- Timeout: 10 seconds
- Expected status: 200
- Locations: Multiple regions (US, EU, Asia)

**API Monitor:**
- Name: **Supabase API**
- URL: `https://[project-id].supabase.co/rest/v1/`
- Method: GET
- Headers: `apikey: [your-anon-key]`
- Check interval: 1 minute
- Expected status: 200

**AI Services Monitor:**
- Name: **AI Services Health**
- URL: `https://[your-service].railway.app/health`
- Method: GET
- Check interval: 2 minutes
- Expected status: 200
- Expected body contains: `"status":"healthy"`

**Storage Monitor:**
- Name: **Supabase Storage**
- URL: `https://[project-id].supabase.co/storage/v1/`
- Method: GET
- Check interval: 5 minutes
- Expected status: 200

### 3.2 Configure Uptime Alerts

For each monitor, configure alerts:

**Downtime Alert:**
- Trigger: Service down for 2 minutes
- Escalation: Email → SMS → Phone call
- Frequency: Immediate

**Slow Response Alert:**
- Trigger: Response time > 3000ms for 5 minutes
- Action: Email notification
- Frequency: Every 15 minutes

## Step 4: Configure Alert Channels

### 4.1 Email Notifications

1. Go to Better Stack > **Settings** > **Notification Channels**
2. Add email addresses:
   - Primary: `admin@your-domain.com`
   - Secondary: `dev@your-domain.com`
3. Verify email addresses

### 4.2 Slack Integration

1. Go to Better Stack > **Settings** > **Integrations**
2. Click **"Add Slack Integration"**
3. Authorize Better Stack in your Slack workspace
4. Select channel: `#alerts` or `#monitoring`
5. Test integration

**For Sentry:**
1. Go to Sentry > **Settings** > **Integrations**
2. Search for **Slack**
3. Install and authorize
4. Configure alert routing to `#alerts` channel

### 4.3 SMS Alerts (Optional)

1. Go to Better Stack > **Settings** > **Notification Channels**
2. Add phone number for SMS alerts
3. Verify phone number
4. Configure for critical alerts only

### 4.4 PagerDuty Integration (Optional)

1. Create PagerDuty account
2. Create service: **MentorLink Production**
3. Copy integration key
4. Add to Sentry:
   - Go to Sentry > **Settings** > **Integrations**
   - Search for **PagerDuty**
   - Add integration key
5. Configure escalation policy

## Step 5: Set Up Performance Monitoring

### 5.1 Enable Vercel Analytics

1. Go to Vercel Dashboard > Your Project > **Analytics**
2. Click **"Enable Analytics"**
3. Choose plan (Hobby is free for basic metrics)

### 5.2 Configure Sentry Performance Monitoring

Already configured in `src/lib/sentry.ts`:
- Transaction sampling: 10% in production
- Automatic instrumentation for:
  - Page loads
  - Navigation
  - API requests
  - Database queries

### 5.3 Monitor Core Web Vitals

Vercel Analytics automatically tracks:
- **LCP** (Largest Contentful Paint): Target < 2.5s
- **FID** (First Input Delay): Target < 100ms
- **CLS** (Cumulative Layout Shift): Target < 0.1
- **TTFB** (Time to First Byte): Target < 600ms

View in Vercel Dashboard > Analytics > Web Vitals

## Step 6: Create Monitoring Dashboards

### 6.1 Sentry Dashboard

1. Go to Sentry > **Dashboards** > **Create Dashboard**
2. Name: **Production Overview**
3. Add widgets:
   - Error count by type (last 24h)
   - Response time percentiles (p50, p95, p99)
   - User sessions
   - Release comparison
   - Top errors by frequency
4. Save and set as default

### 6.2 Better Stack Dashboard

1. Go to Better Stack > **Dashboards** > **Create**
2. Name: **System Health**
3. Add widgets:
   - Service uptime (all monitors)
   - Error log count (last 24h)
   - Response time graph
   - Alert frequency
   - Log volume by service
4. Save dashboard

## Step 7: Configure On-Call Schedule (Optional)

### 7.1 Set Up On-Call Rotation

1. Go to Better Stack > **Incidents** > **On-call**
2. Create schedule:
   - **Primary**: Weekdays 9am-5pm
   - **Secondary**: Weekdays 5pm-9am
   - **Weekend**: 24/7 rotation
3. Add team members
4. Configure escalation:
   - Email immediately
   - SMS after 5 minutes
   - Phone call after 10 minutes

## Step 8: Test Monitoring Setup

### 8.1 Test Error Tracking

```javascript
// In browser console on production site
throw new Error("Test monitoring setup");
```

Verify:
- ✅ Error appears in Sentry dashboard
- ✅ Alert sent to configured channels (if threshold met)

### 8.2 Test Uptime Monitoring

1. Temporarily stop one of your services
2. Wait 2 minutes
3. Verify:
   - ✅ Better Stack detects downtime
   - ✅ Alert sent via email/Slack
   - ✅ Incident created

### 8.3 Test Log Aggregation

```bash
# Make a request to your API
curl https://your-domain.com/api/test

# Check Better Stack logs
# Verify log appears within 1 minute
```

### 8.4 Test Performance Monitoring

1. Navigate through your application
2. Wait 5 minutes
3. Check Sentry > Performance
4. Verify transactions are being recorded

## Step 9: Document Runbook

Create a runbook for common incidents:

### High Error Rate
1. Check Sentry dashboard for error details
2. Review recent deployments
3. Check Better Stack logs for patterns
4. Rollback if needed
5. Fix and redeploy

### Service Downtime
1. Check Better Stack uptime monitors
2. Verify service status (Vercel, Supabase, Railway)
3. Check service logs
4. Restart service if needed
5. Investigate root cause

### Performance Degradation
1. Check Sentry performance metrics
2. Identify slow transactions
3. Review database query performance
4. Check for resource constraints
5. Optimize or scale as needed

## Step 10: Regular Maintenance

### Daily
- Review error dashboard
- Check for new critical errors
- Monitor uptime status

### Weekly
- Review slow queries
- Analyze performance trends
- Update alert thresholds if needed

### Monthly
- Review alert effectiveness
- Update runbooks
- Analyze incident patterns
- Optimize monitoring costs

## Monitoring Costs

### Sentry
- **Free**: 5,000 errors/month, 10,000 transactions/month
- **Team**: $26/month - 50,000 errors, 100,000 transactions
- **Business**: $80/month - 500,000 errors, 1M transactions

### Better Stack
- **Free**: 1 GB logs/month, 7-day retention, 10 monitors
- **Starter**: $20/month - 10 GB logs, 30-day retention, 50 monitors
- **Pro**: $50/month - 50 GB logs, 90-day retention, unlimited monitors

### Vercel Analytics
- **Hobby**: Free - Basic metrics
- **Pro**: $20/month - Advanced analytics

**Estimated Total**: $0-100/month depending on scale

## Troubleshooting

### Sentry Not Receiving Errors
- Verify DSN is correct in environment variables
- Check browser console for Sentry initialization errors
- Ensure ad blockers aren't blocking Sentry
- Verify network connectivity

### Better Stack Not Receiving Logs
- Verify source token is correct
- Check log drain configuration in Vercel
- Ensure logs are in JSON format
- Check rate limits

### Alerts Not Triggering
- Verify alert rules are enabled
- Check threshold values
- Ensure notification channels are configured
- Verify email/phone is verified

### Missing Performance Data
- Check Sentry sample rate configuration
- Verify performance monitoring is enabled
- Ensure transactions are being created
- Check for errors in Sentry initialization

## Support

- **Sentry**: https://sentry.io/support/
- **Better Stack**: https://betterstack.com/support
- **Vercel**: https://vercel.com/support

---

**Last Updated**: 2024-11-17
**Version**: 1.0.0
