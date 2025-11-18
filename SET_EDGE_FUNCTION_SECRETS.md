# Set Edge Function Environment Variables

## ✅ Edge Function Deployed Successfully!

The `upload-note` function has been deployed to Supabase.

## ⚠️ Required: Set Environment Variables

The Edge Function needs these environment variables to work:

### Step 1: Get Your Service Role Key

1. Go to: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/settings/api
2. Scroll down to "Project API keys"
3. Copy the **service_role** key (NOT the anon key)
   - It starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - This is a SECRET key - keep it safe!

### Step 2: Set the Secrets

Run these commands (replace `YOUR_SERVICE_ROLE_KEY` with the actual key):

```bash
npx supabase secrets set SUPABASE_URL=https://kdtcwnnddukdbgkylmxq.supabase.co --project-ref kdtcwnnddukdbgkylmxq

npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY --project-ref kdtcwnnddukdbgkylmxq
```

### Alternative: Set via Dashboard

1. Go to: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/functions/upload-note/details
2. Click on "Settings" or "Environment Variables"
3. Add these variables:
   - `SUPABASE_URL`: `https://kdtcwnnddukdbgkylmxq.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: (paste your service role key)

## ✅ Verification

After setting the secrets, test the function:

```bash
curl -i --location --request OPTIONS 'https://kdtcwnnddukdbgkylmxq.supabase.co/functions/v1/upload-note' \
  --header 'Access-Control-Request-Method: POST' \
  --header 'Access-Control-Request-Headers: authorization, content-type'
```

Should return 200 with CORS headers.

## 🎉 What's Done

- ✅ Code pushed to GitHub
- ✅ Netlify will auto-deploy (check: https://app.netlify.com/sites/mentorlinkk/deploys)
- ✅ Edge Function deployed to Supabase
- ⚠️ Need to set environment variables (see above)
- ⚠️ Need to run `FIX_ADMIN_AND_CORS.sql` in Supabase

## Next Steps

1. Set the Edge Function secrets (see above)
2. Run `FIX_ADMIN_AND_CORS.sql` in Supabase SQL Editor
3. Test the application!

---

**Almost there! Just 2 more quick steps!** 🚀
