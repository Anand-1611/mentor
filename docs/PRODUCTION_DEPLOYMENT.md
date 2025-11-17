# Production Deployment Documentation

This document provides comprehensive information about deploying MentorLink to production.

## Quick Start

For first-time deployment, follow these steps in order:

1. **Read the deployment guide**: `DEPLOYMENT_GUIDE.md`
2. **Use the checklist**: `DEPLOYMENT_CHECKLIST.md`
3. **Set up environment variables**: Run `scripts/setup-production-env.ps1` (Windows) or `scripts/setup-production-env.sh` (Linux/Mac)
4. **Deploy services** in this order:
   - Supabase (database and storage)
   - AI Services (Railway or Render)
   - Frontend (Vercel)
   - Monitoring (Sentry and Better Stack)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Architecture                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Vercel     │────▶│   Supabase   │────▶│  Cloudflare  │
│  (Frontend)  │     │  (Database)  │     │  R2 Storage  │
└──────────────┘     └──────────────┘     └──────────────┘
       │                     │
       │                     │
       ▼                     ▼
┌──────────────┐     ┌──────────────┐
│   Railway    │     │    Stripe    │
│ (AI Services)│     │  (Payments)  │
└──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│    FAISS     │
│  (Vectors)   │
└──────────────┘

Monitoring:
- Sentry (Errors)
- Better Stack (Logs)
- Vercel Analytics (Performance)
```

## Service Dependencies

### Critical Services (Must be deployed first)
1. **Supabase** - Database, Auth, Storage, Edge Functions
2. **Stripe** - Payment processing

### Core Services (Deploy second)
3. **AI Services** - Flashcards, Quiz, Chat features
4. **Frontend** - User interface

### Supporting Services (Deploy last)
5. **Sentry** - Error monitoring
6. **Better Stack** - Log aggregation
7. **Vercel Analytics** - Performance tracking

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | `eyJhbGc...` | Yes |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ref | `bophvgqkwdbm` | Yes |
| `VITE_STORAGE_URL` | Storage endpoint | `https://xxx.supabase.co/storage/v1` | Yes |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_live_...` | Yes |
| `VITE_AI_SERVICE_URL` | AI service endpoint | `https://xxx.railway.app` | Yes |
| `VITE_SENTRY_DSN` | Sentry project DSN | `https://xxx@sentry.io/xxx` | Yes |
| `VITE_SENTRY_ENVIRONMENT` | Environment name | `production` | Yes |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `true` | No |
| `VITE_ENABLE_VIDEO_CALLS` | Enable video calls | `true` | No |
| `VITE_ENABLE_AI_FEATURES` | Enable AI features | `true` | No |

### AI Services (Railway/Render)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJhbGc...` | Yes |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-...` | No |
| `STORAGE_URL` | Storage endpoint | `https://xxx.supabase.co/storage/v1` | Yes |
| `ENVIRONMENT` | Environment name | `production` | Yes |
| `LOG_LEVEL` | Logging level | `INFO` | Yes |
| `MAX_WORKERS` | Worker processes | `4` | Yes |
| `FAISS_INDEX_PATH` | FAISS index location | `/app/data/faiss_index` | Yes |
| `CORS_ORIGINS` | Allowed origins | `https://domain.com` | Yes |

### Supabase Edge Functions

| Secret | Description | Example | Required |
|--------|-------------|---------|----------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` | Yes |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-...` | No |
| `RESEND_API_KEY` | Resend email API key | `re_...` | Yes |
| `DAILY_API_KEY` | Daily.co video API key | `...` | Yes |

## Deployment Procedures

### Initial Deployment

Follow the complete deployment guide in `DEPLOYMENT_GUIDE.md`.

### Updating Existing Deployment

#### Frontend Updates
```bash
# Vercel automatically deploys on push to main
git push origin main

# Or manually deploy
vercel --prod
```

#### AI Services Updates
```bash
# Railway automatically deploys on push
git push origin main

# Or manually trigger deployment in Railway dashboard
```

#### Database Migrations
```bash
# Create new migration
supabase migration new migration_name

# Test locally
supabase db reset

# Push to production
supabase link --project-ref [prod-ref]
supabase db push
```

#### Edge Functions Updates
```bash
# Deploy specific function
supabase functions deploy function-name

# Deploy all functions
supabase functions deploy
```

### Rollback Procedures

#### Frontend Rollback
1. Go to Vercel Dashboard → Deployments
2. Find the last stable deployment
3. Click "..." → "Promote to Production"
4. Verify the rollback

