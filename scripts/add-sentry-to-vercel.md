# Add Sentry to Vercel - Step by Step

## 🚀 Quick Setup (2 minutes)

### Method 1: Using Vercel Dashboard (Easiest)

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Select your MentorLink project

2. **Navigate to Environment Variables**
   - Click **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add Variable 1: VITE_SENTRY_DSN**
   - Click **"Add New"** button
   - **Name**: `VITE_SENTRY_DSN`
   - **Value**: `https://3x68021072d1d1bf2907cfc315d6916e41838073052656.ingest.us.sentry.io/4518388243820352`
   - **Environments**: Check all three boxes:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **Save**

4. **Add Variable 2: VITE_SENTRY_ENVIRONMENT**
   - Click **"Add New"** button again
   - **Name**: `VITE_SENTRY_ENVIRONMENT`
   - **Value**: `production`
   - **Environments**: Check only:
     - ✅ Production
   - Click **Save**

5. **Redeploy**
   - Go to **Deployments** tab
   - Click on the latest deployment
   - Click **"Redeploy"** button
   - Wait for deployment to complete (~2 minutes)

### Method 2: Using Vercel CLI (For Advanced Users)

If you have Vercel CLI installed:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add VITE_SENTRY_DSN production
# Paste: https://3x68021072d1d1bf2907cfc315d6916e41838073052656.ingest.us.sentry.io/4518388243820352

vercel env add VITE_SENTRY_DSN preview
# Paste: https://3x68021072d1d1bf2907cfc315d6916e41838073052656.ingest.us.sentry.io/4518388243820352

vercel env add VITE_SENTRY_ENVIRONMENT production
# Type: production

# Redeploy
vercel --prod
```

## ✅ Verification

After redeploying:

1. **Open your production site**
2. **Open browser console** (F12)
3. **Run this command**:
   ```javascript
   throw new Error("Test Sentry Production - " + new Date().toISOString());
   ```
4. **Check Sentry dashboard**: https://anand.sentry.io/issues/
5. **You should see the error** within 10 seconds!

## 📋 Copy-Paste Values

For easy copy-paste:

**Variable 1:**
```
Name: VITE_SENTRY_DSN
Value: https://3x68021072d1d1bf2907cfc315d6916e41838073052656.ingest.us.sentry.io/4518388243820352
```

**Variable 2:**
```
Name: VITE_SENTRY_ENVIRONMENT
Value: production
```

## 🎯 What This Does

Once configured, your production app will:
- ✅ Automatically capture all JavaScript errors
- ✅ Track performance metrics
- ✅ Record session replays for errors
- ✅ Send alerts when error thresholds are exceeded
- ✅ Provide full stack traces and user context

## 🔍 Troubleshooting

### Errors not appearing in Sentry?

1. **Check environment variables are set**:
   - Go to Vercel → Settings → Environment Variables
   - Verify both variables are present

2. **Check you redeployed**:
   - Environment variables only take effect after redeployment
   - Go to Deployments and verify latest deployment is after adding variables

3. **Check browser console**:
   - Look for any Sentry initialization errors
   - Should see no errors related to Sentry

4. **Check Sentry project**:
   - Verify you're looking at the correct project: javascript-react
   - Check the environment filter is set to "production"

### Still not working?

Check the Sentry initialization in browser console:
```javascript
// This should return true if Sentry is initialized
console.log(window.Sentry !== undefined);
```

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs/concepts/projects/environment-variables
- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/react/
- **Your Sentry Dashboard**: https://anand.sentry.io/

---

**Time Required**: 2 minutes
**Difficulty**: Easy
**Status**: Ready to deploy
