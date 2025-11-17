# MentorLink Production Deployment Guide

This guide provides step-by-step instructions for deploying MentorLink to production.

## Prerequisites

- GitHub account with repository access
- Vercel account (for frontend hosting)
- Supabase account (for production database)
- Stripe account (for payment processing)
- Railway or Render account (for AI services)
- Sentry account (for error monitoring)
- Domain name (optional, for custom domain)

## Table of Contents

1. [Set Up Production Environment](#1-set-up-production-environment)
2. [Configure Environment Variables](#2-configure-environment-variables)
3. [Deploy Frontend to Vercel](#3-deploy-frontend-to-vercel)
4. [Set Up Monitoring and Logging](#4-set-up-monitoring-and-logging)

---

## 1. Set Up Production Environment

### 1.1 Create Production Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in project details:
   - **Name**: mentorlink-production
   - **Database Password**: Generate a strong password (save this securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Pro (recommended for production)
4. Wait for project creation (2-3 minutes)
5. Note down:
   - Project URL: `https://[project-ref].supabase.co`
   - Anon/Public Key: Found in Settings > API
   - Service Role Key: Found in Settings > API (keep secret!)

### 1.2 Run Database Migrations

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your production project
supabase link --project-ref [your-project-ref]

# Push all migrations to production
supabase db push

# Verify migrations
supabase db diff
```

### 1.3 Configure Production Storage Buckets

1. Go to Supabase Dashboard > Storage
2. Create the following buckets:

**Bucket: notes**
- Public: No
- File size limit: 50 MB
- Allowed MIME types: `application/pdf`

**Bucket: thumbnails**
- Public: Yes
- File size limit: 5 MB
- Allowed MIME types: `image/png, image/jpeg`

**Bucket: grades**
- Public: No
- File size limit: 5 MB
- Allowed MIME types: `image/png, image/jpeg, text/csv`

**Bucket: avatars**
- Public: Yes
- File size limit: 2 MB
- Allowed MIME types: `image/png, image/jpeg`

3. Configure CORS for each bucket:

```sql
-- Run in Supabase SQL Editor
UPDATE storage.buckets
SET cors_allowed_origins = ARRAY['https://your-production-domain.com', 'https://www.your-production-domain.com']
WHERE name IN ('notes', 'thumbnails', 'grades', 'avatars');
```

### 1.4 Set Up Production Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Switch to Production mode (toggle in top-left)
3. Get your API keys:
   - Go to Developers > API keys
   - Copy **Publishable key** (starts with `pk_live_`)
   - Copy **Secret key** (starts with `sk_live_`)
4. Set up webhook endpoint:
   - Go to Developers > Webhooks
   - Click "Add endpoint"
   - URL: `https://[your-supabase-project].supabase.co/functions/v1/stripe-webhook`
   - Events to listen: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy the **Webhook signing secret** (starts with `whsec_`)

### 1.5 Deploy AI Services to Railway

#### Option A: Railway (Recommended)

1. Go to [Railway](https://railway.app/)
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your repository
4. Configure service:
   - **Root Directory**: `ai-services`
   - **Build Command**: `poetry install --no-dev`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (see section 2.3)
6. Enable auto-scaling:
   - Go to Settings > Autoscaling
   - Min instances: 1
   - Max instances: 5
   - Target CPU: 70%
7. Note the deployment URL: `https://[your-service].railway.app`

#### Option B: Render

1. Go to [Render](https://render.com/)
2. Click "New" > "Web Service"
3. Connect your GitHub repository
4. Configure service:
   - **Name**: mentorlink-ai-services
   - **Root Directory**: `ai-services`
   - **Environment**: Docker
   - **Dockerfile Path**: `ai-services/Dockerfile`
   - **Instance Type**: Standard (or higher)
5. Add environment variables (see section 2.3)
6. Enable auto-scaling in plan settings
7. Note the deployment URL: `https://[your-service].onrender.com`

### 1.6 Configure Supabase Edge Functions

Deploy the required Edge Functions:

```bash
# Deploy upload-note function
supabase functions deploy upload-note

# Deploy stripe-webhook function
supabase functions deploy stripe-webhook

# Deploy watermark-pdf function
supabase functions deploy watermark-pdf

# Deploy send-email function
supabase functions deploy send-email

# Set secrets for Edge Functions
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set RESEND_API_KEY=re_...
```

---

## 2. Configure Environment Variables

### 2.1 Vercel Environment Variables

Create a `.env.production` file (DO NOT commit this):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://[your-project-ref].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=[your-project-ref]

# Storage Configuration
VITE_STORAGE_URL=https://[your-project-ref].supabase.co/storage/v1

# Stripe Configuration (Production)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# AI Services Configuration
VITE_AI_SERVICE_URL=https://[your-ai-service].railway.app

# Sentry Configuration
VITE_SENTRY_DSN=https://[your-sentry-dsn]@sentry.io/[project-id]
VITE_SENTRY_ENVIRONMENT=production

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_VIDEO_CALLS=true
```

### 2.2 Supabase Edge Function Secrets

Set these in Supabase Dashboard > Edge Functions > Secrets:

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
DAILY_API_KEY=... # For video calls
```

### 2.3 AI Services Environment Variables

Set these in Railway/Render dashboard:

```env
# Supabase Configuration
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_SERVICE_KEY=[your-service-role-key]

# AI Provider Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Storage Configuration
STORAGE_URL=https://[your-project-ref].supabase.co/storage/v1

# Application Settings
ENVIRONMENT=production
LOG_LEVEL=INFO
MAX_WORKERS=4
FAISS_INDEX_PATH=/app/data/faiss_index

# CORS Settings
CORS_ORIGINS=https://your-production-domain.com,https://www.your-production-domain.com
```

### 2.4 CORS Configuration

Update CORS settings in AI services (`ai-services/app/main.py`):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-production-domain.com",
        "https://www.your-production-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 3. Deploy Frontend to Vercel

### 3.1 Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite configuration

### 3.2 Configure Build Settings

**Framework Preset**: Vite
**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

### 3.3 Add Environment Variables

1. Go to Project Settings > Environment Variables
2. Add all variables from `.env.production`
3. Set environment: **Production**
4. Click "Save"

### 3.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Vercel will provide a deployment URL: `https://[your-project].vercel.app`

### 3.5 Set Up Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain: `your-domain.com`
3. Follow DNS configuration instructions:
   - Add A record: `76.76.21.21`
   - Add CNAME record: `cname.vercel-dns.com`
4. Wait for DNS propagation (5-60 minutes)
5. SSL certificate will be auto-provisioned

### 3.6 Enable Vercel Analytics

1. Go to Project Settings > Analytics
2. Click "Enable Analytics"
3. Choose plan (Hobby is free)
4. Analytics will start collecting data automatically

### 3.7 Configure Deployment Protection

1. Go to Project Settings > Deployment Protection
2. Enable "Vercel Authentication" for preview deployments
3. Add team members who should have access

---

## 4. Set Up Monitoring and Logging

### 4.1 Configure Sentry for Error Tracking

1. Go to [Sentry](https://sentry.io/)
2. Create new project:
   - Platform: React
   - Name: mentorlink-production
3. Copy the DSN: `https://[key]@sentry.io/[project-id]`
4. Add to Vercel environment variables: `VITE_SENTRY_DSN`
5. Sentry is already integrated in `src/main.tsx`

**Verify Sentry Integration:**
```typescript
// Test error in browser console
throw new Error("Test Sentry Integration");
```

### 4.2 Set Up Better Stack for Log Aggregation

1. Go to [Better Stack](https://betterstack.com/)
2. Create new source:
   - Type: HTTP
   - Name: mentorlink-logs
3. Copy the source token
4. Configure log shipping:

**For Vercel:**
- Install Vercel integration from Better Stack
- Logs will be automatically forwarded

**For Railway/Render:**
- Add log drain URL in platform settings
- URL: `https://in.logs.betterstack.com/[source-token]`

### 4.3 Create Uptime Monitoring

1. In Better Stack, go to Uptime Monitoring
2. Create monitors for critical endpoints:

**Frontend Monitor:**
- URL: `https://your-domain.com`
- Check interval: 1 minute
- Timeout: 10 seconds

**API Monitor:**
- URL: `https://[supabase-project].supabase.co/rest/v1/`
- Check interval: 1 minute
- Headers: `apikey: [your-anon-key]`

**AI Services Monitor:**
- URL: `https://[ai-service].railway.app/health`
- Check interval: 2 minutes

### 4.4 Set Up Alerts for Error Rate Spikes

**Sentry Alerts:**
1. Go to Alerts > Create Alert Rule
2. Configure:
   - **Condition**: Error count > 50 in 5 minutes
   - **Action**: Send email + Slack notification
   - **Environment**: production

**Better Stack Alerts:**
1. Go to Incidents > Policies
2. Create policy:
   - **Trigger**: Service down for 2 minutes
   - **Escalation**: Email immediately, SMS after 5 minutes
   - **On-call schedule**: Set up rotation

### 4.5 Set Up Performance Monitoring

**Vercel Analytics:**
- Automatically tracks Core Web Vitals
- View in Vercel Dashboard > Analytics

**Sentry Performance:**
1. Enable in Sentry project settings
2. Set sample rate in `src/main.tsx`:
```typescript
Sentry.init({
  tracesSampleRate: 0.1, // 10% of transactions
});
```

---

## Post-Deployment Checklist

- [ ] All migrations applied successfully
- [ ] Storage buckets created and configured
- [ ] Stripe webhooks receiving events
- [ ] AI services responding to health checks
- [ ] Frontend loads without errors
- [ ] User registration and login working
- [ ] File uploads working
- [ ] Payment flow completing successfully
- [ ] Email notifications sending
- [ ] Sentry receiving error reports
- [ ] Uptime monitors active
- [ ] SSL certificate valid
- [ ] Custom domain resolving (if applicable)
- [ ] Analytics tracking pageviews
- [ ] Performance metrics within acceptable range

---

## Rollback Procedure

If issues arise after deployment:

### Frontend Rollback (Vercel)
1. Go to Deployments
2. Find previous stable deployment
3. Click "..." > "Promote to Production"

### Database Rollback (Supabase)
```bash
# Revert last migration
supabase db reset --db-url [production-url]

# Or restore from backup
# Go to Supabase Dashboard > Database > Backups
```

### AI Services Rollback (Railway/Render)
1. Go to Deployments
2. Select previous deployment
3. Click "Redeploy"

---

## Maintenance

### Regular Tasks

**Daily:**
- Check error rates in Sentry
- Monitor uptime status
- Review performance metrics

**Weekly:**
- Review and optimize slow database queries
- Check storage usage and costs
- Update dependencies with security patches

**Monthly:**
- Review and rotate API keys
- Analyze usage patterns and scale resources
- Backup database manually (in addition to automatic backups)

---

## Support and Troubleshooting

### Common Issues

**Issue: High error rate after deployment**
- Check Sentry for error details
- Verify all environment variables are set correctly
- Check API endpoint connectivity

**Issue: Slow page loads**
- Review Vercel Analytics for bottlenecks
- Check database query performance
- Verify CDN is serving static assets

**Issue: Payment failures**
- Verify Stripe webhook is receiving events
- Check Stripe dashboard for failed payments
- Ensure webhook secret is correct

### Getting Help

- Supabase: [support.supabase.com](https://support.supabase.com)
- Vercel: [vercel.com/support](https://vercel.com/support)
- Railway: [help.railway.app](https://help.railway.app)
- Stripe: [support.stripe.com](https://support.stripe.com)

---

## Security Considerations

1. **Never commit secrets to Git**
   - Use `.env.local` for local development
   - Use platform environment variables for production

2. **Rotate keys regularly**
   - API keys: Every 90 days
   - Database passwords: Every 180 days

3. **Enable 2FA**
   - On all platform accounts (Vercel, Supabase, Stripe, etc.)

4. **Monitor for vulnerabilities**
   - Use `npm audit` regularly
   - Enable Dependabot alerts on GitHub

5. **Implement rate limiting**
   - Already configured in Supabase RLS policies
   - Monitor for abuse patterns

---

## Cost Estimates

**Monthly costs (approximate):**
- Supabase Pro: $25/month
- Vercel Pro: $20/month (optional, Hobby is free)
- Railway/Render: $7-50/month (depending on usage)
- Sentry: $26/month (Team plan)
- Better Stack: $20/month
- Stripe: 2.9% + $0.30 per transaction
- Domain: $12/year

**Total: ~$100-150/month** (excluding transaction fees)

---

## Next Steps

After successful deployment:

1. Set up staging environment for testing
2. Implement CI/CD pipeline for automated deployments
3. Configure database backups and disaster recovery
4. Set up load testing for peak traffic scenarios
5. Implement feature flags for gradual rollouts
6. Create runbooks for common operational tasks

