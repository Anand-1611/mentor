# Vercel Deployment Guide

This guide provides detailed instructions for deploying MentorLink to Vercel.

## Prerequisites

- GitHub account with repository access
- Vercel account (free or paid)
- All environment variables ready (see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md))
- Production Supabase project set up
- AI services deployed (Railway/Render)

## Deployment Methods

### Method 1: Vercel Dashboard (Recommended for First Deployment)

This is the easiest method for first-time deployment.

#### Step 1: Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Choose your GitHub account
5. Find and select your MentorLink repository
6. Click "Import"

#### Step 2: Configure Project

Vercel will auto-detect the framework settings:

- **Framework Preset**: Vite
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

If these are not auto-detected, set them manually.

#### Step 3: Add Environment Variables

1. Expand the "Environment Variables" section
2. Add each variable from your `.env.production` file:

**Required Variables:**
```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
VITE_STORAGE_URL
VITE_STRIPE_PUBLISHABLE_KEY
VITE_AI_SERVICE_URL
VITE_SENTRY_DSN
VITE_SENTRY_ENVIRONMENT
```

**For each variable:**
- Click "Add" or "Add Another"
- Enter the **Name** (e.g., `VITE_SUPABASE_URL`)
- Enter the **Value**
- Select **Environment**: "Production" (and optionally "Preview" and "Development")
- Click "Add"

#### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete (2-5 minutes)
3. Once complete, you'll see a success screen with your deployment URL
4. Click "Visit" to view your deployed application

#### Step 5: Verify Deployment

1. Open the deployment URL
2. Test key functionality:
   - Homepage loads
   - User registration/login works
   - Notes marketplace displays
   - File uploads work
   - Payment flow initiates
3. Check browser console for errors
4. Verify Sentry is receiving events

### Method 2: Vercel CLI

This method is faster for subsequent deployments and allows more control.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

#### Step 3: Link Project (First Time Only)

```bash
# In your project directory
vercel link
```

Answer the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account/team
- Link to existing project? **N** (for first deployment) or **Y** (if project exists)
- What's your project's name? **mentorlink** (or your preferred name)
- In which directory is your code located? **./`**

#### Step 4: Add Environment Variables

```bash
# Add variables one by one
vercel env add VITE_SUPABASE_URL production
# Paste the value when prompted

# Or add all at once from file
vercel env pull .env.vercel.production
```

#### Step 5: Deploy

**Preview Deployment:**
```bash
vercel
```

**Production Deployment:**
```bash
vercel --prod
```

**Using the deployment script:**
```bash
# Windows
.\scripts\deploy-vercel.ps1

# Linux/Mac
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh
```

### Method 3: GitHub Integration (Automatic Deployments)

This method automatically deploys on every push to your repository.

#### Step 1: Connect Repository (Same as Method 1)

Follow Method 1, Steps 1-4.

#### Step 2: Configure Automatic Deployments

1. Go to Project Settings → Git
2. Configure branch deployments:
   - **Production Branch**: `main` or `master`
   - **Preview Branches**: All branches (or specific branches)
3. Enable "Automatically deploy all branches"

#### Step 3: Deploy by Pushing Code

```bash
# Make changes
git add .
git commit -m "Deploy to production"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Start a new build
3. Deploy to production (if pushed to main)
4. Send you a notification

## Custom Domain Setup

### Step 1: Add Domain

1. Go to Project Settings → Domains
2. Click "Add"
3. Enter your domain (e.g., `mentorlink.com`)
4. Click "Add"

### Step 2: Configure DNS

Vercel will provide DNS configuration instructions. You have two options:

#### Option A: Using Vercel Nameservers (Recommended)

1. Copy the nameservers provided by Vercel
2. Go to your domain registrar (GoDaddy, Namecheap, etc.)
3. Update nameservers to Vercel's nameservers
4. Wait for DNS propagation (5-60 minutes)

#### Option B: Using A and CNAME Records

1. Add an **A record**:
   - Name: `@`
   - Value: `76.76.21.21`
   - TTL: 3600

2. Add a **CNAME record** for www:
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: 3600

3. Wait for DNS propagation (5-60 minutes)

### Step 3: Verify Domain

1. Return to Vercel dashboard
2. Click "Verify" next to your domain
3. Once verified, SSL certificate will be auto-provisioned
4. Your site will be accessible at your custom domain

### Step 4: Update Environment Variables

Update your environment variables to use the custom domain:

```bash
VITE_APP_URL=https://mentorlink.com
```

Also update CORS settings in:
- AI services (`CORS_ORIGINS`)
- Supabase storage buckets

## Vercel Configuration

### vercel.json

The project includes a `vercel.json` file with optimized settings:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### Build Settings

**Recommended settings:**
- **Node.js Version**: 18.x or higher
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables

**Production:**
- Use live API keys (Stripe: `pk_live_`, Supabase: production project)
- Set `VITE_SENTRY_ENVIRONMENT=production`

**Preview:**
- Use test API keys
- Set `VITE_SENTRY_ENVIRONMENT=preview`

**Development:**
- Use local/test API keys
- Set `VITE_SENTRY_ENVIRONMENT=development`

## Vercel Analytics

### Enable Analytics

1. Go to Project Settings → Analytics
2. Click "Enable Analytics"
3. Choose plan:
   - **Hobby**: Free, basic metrics
   - **Pro**: $20/month, advanced metrics

