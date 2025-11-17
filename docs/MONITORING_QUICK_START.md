# Monitoring Quick Start Guide

Get your monitoring up and running in 15 minutes.

## Prerequisites

- Production deployment on Vercel
- Supabase project configured
- 15 minutes of your time

## Step 1: Sentry Setup (5 minutes)

### 1. Create Sentry Project

```bash
# Go to https://sentry.io/signup/
# Create account → Create Project → Select React
# Copy your DSN
```

### 2. Add to Vercel

```bash
# Go to Vercel Dashboard → Your Project → Settings → Environment Variables
# Add:
VITE_SENTRY_DSN=https://[your-key]@o[org-id].ingest.sentry.io/[project-id]
VITE_SENTRY_ENVIRONMENT=production

# Redeploy your application
```

### 3. Test It

```javascript
// Open your production site
// Open browser console and run:
throw new Error("Test Sentry");

// Check Sentry dashboard - you should see the error
```

✅ **Done!** Sentry is now tracking errors.

## Step 2: Better Stack Logs (5 minutes)

### 1. Create Better Stack Account

```bash
# Go to https://betterstack.com/signup
# Navigate to Logs → Sources → Add Source
# Type: HTTP
# Copy the source token
```

### 2. Configure Vercel Log Drain

```bash
# Go to Vercel Dashboard → Your Project → Settings → Integrations
# Search for "Log Drains"
# Add new log drain:
Endpoint: https://in.logs.betterstack.com/[your-source-token]
Format: JSON
```

### 3. Test It

```bash
# Make a request to your site
# Wait 1 minute
# Check Better Stack → Logs
# You should see logs appearing
```

✅ **Done!** Logs are now being collected.

## Step 3: Uptime Monitoring (5 minutes)

### 1. Create Monitors

```bash
# In Better Stack → Uptime → Create Monitor

# Monitor 1: Frontend
URL: https://your-domain.com
Interval: 1 minute
Expected Status: 200

# Monitor 2: API
URL: https://[project-id].supabase.co/rest/v1/
Interval: 1 minute
Headers: apikey: [your-anon-key]
Expected Status: 200
```

### 2. Configure Alerts

```bash
# For each monitor:
# Click Settings → Alerts
# Add your email
# Set: Alert after 2 minutes of downtime
```

### 3. Test It

```bash
# All monitors should show green status
# You'll receive email if any service goes down
```

✅ **Done!** Uptime monitoring is active.

## Verification

Run the verification script:

```bash
# Windows
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

## What You Get

### Error Tracking
- Automatic error capture
- Stack traces with source maps
- User context and breadcrumbs
- Performance monitoring
- Session replays

### Log Aggregation
- Centralized logs from all services
- Powerful search and filtering
- Real-time log streaming
- 7-day retention (free tier)

### Uptime Monitoring
- 1-minute checks from multiple regions
- Instant downtime alerts
- Response time tracking
- Historical uptime data

## Next Steps

### Recommended (Optional)

1. **Set up Slack alerts** (5 min)
   - Better Stack → Integrations → Slack
   - Sentry → Settings → Integrations → Slack

2. **Create custom dashboards** (10 min)
   - Sentry → Dashboards → Create
   - Better Stack → Dashboards → Create

3. **Configure alert rules** (10 min)
   - See `docs/MONITORING_SETUP_GUIDE.md` for detailed alert configurations

### Advanced (Optional)

1. **Enable Vercel Analytics**
   - Vercel Dashboard → Analytics → Enable

2. **Set up on-call schedule**
   - Better Stack → On-call → Create Schedule

3. **Configure PagerDuty**
   - For critical production systems

## Monitoring Dashboards

Access your monitoring dashboards:

- **Sentry**: https://sentry.io/organizations/[org]/issues/
- **Better Stack Logs**: https://logs.betterstack.com/
- **Better Stack Uptime**: https://uptime.betterstack.com/
- **Vercel Analytics**: https://vercel.com/[team]/[project]/analytics

## Common Issues

### Sentry not receiving errors

```bash
# Check:
1. DSN is correct in Vercel environment variables
2. Application has been redeployed after adding DSN
3. Browser console shows no Sentry errors
4. Ad blockers are disabled
```

### Better Stack not receiving logs

```bash
# Check:
1. Log drain is configured in Vercel
2. Source token is correct
3. Wait 2-3 minutes for logs to appear
4. Make some requests to generate logs
```

### Monitors showing as down

```bash
# Check:
1. URLs are correct
2. Services are actually running
3. API keys are valid (for Supabase)
4. Network connectivity from monitoring locations
```

## Cost

### Free Tier (Good for MVP)
- Sentry: 5,000 errors/month
- Better Stack: 1 GB logs/month, 10 monitors
- Vercel Analytics: Basic metrics
- **Total: $0/month**

### Recommended Tier (Production)
- Sentry Team: $26/month
- Better Stack Starter: $20/month
- Vercel Analytics: Included in Pro
- **Total: $46/month**

## Support

Need help?

1. Check `docs/MONITORING_SETUP_GUIDE.md` for detailed instructions
2. Check `docs/MONITORING_CHECKLIST.md` for complete checklist
3. Review service documentation:
   - Sentry: https://docs.sentry.io/
   - Better Stack: https://betterstack.com/docs

## Summary

You now have:

✅ Error tracking with Sentry
✅ Log aggregation with Better Stack
✅ Uptime monitoring for critical services
✅ Email alerts for incidents

**Total setup time: ~15 minutes**

Your application is now production-ready with comprehensive monitoring!

---

**Last Updated**: 2024-11-17
**Version**: 1.0.0
