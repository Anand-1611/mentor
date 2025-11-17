# Monitoring Setup Checklist

This checklist ensures all monitoring and logging services are properly configured for production.

## Pre-Deployment Checklist

### 1. Sentry Configuration

- [ ] Create Sentry account at https://sentry.io/
- [ ] Create new project for MentorLink (Platform: React)
- [ ] Copy DSN from project settings
- [ ] Add `VITE_SENTRY_DSN` to Vercel environment variables
- [ ] Add `VITE_SENTRY_ENVIRONMENT=production` to Vercel
- [ ] Configure source maps upload in build process
- [ ] Test error tracking with test error
- [ ] Verify session replay is working
- [ ] Configure data scrubbing for PII
- [ ] Set up release tracking

### 2. Better Stack Configuration

- [ ] Create Better Stack account at https://betterstack.com/
- [ ] Create HTTP source for logs
- [ ] Copy source token
- [ ] Install Better Stack integration in Vercel
- [ ] Configure log drain for Railway/Render (AI services)
- [ ] Test log ingestion
- [ ] Create saved views for common queries
- [ ] Set up log retention policy

### 3. Uptime Monitoring

- [ ] Create monitors in Better Stack:
  - [ ] Frontend (https://your-domain.com)
  - [ ] API (Supabase REST endpoint)
  - [ ] AI Services (/health endpoint)
  - [ ] Storage (Supabase Storage)
- [ ] Configure check intervals (1-2 minutes)
- [ ] Set up multiple monitoring locations
- [ ] Configure expected status codes
- [ ] Test monitors are working

### 4. Alert Configuration

#### Sentry Alerts

- [ ] Create alert rule: High Error Rate (>50 errors in 5 min)
- [ ] Create alert rule: Payment Errors (>5 in 1 hour)
- [ ] Create alert rule: Performance Degradation (p95 >2s)
- [ ] Create alert rule: Critical Errors (immediate)
- [ ] Create alert rule: AI Service Errors (>10 in 15 min)
- [ ] Create alert rule: Slow Database Queries (p95 >1s)

#### Better Stack Alerts

- [ ] Create alert: Service Downtime (down for 2 minutes)
- [ ] Create alert: Slow Response Time (>3s for 5 minutes)
- [ ] Configure escalation policy
- [ ] Test alert notifications

### 5. Notification Channels

- [ ] Configure email notifications
  - [ ] Add team email addresses
  - [ ] Verify email addresses
  - [ ] Test email delivery
- [ ] Configure Slack integration
  - [ ] Install Slack app
  - [ ] Connect workspace
  - [ ] Set up #alerts channel
  - [ ] Set up #critical-alerts channel
  - [ ] Test Slack notifications
- [ ] Configure SMS alerts (optional)
  - [ ] Add phone numbers
  - [ ] Verify numbers
  - [ ] Test SMS delivery
- [ ] Configure PagerDuty (optional)
  - [ ] Create service
  - [ ] Set up on-call schedule
  - [ ] Test incident creation

### 6. Vercel Analytics

- [ ] Enable Vercel Analytics in project settings
- [ ] Choose plan (Hobby is free)
- [ ] Verify Web Vitals tracking
- [ ] Check real user monitoring data
- [ ] Review geographic distribution

### 7. AI Services Monitoring

- [ ] Verify health check endpoint works
- [ ] Test structured logging output
- [ ] Configure log forwarding to Better Stack
- [ ] Set up performance monitoring
- [ ] Test error reporting
- [ ] Monitor LLM API usage and costs

### 8. Database Monitoring

- [ ] Enable Supabase logging
- [ ] Review slow query logs
- [ ] Set up query performance alerts
- [ ] Monitor connection pool usage
- [ ] Check database size and growth

### 9. Performance Monitoring

- [ ] Configure Sentry performance monitoring
- [ ] Set appropriate sample rates (10% production)
- [ ] Monitor Core Web Vitals
- [ ] Track custom metrics
- [ ] Set performance budgets
- [ ] Monitor API response times

### 10. Security Monitoring

- [ ] Configure PII data scrubbing
- [ ] Review sensitive data in logs
- [ ] Set up security alert rules
- [ ] Monitor failed authentication attempts
- [ ] Track suspicious activity patterns

## Post-Deployment Verification

### Day 1

- [ ] Verify all monitors are green
- [ ] Check error rates in Sentry
- [ ] Review log volume in Better Stack
- [ ] Verify alerts are triggering correctly
- [ ] Check performance metrics
- [ ] Review Web Vitals scores

### Week 1

- [ ] Review error trends
- [ ] Analyze slow queries
- [ ] Check alert frequency
- [ ] Optimize alert thresholds
- [ ] Review on-call incidents
- [ ] Update documentation

### Month 1

- [ ] Analyze monthly error reports
- [ ] Review performance trends
- [ ] Optimize monitoring costs
- [ ] Update alert rules based on patterns
- [ ] Conduct incident retrospectives
- [ ] Plan monitoring improvements

## Monitoring Dashboards

### Sentry Dashboard

- [ ] Create custom dashboard with key metrics
- [ ] Add widgets for error trends
- [ ] Add widgets for performance metrics
- [ ] Add widgets for release health
- [ ] Share dashboard with team

### Better Stack Dashboard

- [ ] Create custom dashboard for logs
- [ ] Add uptime status widgets
- [ ] Add log volume charts
- [ ] Add alert history
- [ ] Share dashboard with team

### Admin Dashboard

- [ ] Add monitoring status to admin panel
- [ ] Display service health indicators
- [ ] Show recent errors and alerts
- [ ] Add quick links to external dashboards

## Documentation

- [ ] Document monitoring architecture
- [ ] Create runbook for common issues
- [ ] Document alert response procedures
- [ ] Create on-call guide
- [ ] Document escalation procedures
- [ ] Update team wiki

## Training

- [ ] Train team on Sentry usage
- [ ] Train team on Better Stack
- [ ] Conduct alert response drill
- [ ] Review incident management process
- [ ] Share monitoring best practices

## Maintenance

### Weekly

- [ ] Review error rates and trends
- [ ] Check for new error patterns
- [ ] Review slow queries
- [ ] Verify monitors are working

### Monthly

- [ ] Review and update alert rules
- [ ] Analyze performance trends
- [ ] Review monitoring costs
- [ ] Update documentation
- [ ] Conduct team retrospective

### Quarterly

- [ ] Review monitoring strategy
- [ ] Evaluate new monitoring tools
- [ ] Update performance budgets
- [ ] Review and optimize costs
- [ ] Plan improvements

## Cost Optimization

- [ ] Review Sentry usage and plan
- [ ] Review Better Stack usage and plan
- [ ] Optimize log volume
- [ ] Adjust sample rates
- [ ] Remove unused monitors
- [ ] Consolidate alert rules

## Compliance

- [ ] Ensure GDPR compliance for logs
- [ ] Review data retention policies
- [ ] Document data processing
- [ ] Review access controls
- [ ] Audit monitoring configuration

## Emergency Contacts

- **Primary On-Call**: [Name] - [Phone] - [Email]
- **Secondary On-Call**: [Name] - [Phone] - [Email]
- **Engineering Lead**: [Name] - [Phone] - [Email]
- **CTO**: [Name] - [Phone] - [Email]

## Useful Links

- Sentry Dashboard: https://sentry.io/organizations/[org]/projects/mentorlink/
- Better Stack Dashboard: https://betterstack.com/
- Vercel Analytics: https://vercel.com/[team]/[project]/analytics
- Monitoring Documentation: /docs/MONITORING_AND_LOGGING.md
- Runbook: /docs/RUNBOOK.md
- Incident Response: /docs/INCIDENT_RESPONSE.md

---

**Last Updated**: 2024-11-13  
**Next Review**: 2024-12-13  
**Owner**: Engineering Team
