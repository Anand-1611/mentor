# ✅ Vercel Setup Checklist

## 🎯 Goal
Add Sentry error tracking to your production deployment on Vercel.

## 📋 Step-by-Step Checklist

### Step 1: Open Vercel Dashboard
- [ ] Go to https://vercel.com/dashboard
- [ ] Click on your **MentorLink** project

### Step 2: Navigate to Settings
- [ ] Click the **Settings** tab at the top
- [ ] Click **Environment Variables** in the left sidebar

### Step 3: Add First Variable (VITE_SENTRY_DSN)
- [ ] Click the **"Add New"** button
- [ ] In the **Name** field, type: `VITE_SENTRY_DSN`
- [ ] In the **Value** field, paste:
  ```
  https://3x68021072d1d1bf2907cfc315d6916e41838073052656.ingest.us.sentry.io/4518388243820352
  ```
- [ ] Check all three environment boxes:
  - [ ] ✅ Production
  - [ ] ✅ Preview  
  - [ ] ✅ Development
- [ ] Click **Save**

### Step 4: Add Second Variable (VITE_SENTRY_ENVIRONMENT)
- [ ] Click the **"Add New"** button again
- [ ] In the **Name** field, type: `VITE_SENTRY_ENVIRONMENT`
- [ ] In the **Value** field, type: `production`
- [ ] Check only the Production box:
  - [ ] ✅ Production
  - [ ] ⬜ Preview
  - [ ] ⬜ Development
- [ ] Click **Save**

### Step 5: Redeploy Your Application
- [ ] Click the **Deployments** tab at the top
- [ ] Find your latest deployment (should be at the top)
- [ ] Click the **three dots (⋯)** on the right
- [ ] Click **"Redeploy"**
- [ ] Confirm by clicking **"Redeploy"** again
- [ ] Wait for deployment to complete (~2 minutes)

### Step 6: Test Sentry Integration
- [ ] Open your production website
- [ ] Press **F12** to open browser console
- [ ] Copy and paste this command:
  ```javascript
  throw new Error("Test Sentry Production - " + new Date().toISOString());
  ```
- [ ] Press **Enter**
- [ ] Go to https://anand.sentry.io/issues/
- [ ] You should see your test error appear within 10 seconds!

## ✅ Success Criteria

You'll know it's working when:
- ✅ Both environment variables show in Vercel settings
- ✅ Deployment completes successfully
- ✅ Test error appears in Sentry dashboard
- ✅ Error includes full stack trace and context

## 🎉 What You Get

Once complete, you'll have:
- ✅ Automatic error tracking in production
- ✅ Performance monitoring
- ✅ Session replays for debugging
- ✅ Email alerts for critical errors
- ✅ Full stack traces with source maps

## 📸 Visual Guide

### What Vercel Environment Variables Should Look Like:

```
┌─────────────────────────────────────────────────────────────────┐
│ Environment Variables                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ VITE_SENTRY_DSN                                                 │
│ https://3x68021072d1d1bf2907cfc315d6916e41838073052656...       │
│ Production, Preview, Development                                 │
│                                                                  │
│ VITE_SENTRY_ENVIRONMENT                                         │
│ production                                                       │
│ Production                                                       │
│                                                                  │
│ VITE_SUPABASE_URL                                               │
│ https://kdtcwnnddukdbgkylmxq.supabase.co                        │
│ Production, Preview, Development                                 │
│                                                                  │
│ VITE_SUPABASE_PUBLISHABLE_KEY                                   │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...                         │
│ Production, Preview, Development                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## ⏱️ Time Estimate

- **Step 1-2**: 30 seconds (Navigate to settings)
- **Step 3**: 1 minute (Add first variable)
- **Step 4**: 30 seconds (Add second variable)
- **Step 5**: 2 minutes (Redeploy)
- **Step 6**: 30 seconds (Test)

**Total**: ~5 minutes

## 🆘 Need Help?

If you get stuck:
1. Check `scripts/add-sentry-to-vercel.md` for detailed instructions
2. Check `SENTRY_SETUP_COMPLETE.md` for troubleshooting
3. Vercel support: https://vercel.com/support

## 📝 Notes

- Environment variables only take effect after redeployment
- You can edit variables later if needed
- The DSN is safe to expose (it's a public key)
- You can add more environments later if needed

---

**Status**: Ready to configure
**Time Required**: 5 minutes
**Difficulty**: Easy ⭐