### View Analytics

1. Go to Analytics tab in your project
2. View metrics:
   - **Pageviews**: Total page loads
   - **Visitors**: Unique visitors
   - **Top Pages**: Most visited pages
   - **Referrers**: Traffic sources
   - **Devices**: Desktop vs mobile
   - **Countries**: Geographic distribution

### Core Web Vitals

Vercel automatically tracks Core Web Vitals:
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1

Monitor these metrics and optimize as needed.

## Deployment Protection

### Enable Protection

1. Go to Project Settings → Deployment Protection
2. Enable "Vercel Authentication"
3. Choose protection level:
   - **Standard**: Password protection
   - **Advanced**: SSO with GitHub/GitLab

### Add Team Members

1. Go to Project Settings → Team
2. Click "Invite"
3. Enter email address
4. Select role:
   - **Viewer**: Read-only access
   - **Developer**: Can deploy
   - **Owner**: Full access

## Monitoring and Logs

### View Deployment Logs

1. Go to Deployments tab
2. Click on a deployment
3. View logs:
   - **Build Logs**: Build process output
   - **Function Logs**: Serverless function logs (if any)
   - **Runtime Logs**: Application runtime logs

### Real-time Logs

```bash
# View logs in real-time
vercel logs [deployment-url]

# Follow logs
vercel logs [deployment-url] --follow
```

### Integration with Better Stack

1. Install Better Stack integration from Vercel marketplace
2. Logs will automatically forward to Better Stack
3. View aggregated logs in Better Stack dashboard

## Rollback Procedure

### Using Vercel Dashboard

1. Go to Deployments tab
2. Find the last stable deployment
3. Click "..." menu
4. Select "Promote to Production"
5. Confirm the rollback

### Using Vercel CLI

```bash
# List recent deployments
vercel ls

# Promote a specific deployment
vercel promote [deployment-url]
```

### Instant Rollback

Vercel keeps all previous deployments, so rollback is instant:
- No rebuild required
- No downtime
- Instant DNS update

## Troubleshooting

### Build Failures

**Issue:** Build fails with "Module not found"

**Solution:**
1. Check `package.json` dependencies
2. Ensure all imports are correct
3. Clear build cache: Project Settings → General → Clear Cache

**Issue:** Build fails with "Out of memory"

**Solution:**
1. Upgrade to Pro plan (more memory)
2. Optimize build process
3. Reduce bundle size

### Environment Variable Issues

**Issue:** "Environment variable not defined"

**Solution:**
1. Verify variable is set in Vercel dashboard
2. Check variable name spelling (case-sensitive)
3. Ensure variable is set for correct environment
4. Redeploy after adding variables

### Domain Issues

**Issue:** Domain not resolving

**Solution:**
1. Check DNS configuration
2. Wait for DNS propagation (up to 48 hours)
3. Use `dig` or `nslookup` to verify DNS records
4. Contact domain registrar if issues persist

**Issue:** SSL certificate not provisioning

**Solution:**
1. Verify domain ownership
2. Check DNS records are correct
3. Wait up to 24 hours for certificate
4. Contact Vercel support if needed

### Performance Issues

**Issue:** Slow page loads

**Solution:**
1. Check Vercel Analytics for bottlenecks
2. Optimize images (use WebP, lazy loading)
3. Enable code splitting
4. Use Vercel Edge Network (automatic)

## Best Practices

### 1. Use Preview Deployments

- Test changes in preview before production
- Share preview URLs with team for review
- Automatic preview for every PR

### 2. Monitor Deployments

- Check deployment status after each push
- Review build logs for warnings
- Monitor error rates in Sentry

### 3. Optimize Build Time

- Use `npm ci` instead of `npm install`
- Cache dependencies
- Minimize build steps

### 4. Security

- Never commit `.env` files
- Use environment variables for secrets
- Enable deployment protection
- Regular security audits

### 5. Performance

- Enable compression (automatic)
- Use CDN for static assets (automatic)
- Optimize images
- Implement code splitting

## Cost Optimization

### Hobby Plan (Free)

**Includes:**
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Preview deployments
- Basic analytics

**Limitations:**
- 1 concurrent build
- 6,000 build minutes/month
- No team features

### Pro Plan ($20/month)

**Includes:**
- Everything in Hobby
- 1 TB bandwidth/month
- 3 concurrent builds
- 24,000 build minutes/month
- Team collaboration
- Advanced analytics
- Priority support

**When to upgrade:**
- Need team collaboration
- Exceed bandwidth limits
- Need faster builds
- Want advanced analytics

## Support

### Vercel Support

- **Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Discord**: [vercel.com/discord](https://vercel.com/discord)
- **Email**: support@vercel.com (Pro plan)

### Common Commands

```bash
# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# List deployments
vercel ls

# View logs
vercel logs [url]

# Remove deployment
vercel rm [url]

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add [name]

# Link project
vercel link

# Get project info
vercel inspect [url]
```

## Next Steps

After successful deployment:

1. ✅ Test all functionality thoroughly
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain
4. ✅ Enable Vercel Analytics
5. ✅ Set up deployment protection
6. ✅ Document deployment process
7. ✅ Train team on deployment workflow
8. ✅ Set up staging environment

---

**Last Updated:** 2024-11-13
**Maintained By:** MentorLink Team