#### AI Services Rollback
1. Go to Railway/Render Dashboard → Deployments
2. Select previous stable deployment
3. Click "Redeploy"
4. Verify health check passes

#### Database Rollback
```bash
# Revert specific migration
supabase migration repair --status reverted [migration-version]

# Or restore from backup
# Go to Supabase Dashboard → Database → Backups
```

## Monitoring and Alerts

### Key Metrics to Monitor

**Performance Metrics:**
- Response time: <500ms (p95)
- Error rate: <0.1%
- Uptime: >99.9%
- Core Web Vitals: All "Good"

**Business Metrics:**
- Active users (DAU/MAU)
- Transaction success rate: >99%
- File upload success rate: >98%
- AI service availability: >99%

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error rate | >0.5% | >1% |
| Response time | >1s | >2s |
| CPU usage | >70% | >90% |
| Memory usage | >80% | >95% |
| Disk usage | >80% | >90% |
| Failed payments | >5/hour | >10/hour |

### Monitoring Dashboards

**Sentry Dashboard:**
- Real-time error tracking
- Performance monitoring
- Release tracking
- User feedback

**Better Stack Dashboard:**
- Log aggregation
- Uptime monitoring
- Incident management
- On-call scheduling

**Vercel Analytics:**
- Core Web Vitals
- Page load times
- Geographic distribution
- Device breakdown

## Security Best Practices

### API Keys and Secrets

1. **Never commit secrets to Git**
   - Use `.env.local` for development
   - Use platform environment variables for production
   - Add all `.env.*` files to `.gitignore`

2. **Rotate keys regularly**
   - API keys: Every 90 days
   - Database passwords: Every 180 days
   - Service role keys: Every 180 days

3. **Use least privilege principle**
   - Frontend: Only anon/public keys
   - Backend: Service role keys only where needed
   - Edge Functions: Specific secrets per function

### Access Control

1. **Enable 2FA on all accounts**
   - GitHub
   - Vercel
   - Supabase
   - Stripe
   - Railway/Render

2. **Limit team access**
   - Use role-based access control
   - Regular access audits
   - Remove inactive users

3. **Secure webhooks**
   - Verify webhook signatures
   - Use HTTPS only
   - Implement rate limiting

### Data Protection

1. **Encryption**
   - TLS 1.3 for all connections
   - Encrypted storage at rest
   - Encrypted backups

2. **Compliance**
   - GDPR compliance for EU users
   - Data retention policies
   - User data export/deletion

3. **Backups**
   - Automated daily backups (Supabase)
   - Manual weekly backups
   - Test restore procedures monthly

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**
   - Route-based splitting (already configured)
   - Component lazy loading
   - Dynamic imports for heavy libraries

2. **Asset Optimization**
   - Image compression
   - WebP format for images
   - CDN for static assets (Vercel Edge Network)

3. **Caching Strategy**
   - React Query caching (5-minute stale time)
   - Browser caching for static assets
   - Service worker for offline support (optional)

### Backend Optimization

1. **Database**
   - Indexes on frequently queried columns (already added)
   - Connection pooling
   - Query optimization
   - Materialized views for complex queries

2. **API**
   - Response compression
   - Rate limiting
   - Request batching
   - Pagination for large datasets

3. **AI Services**
   - Model caching
   - Batch processing
   - Queue system for long-running tasks
   - Auto-scaling based on load

## Cost Optimization

### Current Cost Breakdown

**Fixed Costs (Monthly):**
- Supabase Pro: $25
- Vercel Pro: $20 (optional, Hobby is free)
- Sentry Team: $26
- Better Stack: $20
- Domain: ~$1 (annual/12)

**Variable Costs:**
- Railway/Render: $7-50 (based on usage)
- Stripe: 2.9% + $0.30 per transaction
- OpenAI API: Based on token usage
- Storage: Based on GB stored and bandwidth

### Cost Reduction Strategies

1. **Optimize AI usage**
   - Cache common queries
   - Use smaller models where appropriate
   - Batch requests
   - Set usage limits

2. **Optimize storage**
   - Compress PDFs before storage
   - Clean up old temporary files
   - Use lifecycle policies
   - CDN for frequently accessed files

3. **Optimize compute**
   - Auto-scale based on demand
   - Use spot instances (if available)
   - Optimize database queries
   - Implement caching layers

## Disaster Recovery

### Backup Strategy

