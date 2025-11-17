# MentorLink Production Deployment Checklist

Use this checklist to ensure all deployment steps are completed correctly.

## Pre-Deployment

### Code Preparation
- [ ] All features tested in development environment
- [ ] No console.log statements in production code
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Build succeeds locally: `npm run build`
- [ ] All tests passing (if applicable)
- [ ] Dependencies updated and audited: `npm audit`
- [ ] Git repository clean (no uncommitted changes)
- [ ] Latest code pushed to main branch

### Documentation
- [ ] README.md updated with production setup instructions
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Deployment guide reviewed

---

## 1. Set Up Production Environment

### 1.1 Supabase Production Project
- [ ] Production Supabase project created
- [ ] Project URL and API keys saved securely
- [ ] Database password stored in password manager
- [ ] Project region selected (closest to users)
- [ ] Pricing plan upgraded to Pro

### 1.2 Database Migrations
- [ ] Supabase CLI installed: `npm install -g supabase`
- [ ] Linked to production project: `supabase link`
- [ ] All migrations pushed: `supabase db push`
- [ ] Migrations verified: `supabase db diff`
- [ ] No migration errors in logs
- [ ] Sample data seeded (if needed)

### 1.3 Storage Buckets
- [ ] `notes` bucket created (Private, 50MB limit, PDF only)
- [ ] `thumbnails` bucket created (Public, 5MB limit, images)
- [ ] `grades` bucket created (Private, 5MB limit, images/CSV)
- [ ] `avatars` bucket created (Public, 2MB limit, images)
- [ ] CORS configured for all buckets
- [ ] RLS policies applied to buckets
- [ ] Test file upload to each bucket

### 1.4 Stripe Production Setup
- [ ] Stripe account switched to Production mode
- [ ] Live API keys obtained (pk_live_ and sk_live_)
- [ ] Webhook endpoint created
- [ ] Webhook URL: `https://[project].supabase.co/functions/v1/stripe-webhook`
- [ ] Webhook events configured: `checkout.session.completed`, `payment_intent.succeeded`
- [ ] Webhook signing secret saved
- [ ] Test payment completed successfully
- [ ] Webhook receiving events (check Stripe dashboard)

### 1.5 AI Services Deployment

#### Railway Deployment
- [ ] Railway account created
- [ ] New project created from GitHub repo
- [ ] Root directory set to `ai-services`
- [ ] Environment variables added (see section 2.3)
- [ ] Auto-scaling configured (1-5 instances)
- [ ] Service deployed successfully
- [ ] Health check endpoint responding: `/health`
- [ ] Deployment URL noted

#### OR Render Deployment
- [ ] Render account created
- [ ] New web service created
- [ ] Docker environment selected
- [ ] Dockerfile path set: `ai-services/Dockerfile`
- [ ] Environment variables added
- [ ] Disk storage configured (10GB for FAISS)
- [ ] Service deployed successfully
- [ ] Health check endpoint responding: `/health`
- [ ] Deployment URL noted

### 1.6 Supabase Edge Functions
- [ ] `upload-note` function deployed
- [ ] `stripe-webhook` function deployed
- [ ] `watermark-pdf` function deployed
- [ ] `send-email` function deployed
- [ ] Edge function secrets set:
  - [ ] STRIPE_SECRET_KEY
  - [ ] STRIPE_WEBHOOK_SECRET
  - [ ] OPENAI_API_KEY
  - [ ] ANTHROPIC_API_KEY (optional)
  - [ ] RESEND_API_KEY
  - [ ] DAILY_API_KEY (for video calls)
- [ ] All functions responding to test requests

---

## 2. Configure Environment Variables

### 2.1 Create Production Environment File
- [ ] `.env.production` file created (not committed)
- [ ] All variables from `.env.production.example` filled in
- [ ] No placeholder values remaining
- [ ] File added to `.gitignore`

### 2.2 Vercel Environment Variables
- [ ] VITE_SUPABASE_URL set
- [ ] VITE_SUPABASE_PUBLISHABLE_KEY set
- [ ] VITE_SUPABASE_PROJECT_ID set
- [ ] VITE_STORAGE_URL set
- [ ] VITE_STRIPE_PUBLISHABLE_KEY set (pk_live_)
- [ ] VITE_AI_SERVICE_URL set
- [ ] VITE_SENTRY_DSN set
- [ ] VITE_SENTRY_ENVIRONMENT set to "production"
- [ ] All variables set for "Production" environment
- [ ] Variables encrypted and saved

