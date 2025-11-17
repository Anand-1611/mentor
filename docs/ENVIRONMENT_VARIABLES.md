# Environment Variables Documentation

This document provides detailed information about all environment variables used in the MentorLink application.

## Table of Contents

1. [Frontend Variables](#frontend-variables)
2. [AI Services Variables](#ai-services-variables)
3. [Supabase Edge Functions Secrets](#supabase-edge-functions-secrets)
4. [Setting Up Variables](#setting-up-variables)
5. [Security Best Practices](#security-best-practices)

---

## Frontend Variables

These variables are used by the React frontend application and should be set in Vercel or your deployment platform.

### Required Variables

#### `VITE_SUPABASE_URL`
- **Description:** The URL of your Supabase project
- **Format:** `https://[project-ref].supabase.co`
- **Example:** `https://bophvgqkwdbmwsrgqofb.supabase.co`
- **Where to find:** Supabase Dashboard → Settings → API → Project URL
- **Environment:** Development, Staging, Production

#### `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Description:** The anon/public key for Supabase (safe to expose in frontend)
- **Format:** JWT token starting with `eyJhbGc...`
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find:** Supabase Dashboard → Settings → API → Project API keys → anon/public
- **Environment:** Development, Staging, Production
- **Security:** Safe to expose in client-side code

#### `VITE_SUPABASE_PROJECT_ID`
- **Description:** The unique identifier for your Supabase project
- **Format:** Alphanumeric string (project reference)
- **Example:** `bophvgqkwdbmwsrgqofb`
- **Where to find:** Extract from SUPABASE_URL or Supabase Dashboard → Settings → General
- **Environment:** Development, Staging, Production

#### `VITE_STORAGE_URL`
- **Description:** The URL for Supabase Storage API
- **Format:** `https://[project-ref].supabase.co/storage/v1`
- **Example:** `https://bophvgqkwdbmwsrgqofb.supabase.co/storage/v1`
- **Where to find:** Constructed from SUPABASE_URL + `/storage/v1`
- **Environment:** Development, Staging, Production

#### `VITE_STRIPE_PUBLISHABLE_KEY`
- **Description:** Stripe publishable key for payment processing
- **Format:** 
  - Test: `pk_test_...`
  - Production: `pk_live_...`
- **Example:** `pk_live_51Abc123...`
- **Where to find:** Stripe Dashboard → Developers → API keys
- **Environment:** 
  - Development: Use test key
  - Production: Use live key
- **Security:** Safe to expose in client-side code

#### `VITE_AI_SERVICE_URL`
- **Description:** The URL of the deployed AI services backend
- **Format:** `https://[service-name].[platform].app`
- **Example:** 
  - Railway: `https://mentorlink-ai.railway.app`
  - Render: `https://mentorlink-ai.onrender.com`
- **Where to find:** Railway/Render deployment dashboard
- **Environment:** Development (localhost:8000), Staging, Production

#### `VITE_SENTRY_DSN`
- **Description:** Sentry Data Source Name for error tracking
- **Format:** `https://[key]@o[org-id].ingest.sentry.io/[project-id]`
- **Example:** `https://abc123@o123456.ingest.sentry.io/789012`
- **Where to find:** Sentry Dashboard → Settings → Projects → [Your Project] → Client Keys (DSN)
- **Environment:** Staging, Production (optional for development)
- **Security:** Safe to expose (it's designed for client-side use)

#### `VITE_SENTRY_ENVIRONMENT`
- **Description:** Environment name for Sentry error grouping
- **Format:** String
- **Example:** `production`, `staging`, `development`
- **Default:** `development`
- **Environment:** All

### Optional Variables

#### `VITE_SENTRY_TRACES_SAMPLE_RATE`
- **Description:** Percentage of transactions to send to Sentry for performance monitoring
- **Format:** Number between 0 and 1
- **Example:** `0.1` (10% of transactions)
- **Default:** `0.1`
- **Environment:** Production (higher in development for testing)

#### `VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE`
- **Description:** Percentage of sessions to record for replay
- **Format:** Number between 0 and 1
- **Example:** `0.1` (10% of sessions)
- **Default:** `0.1`
- **Environment:** Production

#### `VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE`
- **Description:** Percentage of error sessions to record for replay
- **Format:** Number between 0 and 1
- **Example:** `1.0` (100% of error sessions)
- **Default:** `1.0`
- **Environment:** Production

#### `VITE_ENABLE_ANALYTICS`
- **Description:** Feature flag to enable/disable analytics tracking
- **Format:** `true` or `false`
- **Example:** `true`
- **Default:** `true`
- **Environment:** All

#### `VITE_ENABLE_VIDEO_CALLS`
- **Description:** Feature flag to enable/disable video call functionality
- **Format:** `true` or `false`
- **Example:** `true`
- **Default:** `true`
- **Environment:** All

#### `VITE_ENABLE_AI_FEATURES`
- **Description:** Feature flag to enable/disable AI features (flashcards, quiz, chat)
- **Format:** `true` or `false`
- **Example:** `true`
- **Default:** `true`
- **Environment:** All

#### `VITE_APP_NAME`
- **Description:** Application name for display purposes
- **Format:** String
- **Example:** `MentorLink`
- **Default:** `MentorLink`
- **Environment:** All

#### `VITE_APP_URL`
- **Description:** The production URL of the application
- **Format:** `https://[domain]`
- **Example:** `https://mentorlink.com`
- **Environment:** Production

#### `VITE_SUPPORT_EMAIL`
- **Description:** Support email address for user inquiries
- **Format:** Email address
- **Example:** `support@mentorlink.com`
- **Environment:** All

---

## AI Services Variables

These variables are used by the Python FastAPI backend and should be set in Railway, Render, or your deployment platform.

### Required Variables

#### `SUPABASE_URL`
- **Description:** The URL of your Supabase project (same as frontend)
- **Format:** `https://[project-ref].supabase.co`
- **Example:** `https://bophvgqkwdbmwsrgqofb.supabase.co`
- **Where to find:** Supabase Dashboard → Settings → API → Project URL
- **Environment:** Development, Staging, Production

#### `SUPABASE_SERVICE_KEY`
- **Description:** The service role key for Supabase (full access, keep secret!)
- **Format:** JWT token starting with `eyJhbGc...`
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find:** Supabase Dashboard → Settings → API → Project API keys → service_role
- **Environment:** Development, Staging, Production
- **Security:** ⚠️ NEVER expose this key! Server-side only!

#### `OPENAI_API_KEY`
- **Description:** OpenAI API key for GPT models
- **Format:** `sk-...`
- **Example:** `sk-proj-abc123...`
- **Where to find:** OpenAI Dashboard → API keys
- **Environment:** Development, Staging, Production
- **Security:** Keep secret! Server-side only!
- **Cost:** Usage-based pricing

#### `STORAGE_URL`
- **Description:** The URL for Supabase Storage API (same as frontend)
- **Format:** `https://[project-ref].supabase.co/storage/v1`
- **Example:** `https://bophvgqkwdbmwsrgqofb.supabase.co/storage/v1`
- **Environment:** Development, Staging, Production

#### `ENVIRONMENT`
- **Description:** Current environment name
- **Format:** String
- **Example:** `production`, `staging`, `development`
- **Default:** `development`
- **Environment:** All

#### `LOG_LEVEL`
- **Description:** Logging verbosity level
- **Format:** `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`
- **Example:** `INFO`
- **Default:** `INFO`
- **Environment:** 
  - Development: `DEBUG`
  - Production: `INFO` or `WARNING`

#### `MAX_WORKERS`
- **Description:** Number of worker processes for Uvicorn
- **Format:** Integer
- **Example:** `4`
- **Default:** `4`
- **Recommendation:** Set to number of CPU cores
- **Environment:** Production

#### `FAISS_INDEX_PATH`
- **Description:** File system path for storing FAISS vector index
- **Format:** Absolute path
- **Example:** `/app/data/faiss_index`
- **Default:** `/app/data/faiss_index`
- **Environment:** All
- **Note:** Ensure this path has write permissions and persistent storage

#### `CORS_ORIGINS`
- **Description:** Comma-separated list of allowed CORS origins
- **Format:** `https://domain1.com,https://domain2.com`
- **Example:** `https://mentorlink.com,https://www.mentorlink.com`
- **Environment:** 
  - Development: `http://localhost:8080,http://localhost:5173`
  - Production: Your production domain(s)
- **Security:** Never use `*` in production!

### Optional Variables

#### `ANTHROPIC_API_KEY`
- **Description:** Anthropic Claude API key (fallback for OpenAI)
- **Format:** `sk-ant-...`
- **Example:** `sk-ant-api03-abc123...`
- **Where to find:** Anthropic Console → API keys
- **Environment:** Production (optional)
- **Security:** Keep secret! Server-side only!

#### `PORT`
- **Description:** Port number for the API server
- **Format:** Integer
- **Example:** `8000`
- **Default:** `8000`
- **Environment:** All
- **Note:** Railway/Render set this automatically

#### `REDIS_URL`
- **Description:** Redis connection URL for caching (if implemented)
- **Format:** `redis://[host]:[port]`
- **Example:** `redis://localhost:6379`
- **Environment:** Production (optional)

---

## Supabase Edge Functions Secrets

These secrets are used by Supabase Edge Functions and should be set in the Supabase Dashboard.

### How to Set Secrets

```bash
# Using Supabase CLI
supabase secrets set SECRET_NAME=value

# Or in Supabase Dashboard
# Go to Edge Functions → Secrets → Add Secret
```

### Required Secrets

#### `STRIPE_SECRET_KEY`
- **Description:** Stripe secret key for payment processing
- **Format:** 
  - Test: `sk_test_...`
  - Production: `sk_live_...`
- **Example:** `sk_live_51Abc123...`
- **Where to find:** Stripe Dashboard → Developers → API keys
- **Used by:** `stripe-webhook`, `upload-note` functions
- **Security:** ⚠️ Keep secret! Never expose!

#### `STRIPE_WEBHOOK_SECRET`
- **Description:** Stripe webhook signing secret for verifying webhook events
- **Format:** `whsec_...`
- **Example:** `whsec_abc123...`
- **Where to find:** Stripe Dashboard → Developers → Webhooks → [Your endpoint] → Signing secret
- **Used by:** `stripe-webhook` function
- **Security:** Keep secret!

#### `OPENAI_API_KEY`
- **Description:** OpenAI API key (same as AI services)
- **Format:** `sk-...`
- **Example:** `sk-proj-abc123...`
- **Used by:** `watermark-pdf`, `send-email` functions (if using AI features)

#### `RESEND_API_KEY`
- **Description:** Resend API key for sending emails
- **Format:** `re_...`
- **Example:** `re_abc123...`
- **Where to find:** Resend Dashboard → API Keys
- **Used by:** `send-email` function
- **Alternative:** Can use SendGrid or other email providers

#### `DAILY_API_KEY`
- **Description:** Daily.co API key for video calls
- **Format:** String
- **Example:** `abc123...`
- **Where to find:** Daily.co Dashboard → Developers → API Keys
- **Used by:** Booking system for creating video rooms

### Optional Secrets

#### `ANTHROPIC_API_KEY`
- **Description:** Anthropic Claude API key (fallback)
- **Format:** `sk-ant-...`
- **Used by:** Edge functions that use AI

#### `SENDGRID_API_KEY`
- **Description:** SendGrid API key (alternative to Resend)
- **Format:** `SG.`...
- **Where to find:** SendGrid Dashboard → Settings → API Keys

---

## Setting Up Variables

### Local Development

1. **Create `.env` file** (already exists):
```bash
cp .env .env.local
# Edit .env.local with your development values
```

2. **Never commit `.env.local`** - it's in `.gitignore`

### Production (Vercel)

#### Option 1: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Add environment variable
vercel env add VITE_SUPABASE_URL production

# Pull environment variables
vercel env pull .env.production
```

#### Option 2: Using Vercel Dashboard
1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable:
   - **Key:** Variable name (e.g., `VITE_SUPABASE_URL`)
   - **Value:** Variable value
   - **Environment:** Select "Production" (or "Preview", "Development")
4. Click "Save"

#### Option 3: Using Setup Script
```bash
# Windows
.\scripts\setup-production-env.ps1

# Linux/Mac
chmod +x scripts/setup-production-env.sh
./scripts/setup-production-env.sh
```

### AI Services (Railway)

1. Go to Railway Dashboard
2. Select your project
3. Click on your service
4. Go to "Variables" tab
5. Click "New Variable"
6. Add each variable from the AI Services section
7. Deploy to apply changes

### AI Services (Render)

1. Go to Render Dashboard
2. Select your web service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add each variable from the AI Services section
6. Save changes (auto-deploys)

### Supabase Edge Functions

```bash
# Set individual secret
supabase secrets set STRIPE_SECRET_KEY=sk_live_...

# Set multiple secrets from file
supabase secrets set --env-file .env.edge-functions

# List all secrets
supabase secrets list

# Delete a secret
supabase secrets unset SECRET_NAME
```

---

## Security Best Practices

### 1. Never Commit Secrets

**Always add to `.gitignore`:**
```gitignore
.env.local
.env.production
.env.*.local
ai-services/.env.production
```

### 2. Use Different Keys for Different Environments

- **Development:** Test/sandbox keys
- **Staging:** Separate test keys
- **Production:** Live/production keys

### 3. Rotate Keys Regularly

- **API Keys:** Every 90 days
- **Database Passwords:** Every 180 days
- **Service Role Keys:** Every 180 days

### 4. Limit Key Permissions

- Use read-only keys where possible
- Restrict API key scopes
- Use RLS policies in Supabase

### 5. Monitor Key Usage

- Set up alerts for unusual activity
- Review API usage regularly
- Revoke compromised keys immediately

### 6. Secure Storage

- Use password managers for team sharing
- Use platform secret management (Vercel, Railway, etc.)
- Never share keys via email or chat

### 7. Audit Access

- Review who has access to secrets
- Remove access for former team members
- Use role-based access control

---

## Validation Checklist

Use this checklist to verify all variables are set correctly:

### Frontend (Vercel)
- [ ] `VITE_SUPABASE_URL` - Valid URL, accessible
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` - Valid JWT, starts with `eyJ`
- [ ] `VITE_SUPABASE_PROJECT_ID` - Matches project ref
- [ ] `VITE_STORAGE_URL` - Valid URL, ends with `/storage/v1`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Correct mode (test/live)
- [ ] `VITE_AI_SERVICE_URL` - Valid URL, accessible
- [ ] `VITE_SENTRY_DSN` - Valid DSN format
- [ ] `VITE_SENTRY_ENVIRONMENT` - Matches deployment environment

### AI Services (Railway/Render)
- [ ] `SUPABASE_URL` - Same as frontend
- [ ] `SUPABASE_SERVICE_KEY` - Valid service role key
- [ ] `OPENAI_API_KEY` - Valid, has credits
- [ ] `STORAGE_URL` - Same as frontend
- [ ] `ENVIRONMENT` - Correct environment name
- [ ] `LOG_LEVEL` - Appropriate for environment
- [ ] `MAX_WORKERS` - Reasonable number (2-8)
- [ ] `FAISS_INDEX_PATH` - Valid path with write access
- [ ] `CORS_ORIGINS` - Includes all frontend domains

### Supabase Edge Functions
- [ ] `STRIPE_SECRET_KEY` - Matches publishable key mode
- [ ] `STRIPE_WEBHOOK_SECRET` - Matches webhook endpoint
- [ ] `OPENAI_API_KEY` - Valid, has credits
- [ ] `RESEND_API_KEY` - Valid, domain verified
- [ ] `DAILY_API_KEY` - Valid, has quota

---

## Troubleshooting

### Common Issues

#### "Invalid API Key" Errors
- Verify key is copied completely (no extra spaces)
- Check key is for correct environment (test vs live)
- Ensure key hasn't been revoked
- Verify key has necessary permissions

#### CORS Errors
- Check `CORS_ORIGINS` includes your frontend domain
- Verify domain includes protocol (`https://`)
- Include both www and non-www versions if needed
- No trailing slashes in domain URLs

#### "Environment Variable Not Found"
- Verify variable name is spelled correctly
- Check variable is set for correct environment
- Restart service after adding variables
- Clear build cache and redeploy

#### Supabase Connection Errors
- Verify `SUPABASE_URL` is accessible
- Check API keys are valid
- Ensure RLS policies allow access
- Verify network connectivity

---

## Quick Reference

### Development Environment
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc... (local anon key)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_AI_SERVICE_URL=http://localhost:8000
```

### Production Environment
```env
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc... (production anon key)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_AI_SERVICE_URL=https://[service].railway.app
VITE_SENTRY_DSN=https://[key]@sentry.io/[project]
```

---

**Last Updated:** 2024-11-13
**Maintained By:** MentorLink Team
