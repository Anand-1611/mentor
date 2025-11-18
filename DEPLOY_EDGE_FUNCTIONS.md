# Deploy Edge Functions to Supabase

## Quick Deploy Guide

### Prerequisites
- Supabase CLI installed
- Logged into Supabase CLI

### Install Supabase CLI

**Windows (PowerShell)**:
```powershell
scoop install supabase
```

Or using npm:
```bash
npm install -g supabase
```

**Mac/Linux**:
```bash
brew install supabase/tap/supabase
```

### Deploy Steps

1. **Login to Supabase**:
```bash
supabase login
```

2. **Link to your project**:
```bash
supabase link --project-ref kdtcwnnddukdbgkylmxq
```

3. **Deploy all functions**:
```bash
supabase functions deploy
```

Or deploy just the upload-note function:
```bash
supabase functions deploy upload-note
```

### Set Environment Variables

After deploying, set the required environment variables:

```bash
# Set SUPABASE_URL
supabase secrets set SUPABASE_URL=https://kdtcwnnddukdbgkylmxq.supabase.co

# Set SUPABASE_SERVICE_ROLE_KEY (get from Supabase Dashboard > Settings > API)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Verify Deployment

Check function logs:
```bash
supabase functions logs upload-note
```

Or view in dashboard:
https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/functions/upload-note/logs

### Test the Function

```bash
curl -i --location --request OPTIONS 'https://kdtcwnnddukdbgkylmxq.supabase.co/functions/v1/upload-note' \
  --header 'Access-Control-Request-Method: POST' \
  --header 'Access-Control-Request-Headers: authorization, content-type'
```

Should return 200 with CORS headers.

---

## Alternative: Deploy via Dashboard

If CLI doesn't work, you can deploy via the Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/functions
2. Click "New Function" or select existing function
3. Copy the code from `supabase/functions/upload-note/index.ts`
4. Paste and deploy
5. Set environment variables in the function settings

---

## Troubleshooting

### "supabase: command not found"
Install the CLI using one of the methods above.

### "Failed to link project"
Make sure you're logged in: `supabase login`

### "Permission denied"
Make sure you have access to the Supabase project.

### Function deploys but still CORS errors
Check the function logs for runtime errors. The function might be crashing before returning CORS headers.

---

**Status**: Ready to deploy
**Time**: 5 minutes