### 2.3 AI Services Environment Variables
- [ ] SUPABASE_URL set
- [ ] SUPABASE_SERVICE_KEY set
- [ ] OPENAI_API_KEY set
- [ ] ANTHROPIC_API_KEY set (optional)
- [ ] STORAGE_URL set
- [ ] ENVIRONMENT set to "production"
- [ ] LOG_LEVEL set to "INFO"
- [ ] MAX_WORKERS set to 4
- [ ] FAISS_INDEX_PATH set
- [ ] CORS_ORIGINS set to production domain(s)

### 2.4 CORS Configuration
- [ ] AI services CORS updated with production domains
- [ ] Supabase storage CORS updated
- [ ] No wildcard (*) origins in production
- [ ] Both www and non-www domains included (if applicable)

---

## 3. Deploy Frontend to Vercel

### 3.1 Connect Repository
- [ ] Vercel account created/logged in
- [ ] GitHub repository connected
- [ ] Correct repository selected
- [ ] Vercel detected Vite framework

### 3.2 Build Configuration
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`
- [ ] Node.js version: 18.x or higher

### 3.3 Environment Variables
- [ ] All production environment variables added
- [ ] Variables set for "Production" environment
- [ ] Sensitive values not exposed in build logs
- [ ] Variables saved and encrypted

### 3.4 Initial Deployment
- [ ] Deployment triggered
- [ ] Build completed successfully (no errors)
- [ ] Deployment URL accessible
- [ ] Application loads without errors
- [ ] No console errors in browser
- [ ] All pages accessible
- [ ] Assets loading correctly

### 3.5 Custom Domain (Optional)
- [ ] Custom domain purchased
- [ ] Domain added in Vercel settings
- [ ] DNS records configured:
  - [ ] A record: 76.76.21.21
  - [ ] CNAME record: cname.vercel-dns.com
- [ ] DNS propagation complete (check with `dig` or `nslookup`)
- [ ] SSL certificate provisioned automatically
- [ ] HTTPS working correctly
- [ ] HTTP redirects to HTTPS
- [ ] www redirects to non-www (or vice versa)

### 3.6 Vercel Analytics
- [ ] Analytics enabled in project settings
- [ ] Plan selected (Hobby/Pro)
- [ ] Analytics tracking pageviews
- [ ] Core Web Vitals being measured

### 3.7 Deployment Protection
- [ ] Vercel Authentication enabled for previews
- [ ] Team members added with appropriate access
- [ ] Production deployments protected

---

## 4. Set Up Monitoring and Logging

### 4.1 Sentry Error Tracking
- [ ] Sentry account created
- [ ] New project created (React platform)
- [ ] Project name: mentorlink-production
- [ ] DSN copied
- [ ] DSN added to Vercel environment variables
- [ ] Sentry initialized in `src/main.tsx`
- [ ] Source maps uploaded (automatic with Vercel)
- [ ] Test error sent and received
- [ ] Error grouping working correctly
- [ ] Release tracking configured

### 4.2 Sentry Performance Monitoring
- [ ] Performance monitoring enabled
- [ ] Traces sample rate set (0.1 = 10%)
- [ ] Transaction tracking working
- [ ] Slow queries identified
- [ ] Performance budgets set

### 4.3 Better Stack Log Aggregation
- [ ] Better Stack account created
- [ ] HTTP source created for logs
- [ ] Source token copied
- [ ] Vercel integration installed
- [ ] Logs flowing from Vercel
- [ ] Railway/Render log drain configured
- [ ] Logs searchable and filterable
- [ ] Log retention period set

### 4.4 Uptime Monitoring
- [ ] Frontend monitor created
  - [ ] URL: Production domain
  - [ ] Interval: 1 minute
  - [ ] Timeout: 10 seconds
  - [ ] Locations: Multiple regions
- [ ] API monitor created
  - [ ] URL: Supabase REST endpoint
  - [ ] Headers: apikey configured
  - [ ] Interval: 1 minute
- [ ] AI services monitor created
  - [ ] URL: /health endpoint
  - [ ] Interval: 2 minutes
- [ ] All monitors active and green

### 4.5 Alert Configuration

#### Sentry Alerts
- [ ] Alert rule created for error spikes
- [ ] Condition: >50 errors in 5 minutes
- [ ] Email notifications configured
- [ ] Slack integration added (optional)
- [ ] On-call schedule set

#### Better Stack Alerts
- [ ] Incident policy created
- [ ] Trigger: Service down for 2 minutes
- [ ] Email notification immediate
- [ ] SMS notification after 5 minutes
- [ ] On-call rotation configured
- [ ] Escalation policy set

#### Performance Alerts
- [ ] Slow query alerts configured
- [ ] High CPU usage alerts set
- [ ] Memory usage alerts set
- [ ] Disk space alerts configured

---

## Post-Deployment Verification

### Functional Testing
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Email verification received
- [ ] User login successful
- [ ] Profile page accessible
- [ ] Notes marketplace loads
- [ ] File upload works (test with small PDF)
- [ ] Thumbnail generation successful
- [ ] Note preview displays correctly
- [ ] Payment flow completes (test mode first)
- [ ] Watermarked PDF downloads
- [ ] Mentor application submits
- [ ] Verification test loads
- [ ] Booking calendar displays
- [ ] AI flashcard generation works
- [ ] Chat with PDF responds
- [ ] Quiz generation successful
- [ ] Dashboard analytics display
- [ ] Search functionality works
- [ ] Filters apply correctly

### Performance Testing
- [ ] Lighthouse score >90 for Performance
- [ ] First Contentful Paint <1.5s
- [ ] Largest Contentful Paint <2.5s
- [ ] Time to Interactive <3.5s
- [ ] Cumulative Layout Shift <0.1
- [ ] No memory leaks detected
- [ ] API response times <500ms
- [ ] Database queries optimized

### Security Testing
- [ ] HTTPS enforced everywhere
- [ ] Security headers present (check vercel.json)
- [ ] No sensitive data in client-side code
- [ ] API keys not exposed in frontend
- [ ] RLS policies working correctly
- [ ] CORS configured properly (no wildcards)
- [ ] Rate limiting active
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] CSRF protection verified

### Monitoring Verification
- [ ] Sentry receiving errors
- [ ] Better Stack receiving logs
- [ ] Uptime monitors reporting
- [ ] Analytics tracking pageviews
- [ ] Performance metrics collecting
- [ ] Alerts triggering correctly (test with intentional error)

---

## Documentation and Communication

### Internal Documentation
- [ ] Deployment guide updated
- [ ] Environment variables documented
- [ ] Runbooks created for common issues
- [ ] Architecture diagrams updated
- [ ] API documentation current

### Team Communication
- [ ] Team notified of deployment
- [ ] Deployment notes shared
- [ ] Known issues documented
- [ ] Support team briefed
- [ ] Rollback procedure reviewed

### External Communication
- [ ] Status page updated (if applicable)
- [ ] Users notified of new features (if applicable)
- [ ] Social media announcement (if applicable)

---

## Ongoing Maintenance

### Daily Tasks
- [ ] Check error rates in Sentry
- [ ] Monitor uptime status
- [ ] Review performance metrics
- [ ] Check for failed payments

### Weekly Tasks
- [ ] Review slow database queries
- [ ] Check storage usage
- [ ] Update dependencies with security patches
- [ ] Review and respond to user feedback

### Monthly Tasks
- [ ] Review and rotate API keys
- [ ] Analyze usage patterns
- [ ] Scale resources if needed
- [ ] Manual database backup
- [ ] Review and optimize costs
- [ ] Security audit

---

## Rollback Plan

### If Critical Issues Arise

#### Frontend Rollback
1. [ ] Go to Vercel Deployments
2. [ ] Find last stable deployment
3. [ ] Click "Promote to Production"
4. [ ] Verify rollback successful
5. [ ] Notify team

#### Database Rollback
1. [ ] Identify problematic migration
2. [ ] Create rollback migration
3. [ ] Test in staging first
4. [ ] Apply to production
5. [ ] Verify data integrity

#### AI Services Rollback
1. [ ] Go to Railway/Render deployments
2. [ ] Select previous stable deployment
3. [ ] Click "Redeploy"
4. [ ] Verify health check
5. [ ] Update frontend env var if needed

---

## Success Criteria

Deployment is considered successful when:

- [ ] All checklist items completed
- [ ] Zero critical errors in first 24 hours
- [ ] Uptime >99.9% in first week
- [ ] Average response time <500ms
- [ ] No data loss or corruption
- [ ] All payment transactions processing
- [ ] User feedback positive
- [ ] Team confident in production stability

---

## Sign-Off

**Deployed by:** ___________________________

**Date:** ___________________________

**Deployment ID:** ___________________________

**Verified by:** ___________________________

**Date:** ___________________________

---

## Notes

Use this section to document any issues encountered, workarounds applied, or deviations from the standard process:

```
[Add notes here]
```