**Automated Backups:**
- Database: Daily (Supabase automatic)
- Storage: Continuous (S3/R2 versioning)
- Code: Git repository

**Manual Backups:**
- Weekly full database export
- Monthly storage snapshot
- Configuration backups

### Recovery Procedures

**Database Recovery:**
```bash
# Restore from Supabase backup
# Go to Dashboard → Database → Backups → Restore

# Or restore from manual backup
psql -h [host] -U postgres -d postgres < backup.sql
```

**Storage Recovery:**
```bash
# Restore from S3/R2 versioning
# Use cloud provider's console or CLI
```

**Application Recovery:**
```bash
# Rollback to previous deployment
# See "Rollback Procedures" section above
```

### Incident Response Plan

1. **Detect** - Monitoring alerts trigger
2. **Assess** - Determine severity and impact
3. **Communicate** - Notify team and users
4. **Mitigate** - Implement temporary fixes
5. **Resolve** - Deploy permanent solution
6. **Review** - Post-mortem and improvements

## Maintenance Schedule

### Daily Tasks
- [ ] Check error rates in Sentry
- [ ] Monitor uptime status
- [ ] Review performance metrics
- [ ] Check for failed payments

### Weekly Tasks
- [ ] Review slow database queries
- [ ] Check storage usage and costs
- [ ] Update dependencies with security patches
- [ ] Review and respond to user feedback
- [ ] Check AI service usage and costs

### Monthly Tasks
- [ ] Review and rotate API keys (if due)
- [ ] Analyze usage patterns
- [ ] Scale resources if needed
- [ ] Manual database backup
- [ ] Review and optimize costs
- [ ] Security audit
- [ ] Test disaster recovery procedures

### Quarterly Tasks
- [ ] Comprehensive security audit
- [ ] Performance optimization review
- [ ] Cost optimization analysis
- [ ] Update documentation
- [ ] Team training on new features
- [ ] Review and update runbooks

## Troubleshooting Guide

### Common Issues

#### High Error Rate

**Symptoms:** Sentry showing spike in errors

**Diagnosis:**
1. Check Sentry for error patterns
2. Review recent deployments
3. Check service status (Supabase, Stripe, etc.)

**Resolution:**
1. If deployment-related: Rollback
2. If service-related: Wait for service recovery
3. If code-related: Deploy hotfix

#### Slow Performance

**Symptoms:** High response times, user complaints

**Diagnosis:**
1. Check Vercel Analytics for bottlenecks
2. Review database query performance
3. Check AI service response times

**Resolution:**
1. Optimize slow queries
2. Add database indexes
3. Scale AI services
4. Enable caching

#### Payment Failures

**Symptoms:** Failed transactions in Stripe

**Diagnosis:**
1. Check Stripe dashboard for error details
2. Verify webhook is receiving events
3. Check Edge Function logs

**Resolution:**
1. Verify webhook secret is correct
2. Check Edge Function deployment
3. Review RLS policies
4. Contact Stripe support if needed

#### File Upload Failures

**Symptoms:** Users unable to upload files

**Diagnosis:**
1. Check storage bucket configuration
2. Verify CORS settings
3. Check file size limits
4. Review RLS policies

**Resolution:**
1. Update CORS configuration
2. Increase size limits if needed
3. Fix RLS policies
4. Check storage quota

### Getting Help

**Supabase Support:**
- Dashboard: support.supabase.com
- Discord: discord.supabase.com
- Docs: supabase.com/docs

**Vercel Support:**
- Dashboard: vercel.com/support
- Discord: vercel.com/discord
- Docs: vercel.com/docs

**Railway Support:**
- Dashboard: help.railway.app
- Discord: discord.gg/railway
- Docs: docs.railway.app

**Stripe Support:**
- Dashboard: support.stripe.com
- Docs: stripe.com/docs
- Phone: Available for paid accounts

## Additional Resources

- [Deployment Guide](../DEPLOYMENT_GUIDE.md) - Step-by-step deployment instructions
- [Deployment Checklist](../DEPLOYMENT_CHECKLIST.md) - Comprehensive checklist
- [Setup Scripts](../scripts/) - Automated setup scripts
- [GitHub Actions](.github/workflows/) - CI/CD workflows

## Changelog

### Version 1.0.0 (Initial Release)
- Complete MVP deployment
- All core features implemented
- Production-ready infrastructure
- Monitoring and logging configured

---

**Last Updated:** 2024-11-13
**Maintained By:** MentorLink Team
**Contact:** support@mentorlink.com
