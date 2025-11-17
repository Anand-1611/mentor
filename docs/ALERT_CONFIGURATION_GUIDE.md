# Alert Configuration Guide

This guide provides detailed instructions for configuring alerts across all monitoring platforms.

## Table of Contents

1. [Sentry Alert Rules](#sentry-alert-rules)
2. [Better Stack Uptime Alerts](#better-stack-uptime-alerts)
3. [Better Stack Log Alerts](#better-stack-log-alerts)
4. [Alert Channels](#alert-channels)
5. [Escalation Policies](#escalation-policies)
6. [Testing Alerts](#testing-alerts)

---

## Sentry Alert Rules

### 1. High Error Rate Alert

**Purpose**: Detect sudden spikes in error rate

**Configuration**:
```yaml
Name: High Error Rate
Environment: production
Conditions:
  - Type: Event Frequency
  - Threshold: 50 errors
  - Time Window: 5 minutes
Actions:
  - Email: engineering@your-domain.com
  - Slack: #alerts
Frequency: Every 15 minutes
Auto-resolve: When error count < 10 in 5 minutes
```

**Setup Steps**:
1. Go to Sentry → Alerts → Create Alert Rule
2. Select "Issues" alert type
3. Set condition: "The issue is seen more than 50 times in 5 minutes"
4. Filter: Environment is production
5. Add actions: Email + Slack
6. Set frequency: 15 minutes
7. Save rule

### 2. Payment Processing Errors

**Purpose**: Immediate notification of payment failures

**Configuration**:
```yaml
Name: Payment Processing Errors
Environment: production
Conditions:
  - Type: Event Frequency
  - Threshold: 5 errors
  - Time Window: 1 hour
Filters:
  - Tag: category equals payment
Actions:
  - Email: engineering@your-domain.com
  - Slack: #critical-alerts
Frequency: Every 5 minutes
Priority: High
```

**Setup Steps**:
1. Create new alert rule
2. Set condition: "The issue is seen more than 5 times in 1 hour"
3. Add filter: "Tag category equals payment"
4. Add actions: Email + Slack (#critical-alerts)
5. Set frequency: 5 minutes
6. Set priority: High
7. Save rule

### 3. Performance Degradation

**Purpose**: Alert when response times are too high

**Configuration**:
```yaml
Name: Performance Degradation
Environment: production
Conditions:
  - Type: Transaction Duration
  - Percentile: p95
  - Threshold: 2000ms
  - Time Window: 10 minutes
Actions:
  - Email: engineering@your-domain.com
Frequency: Every 30 minutes
```

**Setup Steps**:
1. Go to Sentry → Alerts → Create Alert Rule
2. Select "Metric" alert type
3. Choose metric: "Transaction Duration (p95)"
4. Set threshold: Above 2000ms for 10 minutes
5. Filter: Environment is production
6. Add action: Email
7. Set frequency: 30 minutes
8. Save rule

### 4. Critical Errors

**Purpose**: Immediate notification of fatal errors

**Configuration**:
```yaml
Name: Critical Errors
Environment: production
Conditions:
  - Type: Event Frequency
  - Threshold: 1 error
  - Time Window: 1 minute
Filters:
  - Level: fatal OR critical
Actions:
  - Email: engineering@your-domain.com
  - Slack: #critical-alerts
  - PagerDuty: mentorlink-production
Frequency: Immediately
Priority: Critical
```

**Setup Steps**:
1. Create new alert rule
2. Set condition: "The issue is seen more than 1 time in 1 minute"
3. Add filter: "Level is fatal or critical"
4. Add actions: Email + Slack + PagerDuty
5. Set frequency: 0 (immediate)
6. Set priority: Critical
7. Save rule

### 5. AI Service Errors

**Purpose**: Monitor AI service health

**Configuration**:
```yaml
Name: AI Service Errors
Environment: production
Conditions:
  - Type: Event Frequency
  - Threshold: 10 errors
  - Time Window: 15 minutes
Filters:
  - Tag: service equals ai-services
Actions:
  - Email: engineering@your-domain.com
  - Slack: #alerts
Frequency: Every 15 minutes
```

**Setup Steps**:
1. Create new alert rule
2. Set condition: "The issue is seen more than 10 times in 15 minutes"
3. Add filter: "Tag service equals ai-services"
4. Add actions: Email + Slack
5. Set frequency: 15 minutes
6. Save rule

### 6. Database Query Performance

**Purpose**: Detect slow database queries

**Configuration**:
```yaml
Name: Database Query Performance
Environment: production
Conditions:
  - Type: Transaction Duration
  - Percentile: p95
  - Threshold: 1000ms
  - Time Window: 10 minutes
Filters:
  - Transaction: db.query
Actions:
  - Email: engineering@your-domain.com
Frequency: Every 30 minutes
```

**Setup Steps**:
1. Create metric alert rule
2. Choose metric: "Transaction Duration (p95)"
3. Set threshold: Above 1000ms for 10 minutes
4. Add filter: "Transaction operation is db.query"
5. Add action: Email
6. Set frequency: 30 minutes
7. Save rule

---

## Better Stack Uptime Alerts

### 1. Frontend Downtime Alert

**Configuration**:
```yaml
Monitor: Frontend - Production
Trigger: Service down for 2 minutes
Actions:
  - Email: Immediate
  - Slack: Immediate
  - SMS: After 5 minutes
Escalation: Phone call after 10 minutes
```

**Setup Steps**:
1. Go to Better Stack → Uptime → Select Monitor
2. Click "Alerts" tab
3. Enable "Downtime Alert"
4. Set threshold: 2 minutes
5. Add notification channels:
   - Email: Immediate
   - Slack: Immediate
   - SMS: After 5 minutes
6. Set escalation: Phone after 10 minutes
7. Save settings

### 2. API Slow Response Alert

**Configuration**:
```yaml
Monitor: API - Supabase
Trigger: Response time > 3000ms for 5 minutes
Actions:
  - Email: engineering@your-domain.com
Frequency: Every 15 minutes
```

**Setup Steps**:
1. Select API monitor
2. Click "Alerts" tab
3. Enable "Slow Response Alert"
4. Set threshold: 3000ms for 5 minutes
5. Add email notification
6. Set frequency: 15 minutes
7. Save settings

### 3. AI Services Health Alert

**Configuration**:
```yaml
Monitor: AI Services - Health Check
Trigger: Service down for 3 minutes
Actions:
  - Email: Immediate
  - Slack: #alerts
```

**Setup Steps**:
1. Select AI Services monitor
2. Enable downtime alert
3. Set threshold: 3 minutes
4. Add email and Slack notifications
5. Save settings

---

## Better Stack Log Alerts

### 1. Error Log Spike Alert

**Purpose**: Detect sudden increase in error logs

**Configuration**:
```yaml
Name: Error Log Spike
Query: level:error
Threshold: 50 logs in 5 minutes
Actions:
  - Email: engineering@your-domain.com
  - Slack: #alerts
```

**Setup Steps**:
1. Go to Better Stack → Logs → Alerts
2. Click "Create Alert"
3. Name: "Error Log Spike"
4. Query: `level:error`
5. Condition: Count > 50 in 5 minutes
6. Add actions: Email + Slack
7. Save alert

### 2. Payment Error Logs

**Purpose**: Monitor payment-related errors

**Configuration**:
```yaml
Name: Payment Error Logs
Query: level:error AND category:payment
Threshold: 5 logs in 1 hour
Actions:
  - Email: engineering@your-domain.com
  - Slack: #critical-alerts
```

**Setup Steps**:
1. Create new log alert
2. Query: `level:error AND category:payment`
3. Condition: Count > 5 in 1 hour
4. Add actions: Email + Slack
5. Save alert

### 3. Slow Query Logs

**Purpose**: Detect slow database queries

**Configuration**:
```yaml
Name: Slow Query Logs
Query: duration_ms:>1000
Threshold: 20 logs in 10 minutes
Actions:
  - Email: engineering@your-domain.com
```

**Setup Steps**:
1. Create new log alert
2. Query: `duration_ms:>1000`
3. Condition: Count > 20 in 10 minutes
4. Add email notification
5. Save alert

---

## Alert Channels

### Email Configuration

**Primary Email**:
```yaml
Address: engineering@your-domain.com
Purpose: All alerts
Priority: Normal
```

**Secondary Email**:
```yaml
Address: admin@your-domain.com
Purpose: Critical alerts only
Priority: High
```

**Setup**:
1. Go to Settings → Notification Channels
2. Add email addresses
3. Verify each email
4. Set notification preferences

### Slack Configuration

**Alerts Channel**:
```yaml
Channel: #alerts
Purpose: General alerts
Notifications: All alerts except critical
```

**Critical Alerts Channel**:
```yaml
Channel: #critical-alerts
Purpose: Critical incidents
Notifications: Payment errors, downtime, fatal errors
Mentions: @channel
```

**Setup**:
1. Install Slack integration in Sentry
2. Install Slack integration in Better Stack
3. Authorize workspace
4. Select channels
5. Configure mention rules
6. Test notifications

### SMS Configuration

**Purpose**: Critical alerts only

**Configuration**:
```yaml
Numbers:
  - +1234567890 (Primary on-call)
  - +0987654321 (Secondary on-call)
Triggers:
  - Service downtime > 5 minutes
  - Critical errors
  - Payment system failures
```

**Setup**:
1. Go to Settings → Notification Channels
2. Add phone numbers
3. Verify numbers via SMS
4. Configure for critical alerts only
5. Test SMS delivery

### PagerDuty Configuration (Optional)

**Purpose**: On-call escalation

**Configuration**:
```yaml
Service: mentorlink-production
Integration: Sentry + Better Stack
Escalation Policy:
  - Primary: Immediate
  - Secondary: After 5 minutes
  - Manager: After 15 minutes
```

**Setup**:
1. Create PagerDuty service
2. Get integration key
3. Add to Sentry integrations
4. Add to Better Stack integrations
5. Configure escalation policy
6. Test incident creation

---

## Escalation Policies

### Standard Escalation

```yaml
Step 1 (0 minutes):
  - Email: engineering@your-domain.com
  - Slack: #alerts

Step 2 (5 minutes):
  - SMS: Primary on-call

Step 3 (10 minutes):
  - Phone: Primary on-call

Step 4 (15 minutes):
  - SMS: Secondary on-call
  - Email: manager@your-domain.com
```

### Critical Escalation

```yaml
Step 1 (0 minutes):
  - Email: engineering@your-domain.com
  - Slack: #critical-alerts (@channel)
  - SMS: Primary on-call

Step 2 (5 minutes):
  - Phone: Primary on-call
  - SMS: Secondary on-call

Step 3 (10 minutes):
  - Phone: Secondary on-call
  - Email: manager@your-domain.com
  - PagerDuty: Create incident
```

---

## Testing Alerts

### Test Sentry Alerts

```javascript
// In browser console on production site
throw new Error("Test Sentry Alert");
```

Expected:
- Error appears in Sentry dashboard
- Alert triggered if threshold met
- Notification sent to configured channels

### Test Uptime Alerts

```bash
# Temporarily stop a service or use Better Stack test feature
# Go to Better Stack → Monitor → Test Alert
```

Expected:
- Alert triggered after threshold time
- Notifications sent to all channels
- Escalation follows configured policy

### Test Log Alerts

```bash
# Generate error logs
curl -X POST https://your-api.com/test-error

# Check Better Stack logs
# Alert should trigger if threshold met
```

Expected:
- Logs appear in Better Stack
- Alert triggered when threshold reached
- Notifications sent

### Test Alert Channels

**Email**:
```bash
# Send test email from Better Stack
# Settings → Notification Channels → Email → Test
```

**Slack**:
```bash
# Send test message from Better Stack
# Settings → Integrations → Slack → Test
```

**SMS**:
```bash
# Send test SMS from Better Stack
# Settings → Notification Channels → SMS → Test
```

---

## Alert Tuning

### Reducing False Positives

1. **Increase thresholds** if too many alerts
2. **Extend time windows** for transient issues
3. **Add filters** to exclude known issues
4. **Use auto-resolve** to clear resolved issues

### Reducing Alert Fatigue

1. **Group related alerts** into single notification
2. **Set appropriate frequencies** (not too often)
3. **Use escalation policies** instead of immediate all-channel alerts
4. **Regular review** of alert effectiveness

### Optimizing Response Time

1. **Critical alerts** should page immediately
2. **Non-critical alerts** can wait for business hours
3. **Use different channels** for different priorities
4. **Clear runbooks** for each alert type

---

## Alert Maintenance

### Weekly Review

- Review triggered alerts
- Check for false positives
- Adjust thresholds if needed
- Update notification channels

### Monthly Review

- Analyze alert patterns
- Review response times
- Update escalation policies
- Optimize alert rules

### Quarterly Review

- Review all alert rules
- Update runbooks
- Train team on new alerts
- Optimize costs

---

**Last Updated**: 2024-11-17
**Version**: 1.0.0
