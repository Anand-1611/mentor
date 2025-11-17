# 🚀 Quick Start: Add Sentry to Vercel

## Copy-Paste Ready Values

### Variable 1: VITE_SENTRY_DSN
```
https://3x68021072d1d1bf2907cfc315d6916e41838073052656.ingest.us.sentry.io/4518388243820352
```

### Variable 2: VITE_SENTRY_ENVIRONMENT
```
production
```

## 📍 Where to Add Them

1. **Go to**: https://vercel.com/dashboard
2. **Click**: Your MentorLink project
3. **Click**: Settings → Environment Variables
4. **Click**: "Add New" button

## 🎯 Quick Setup (2 clicks per variable)

### Add Variable 1:
```
Name:         VITE_SENTRY_DSN
Value:        [paste from above]
Environments: ✅ Production ✅ Preview ✅ Development
```

### Add Variable 2:
```
Name:         VITE_SENTRY_ENVIRONMENT  
Value:        production
Environments: ✅ Production only
```

## 🔄 Redeploy

After adding both variables:
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait ~2 minutes

## ✅ Test It

Open your production site and run in console:
```javascript
throw new Error("Test Sentry - " + new Date().toISOString());
```

Check: https://anand.sentry.io/issues/

## 🎉 Done!

That's it! Your production app now has:
- ✅ Automatic error tracking
- ✅ Performance monitoring  
- ✅ Session replays
- ✅ Email alerts

---

**Time**: 5 minutes
**Difficulty**: Easy
**Files**: `VERCEL_SETUP_CHECKLIST.md` for detailed steps
