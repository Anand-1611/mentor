# Infrastructure Setup Guide

This guide covers the setup of file storage and payment infrastructure for MentorLink.

## Prerequisites

- Supabase project created and configured
- Stripe account (test mode for development)
- Supabase CLI installed (optional, for local development)

## 1. Storage Buckets Setup

### Automatic Setup (via Migration)

The storage buckets are automatically created when you run the migration:

```bash
# If using Supabase CLI locally
supabase db push

# Or apply the migration directly in Supabase Dashboard
# Go to: SQL Editor > New Query > Paste migration content
```

### Manual Setup (via Supabase Dashboard)

If you prefer to set up manually:

1. Go to **Storage** in Supabase Dashboard
2. Create the following buckets:

#### Notes Bucket
- **Name**: `notes`
- **Public**: No (private)
- **File size limit**: 50 MB (52428800 bytes)
- **Allowed MIME types**: `application/pdf`

#### Thumbnails Bucket
- **Name**: `thumbnails`
- **Public**: Yes
- **File size limit**: 5 MB (5242880 bytes)
- **Allowed MIME types**: `image/png`, `image/jpeg`, `image/webp`

#### Grades Bucket
- **Name**: `grades`
- **Public**: No (private)
- **File size limit**: 5 MB (5242880 bytes)
- **Allowed MIME types**: `image/png`, `image/jpeg`, `text/csv`

#### Avatars Bucket
- **Name**: `avatars`
- **Public**: Yes
- **File size limit**: 2 MB (2097152 bytes)
- **Allowed MIME types**: `image/png`, `image/jpeg`, `image/webp`

## 2. Stripe Setup

### Step 1: Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a new account
3. Complete account verification

### Step 2: Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **Test Mode** (toggle in top right)
3. Navigate to **Developers > API Keys**
4. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Step 3: Configure Environment Variables

#### Frontend (.env file)

Update your `.env` file with the Stripe publishable key:

```env
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY_HERE"
```

#### Supabase Edge Functions

Add the following secrets to Supabase:

1. Go to **Project Settings > Edge Functions**
2. Add these secrets:

```
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### Step 4: Set Up Webhook

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen to:
   - `checkout.session.completed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to Supabase Edge Functions secrets as `STRIPE_WEBHOOK_SECRET`

## 3. Deploy Edge Functions

### Using Supabase CLI

```bash
# Deploy create-checkout-session function
supabase functions deploy create-checkout-session

# Deploy stripe-webhook function
supabase functions deploy stripe-webhook
```

### Manual Deployment

1. Go to **Edge Functions** in Supabase Dashboard
2. Create new function: `create-checkout-session`
3. Copy content from `supabase/functions/create-checkout-session/index.ts`
4. Deploy
5. Repeat for `stripe-webhook`

## 4. Run Database Migrations

Apply the migrations to set up storage policies and payment tables:

```bash
# Using Supabase CLI
supabase db push

# Or run migrations manually in SQL Editor
```

Migrations to apply:
1. `20251113000001_setup_storage_buckets.sql` - Storage buckets and policies
2. `20251113000002_add_payment_tables.sql` - Payment sessions table

## 5. Verify Setup

### Test Storage

```typescript
import { uploadFile, STORAGE_BUCKETS } from "@/lib/storage";

// Test file upload
const file = new File(["test"], "test.pdf", { type: "application/pdf" });
const result = await uploadFile("notes", "test/test.pdf", file);
console.log("Upload result:", result);
```

### Test Stripe Integration

```typescript
import { createCheckoutSession } from "@/lib/stripe";

// Test checkout session creation
const session = await createCheckoutSession({
  noteId: "test-note-id",
  amount: 100,
});
console.log("Checkout session:", session);
```

## 6. Configuration Summary

### Storage Buckets
- ✅ `notes` - Private, 50MB, PDF only
- ✅ `thumbnails` - Public, 5MB, Images
- ✅ `grades` - Private, 5MB, Images/CSV
- ✅ `avatars` - Public, 2MB, Images

### Payment Infrastructure
- ✅ Stripe account configured
- ✅ API keys added to environment
- ✅ Webhook endpoint created
- ✅ Edge Functions deployed
- ✅ Payment tables created

### Environment Variables
```env
# Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STORAGE_URL=https://...supabase.co/storage/v1

# Supabase Edge Functions (in Dashboard)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Troubleshooting

### Storage Upload Fails
- Check bucket policies are applied
- Verify user is authenticated
- Check file size and MIME type restrictions

### Stripe Webhook Not Working
- Verify webhook secret is correct
- Check Edge Function logs in Supabase Dashboard
- Test webhook using Stripe CLI: `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook`

### Edge Function Errors
- Check function logs in Supabase Dashboard
- Verify all environment variables are set
- Ensure CORS headers are properly configured

## Next Steps

After completing this setup:
1. Implement notes upload UI (Task 2.1)
2. Create PDF upload and thumbnail generation (Task 2.2)
3. Build notes preview and purchase flow (Task 3)

## Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
