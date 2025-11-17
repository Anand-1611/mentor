# Monitoring and Logging Setup Checklist

Use this checklist to ensure all monitoring and logging components are properly configured for production.

## Pre-Deployment Checklist

### ✅ Sentry Error Tracking

- [ ] **Create Sentry account and project**
  - Platform: React
  - Project name: mentorlink-production
  - Copy DSN

- [ ] **Configure environment variables**
  - [ ] Add `VITE_SENTRY_DSN` to Vercel
  - [ ] Add `VITE_SENTRY_ENVIRONMENT=production` to Vercel
  - [ ] Verify DSN format is correct

- [ ] **Verify Sentry integration**
  - [ ] Check `src/lib/sentry.ts` exists
  - [ ] Check `src/components/ErrorBoundary.tsx` exists
  - [ ] Verify Sentry is initialized in `src/main.tsx`
  - [ ] Test error capture in development

- [ ] **Configure Sentry alert rules**
  - [ ] High Error Rate (>50 errors in 5 min)
  - [ ] Payment Processing Errors (>5 in 1 hour)
  - [ ] Performance Degradation (p95 >2s for 10 min)
  - [ ] Critical Errors (fatal/critical level)
  - [ ] AI Service Errors (>10 in 15 min)
  - [ ] Database Query Performance (p95 >1s)

- [ ] **Configure Sentry integrations**
  - [ ] Slack integration for alerts
  - [ ] GitHub integration for issue tracking
  - [ ] PagerDuty integration (optional)

- [ ] **Set up Sentry releases** (optional)
  - [ ] Install Sentry CLI
  - [ ] Configure source map upload
  - [ ] Add release tracking to deployment

### ✅ Better Stack Log Aggregation

- [ ] **Create Better Stack account**
  - [ ] Sign up at betterstack.com
  - [ ] Create HTTP source for logs
  - [ ] Copy source token

- [ ] **Configure log forwarding**
  - [ ] Set up Vercel log drain
  - [ ] Configure AI services log forwarding (Railway/Render)
  - [ ] Test log forwarding

- [ ] **Create saved views**
  - [ ] Error logs view: `level:error OR level:fatal`
  - [ ] Payment logs view: `category:payment`
  - [ ] AI service logs view: `service:ai-services`
  - [ ] Slow queries view: `duration_ms:>1000`

- [ ] **Configure log retention**
  - [ ] Choose appropriate plan based on volume
  - [ ] Set retention period (7/30/90 days)

### ✅ Uptime Monitoring

