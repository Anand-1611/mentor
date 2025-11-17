# Monitoring Quick Reference Card

Quick reference for MentorLink monitoring setup with actual project details.

## 🔑 Project Details

**Supabase Project ID**: `kdtcwnnddukdbgkylmxq`

**Supabase URL**: `https://kdtcwnnddukdbgkylmxq.supabase.co`

**Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdGN3bm5kZHVrZGJna3lsbXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIyNDEsImV4cCI6MjA3ODk0ODI0MX0.nNr6d_0U5OE09PsIJrWqJPyKmp7anPsFxfIntbDpsEo`

## 📊 Monitoring Endpoints

### Supabase API
```
URL: https://kdtcwnnddukdbgkylmxq.supabase.co/rest/v1/
Method: GET
Headers: apikey: [anon-key]
Expected: 200 OK
```

### Supabase Storage
```
URL: https://kdtcwnnddukdbgkylmxq.supabase.co/storage/v1/
Method: GET
Expected: 200 OK
```

### Edge Functions (Stripe Webhook)
```
URL: https://kdtcwnnddukdbgkylmxq.supabase.co/functions/v1/stripe-webhook
Method: POST
Expected: 400 (without valid payload)
```

### AI Services Health Check
```
URL: https://[your-service].railway.app/health
Method: GET
Expected: 200 OK
Body: {"status":"healthy"}
```

## 🚀 Quick Setup Commands

### 1. Test Supabase API
```bash
curl -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdGN3bm5kZHVrZGJna3lsbXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIyNDEsImV4cCI6MjA3ODk0ODI0MX0.nNr6d_0U5OE09PsIJrWqJPyKmp7anPsFxfIntbDpsEo" https://kdtcwnnddukdbgkylmxq.supabase.co/rest/v1/
```

### 2. Test Storage API
```bash
curl https://kdtcwnnddukdbgkylmxq.supabase.co/storage/v1/
```

### 3. Verify Monitoring Setup
```bash
# Windows
.\scripts\verify-monitoring.ps1

# Unix/Linux/macOS
./scripts/verify-monitoring.sh
```

## 🔔 Better Stack Monitor Configuration

Copy these exact values when creating monitors in Better Stack:

### Monitor 1: Supabase API
```yaml
Name: MentorLink - Supabase API
URL: https://kdtcwnnddukdbgkylmxq.supabase.co/rest/v1/
Method: GET
Headers:
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdGN3bm5kZHVrZGJna3lsbXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIyNDEsImV4cCI6MjA3ODk0ODI0MX0.nNr6d_0U5OE09PsIJrWqJPyKmp7anPsFxfIntbDpsEo
Interval: 60 seconds
Expected Status: 200
```

### Monitor 2: Supabase Storage
```yaml
Name: MentorLink - Supabase Storage
URL: https://kdtcwnnddukdbgkylmxq.supabase.co/storage/v1/
Method: GET
Interval: 300 seconds (5 minutes)
Expected Status: 200
```

### Monitor 3: Stripe Webhook
```yaml
Name: MentorLink - Stripe Webhook
URL: https://kdtcwnnddukdbgkylmxq.supabase.co/functions/v1/stripe-webhook
Method: POST
Interval: 300 seconds (5 minutes)
Expected Status: 400
```

## 📝 Environment Variables for Vercel

Add these to Vercel → Settings → Environment Variables:

```bash
# Sentry (get DSN from sentry.io after creating project)
VITE_SENTRY_DSN=https://[your-key]@o[org-id].ingest.sentry.io/[project-id]
VITE_SENTRY_ENVIRONMENT=production

# Already configured
VITE_SUPABASE_URL=https://kdtcwnnddukdbgkylmxq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdGN3bm5kZHVrZGJna3lsbXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIyNDEsImV4cCI6MjA3ODk0ODI0MX0.nNr6d_0U5OE09PsIJrWqJPyKmp7anPsFxfIntbDpsEo
```

## 🔧 Better Stack Log Drain

Configure in Vercel → Settings → Integrations → Log Drains:

```bash
# After creating Better Stack HTTP source
Endpoint: https://in.logs.betterstack.com/[your-source-token]
Format: JSON
```

## 📊 Sentry Configuration

### Create Project
1. Go to https://sentry.io/signup/
2. Create new project
3. Platform: **React**
4. Project name: **mentorlink-production**
5. Copy DSN

### Alert Rules to Create

1. **High Error Rate**: >50 errors in 5 min → Email + Slack
2. **Payment Errors**: >5 errors in 1 hour → Email + Slack (critical)
3. **Performance**: p95 >2s for 10 min → Email
4. **Critical Errors**: Any fatal/critical → Email + Slack + PagerDuty
5. **AI Service**: >10 errors in 15 min → Email + Slack
6. **DB Performance**: p95 >1s for 10 min → Email

## 🧪 Testing

### Test Error Tracking
```javascript
// In browser console on production site
throw new Error("Test Sentry Integration - " + new Date().toISOString());
```

### Test Monitoring
```bash
# Check all endpoints are accessible
curl https://kdtcwnnddukdbgkylmxq.supabase.co/rest/v1/
curl https://kdtcwnnddukdbgkylmxq.supabase.co/storage/v1/
```

## 📞 Support Links

- **Sentry Dashboard**: https://sentry.io/
- **Better Stack Logs**: https://logs.betterstack.com/
- **Better Stack Uptime**: https://uptime.betterstack.com/
- **Supabase Dashboard**: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq

## ✅ Verification Checklist

- [ ] Sentry project created
- [ ] Sentry DSN added to Vercel
- [ ] Better Stack account created
- [ ] Log drain configured in Vercel
- [ ] Uptime monitors created (3 monitors)
- [ ] Alert channels configured (email, Slack)
- [ ] Test error triggered and captured
- [ ] Logs appearing in Better Stack
- [ ] All monitors showing green

## 💰 Cost Estimate

- **Sentry Free**: 5,000 errors/month, 10,000 transactions/month
- **Better Stack Free**: 1 GB logs/month, 10 monitors
- **Total**: $0/month (free tier sufficient for MVP)

Upgrade to paid plans when you exceed free tier limits.

---

**Project**: MentorLink
**Project ID**: kdtcwnnddukdbgkylmxq
**Last Updated**: 2024-11-17