- [ ] **Create uptime monitors in Better Stack**
  - [ ] Frontend monitor (https://your-domain.com)
  - [ ] Supabase API monitor
  - [ ] AI Services health check monitor
  - [ ] Supabase Storage monitor

- [ ] **Configure monitor settings**
  - [ ] Set check intervals (1-5 minutes)
  - [ ] Configure timeout values
  - [ ] Select monitoring locations (multi-region)
  - [ ] Set expected status codes

- [ ] **Configure uptime alerts**
  - [ ] Downtime alert (service down for 2 min)
  - [ ] Slow response alert (>3s for 5 min)
  - [ ] Set escalation policies

- [ ] **Create status page** (optional)
  - [ ] Add all monitors to status page
  - [ ] Customize design
  - [ ] Publish at status.your-domain.com

### ✅ Alert Channels

- [ ] **Email notifications**
  - [ ] Add primary email address
  - [ ] Add secondary email address
  - [ ] Verify all email addresses
  - [ ] Test email delivery

- [ ] **Slack integration**
  - [ ] Install Slack integration in Better Stack
  - [ ] Install Slack integration in Sentry
  - [ ] Configure #alerts channel
  - [ ] Configure #critical-alerts channel
  - [ ] Test Slack notifications

- [ ] **SMS alerts** (optional)
  - [ ] Add phone numbers
  - [ ] Verify phone numbers
  - [ ] Configure for critical alerts only
  - [ ] Test SMS delivery

- [ ] **PagerDuty** (optional)
  - [ ] Create PagerDuty service
  - [ ] Configure integration keys
  - [ ] Set up escalation policy
  - [ ] Test incident creation

### ✅ Performance Monitoring

- [ ] **Enable Vercel Analytics**
  - [ ] Go to Vercel project settings
  - [ ] Enable Analytics
  - [ ] Choose appropriate plan

- [ ] **Configure Sentry performance monitoring**
  - [ ] Verify transaction sampling rate (10% production)
  - [ ] Check automatic instrumentation is enabled
  - [ ] Test transaction tracking

- [ ] **Set performance budgets**
  - [ ] LCP target: <2.5s
  - [ ] FID target: <100ms
  - [ ] CLS target: <0.1
  - [ ] API response target: <500ms

### ✅ AI Services Health Checks

- [ ] **Verify health check endpoint**
  - [ ] Test `/health` endpoint locally
  - [ ] Deploy to production
  - [ ] Verify endpoint returns correct format
  - [ ] Add to uptime monitoring

- [ ] **Configure health check monitoring**
  - [ ] Check interval: 2 minutes
  - [ ] Expected response: `{"status":"healthy"}`
  - [ ] Alert on failures

### ✅ Dashboard Setup

- [ ] **Create Sentry dashboard**
  - [ ] Add error count widget
  - [ ] Add response time percentiles widget
  - [ ] Add user sessions widget
  - [ ] Add release comparison widget
  - [ ] Set as default dashboard

- [ ] **Create Better Stack dashboard**
  - [ ] Add service uptime widget
  - [ ] Add error log count widget
  - [ ] Add response time graph
  - [ ] Add alert frequency widget

- [ ] **Configure Vercel Analytics dashboard**
  - [ ] Review Core Web Vitals
  - [ ] Check page performance
  - [ ] Monitor geographic distribution

### ✅ On-Call Schedule (Optional)

- [ ] **Set up on-call rotation**
  - [ ] Define primary schedule (weekdays 9am-5pm)
  - [ ] Define secondary schedule (weekdays 5pm-9am)
  - [ ] Define weekend schedule (24/7)
  - [ ] Add team members

- [ ] **Configure escalation policy**
  - [ ] Email immediately
  - [ ] SMS after 5 minutes
  - [ ] Phone call after 10 minutes

## Post-Deployment Checklist

### ✅ Testing

- [ ] **Test error tracking**
  - [ ] Trigger test error in production
  - [ ] Verify error appears in Sentry
  - [ ] Verify alert is sent (if threshold met)
  - [ ] Check error details and context

- [ ] **Test log aggregation**
  - [ ] Make API requests
  - [ ] Check logs appear in Better Stack
  - [ ] Verify log format is correct
  - [ ] Test log search functionality

- [ ] **Test uptime monitoring**
  - [ ] Verify all monitors are green
  - [ ] Check response times
  - [ ] Review historical uptime data

- [ ] **Test alert delivery**
  - [ ] Trigger test alert
  - [ ] Verify email delivery
  - [ ] Verify Slack notification
  - [ ] Verify SMS delivery (if configured)

- [ ] **Test performance monitoring**
  - [ ] Navigate through application
  - [ ] Check transactions in Sentry
  - [ ] Review Core Web Vitals in Vercel
  - [ ] Identify any slow pages

### ✅ Documentation

- [ ] **Create runbook**
  - [ ] Document common incidents
  - [ ] Define response procedures
  - [ ] List escalation contacts
  - [ ] Include troubleshooting steps

- [ ] **Document alert thresholds**
  - [ ] List all alert rules
  - [ ] Document threshold values
  - [ ] Explain rationale for thresholds

- [ ] **Create monitoring guide**
  - [ ] How to access dashboards
  - [ ] How to investigate errors
  - [ ] How to analyze performance
  - [ ] How to respond to alerts

### ✅ Team Training

- [ ] **Train team on monitoring tools**
  - [ ] Sentry dashboard walkthrough
  - [ ] Better Stack log search
  - [ ] Vercel Analytics review
  - [ ] Alert response procedures

- [ ] **Conduct incident response drill**
  - [ ] Simulate downtime incident
  - [ ] Practice escalation procedure
  - [ ] Review response time
  - [ ] Document lessons learned

### ✅ Regular Maintenance

- [ ] **Daily tasks**
  - [ ] Review error dashboard
  - [ ] Check for new critical errors
  - [ ] Monitor uptime status
  - [ ] Review alert history

- [ ] **Weekly tasks**
  - [ ] Review slow queries
  - [ ] Analyze performance trends
  - [ ] Check log volume
  - [ ] Update alert thresholds if needed

- [ ] **Monthly tasks**
  - [ ] Review alert effectiveness
  - [ ] Update runbooks
  - [ ] Analyze incident patterns
  - [ ] Optimize monitoring costs
  - [ ] Review and update on-call schedule

## Verification

Run the monitoring verification script to check your setup:

```bash
# Windows PowerShell
.\scripts\verify-monitoring.ps1

# Unix/Linux/macOS
chmod +x scripts/verify-monitoring.sh
./scripts/verify-monitoring.sh
```

## Success Criteria

Your monitoring setup is complete when:

- ✅ All environment variables are configured
- ✅ Sentry is receiving errors and performance data
- ✅ Better Stack is receiving logs from all services
- ✅ All uptime monitors are active and green
- ✅ Alert channels are configured and tested
- ✅ Dashboards are created and accessible
- ✅ Team is trained on monitoring tools
- ✅ Runbook is documented and accessible
- ✅ Verification script passes with 100% success rate

## Monitoring Costs Estimate

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Sentry | Team | $26 |
| Better Stack | Starter | $20 |
| Vercel Analytics | Hobby | $0 |
| **Total** | | **$46** |

*Costs may vary based on usage and scale*

## Support Resources

- **Sentry Documentation**: https://docs.sentry.io/
- **Better Stack Documentation**: https://betterstack.com/docs
- **Vercel Analytics**: https://vercel.com/docs/analytics
- **MentorLink Monitoring Guide**: `docs/MONITORING_SETUP_GUIDE.md`

## Troubleshooting

If you encounter issues:

1. Check the troubleshooting section in `docs/MONITORING_SETUP_GUIDE.md`
2. Run the verification script to identify configuration issues
3. Review service status pages:
   - Sentry: https://status.sentry.io/
   - Better Stack: https://betterstack.com/status
   - Vercel: https://www.vercel-status.com/

---

**Last Updated**: 2024-11-17
**Version**: 1.0.0
