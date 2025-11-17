# MentorLink Monitoring Setup Script (PowerShell)
# This script helps configure monitoring and logging services

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Blue
Write-Host "MentorLink Monitoring Setup" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "This script will help you set up monitoring for MentorLink" -ForegroundColor White
Write-Host ""
Write-Host "Services to configure:"
Write-Host "  1. Sentry (Error tracking)"
Write-Host "  2. Better Stack (Log aggregation and uptime monitoring)"
Write-Host "  3. Vercel Analytics (Performance monitoring)"
Write-Host ""
Read-Host "Press Enter to continue..."
Write-Host ""

# Sentry Setup
Write-Host "==========================================" -ForegroundColor Blue
Write-Host "Sentry Setup" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "1. Go to https://sentry.io/"
Write-Host "2. Create account or sign in"
Write-Host "3. Create new project:"
Write-Host "   - Platform: React"
Write-Host "   - Name: mentorlink-production"
Write-Host "4. Copy the DSN from the project settings"
Write-Host ""
$sentryResponse = Read-Host "Have you created the Sentry project? (y/N)"

if ($sentryResponse -eq "y" -or $sentryResponse -eq "Y") {
    $sentryDsn = Read-Host "Enter Sentry DSN"
    
    # Validate DSN format
    if ($sentryDsn -match "^https://.*@.*\.ingest\.sentry\.io/.*") {
        Write-Host "✓ Valid Sentry DSN" -ForegroundColor Green
        
        # Add to environment file
        if (Test-Path ".env.production") {
            $envContent = Get-Content ".env.production" -Raw
            if ($envContent -match "VITE_SENTRY_DSN") {
                $envContent = $envContent -replace "VITE_SENTRY_DSN=.*", "VITE_SENTRY_DSN=$sentryDsn"
            } else {
                $envContent += "`nVITE_SENTRY_DSN=$sentryDsn"
            }
            Set-Content ".env.production" $envContent
            Write-Host "✓ Added to .env.production" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "Next steps for Sentry:"
        Write-Host "1. Add VITE_SENTRY_DSN to Vercel environment variables"
        Write-Host "2. Set VITE_SENTRY_ENVIRONMENT=production"
        Write-Host "3. Deploy to apply changes"
        Write-Host "4. Test by throwing an error in browser console:"
        Write-Host "   throw new Error('Test Sentry Integration');"
    } else {
        Write-Host "✗ Invalid DSN format" -ForegroundColor Red
    }
} else {
    Write-Host "Skipping Sentry setup" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Blue
Write-Host "Better Stack Setup" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "1. Go to https://betterstack.com/"
Write-Host "2. Create account or sign in"
Write-Host "3. Create new source:"
Write-Host "   - Type: HTTP"
Write-Host "   - Name: mentorlink-logs"
Write-Host "4. Copy the source token"
Write-Host ""
$betterstackResponse = Read-Host "Have you created the Better Stack source? (y/N)"

if ($betterstackResponse -eq "y" -or $betterstackResponse -eq "Y") {
    $betterstackToken = Read-Host "Enter Better Stack source token"
    
    Write-Host "✓ Better Stack token saved" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps for Better Stack:"
    Write-Host ""
    Write-Host "For Vercel (Frontend):"
    Write-Host "1. Go to Vercel Dashboard → Integrations"
    Write-Host "2. Search for 'Better Stack'"
    Write-Host "3. Install integration"
    Write-Host "4. Connect to your project"
    Write-Host ""
    Write-Host "For Railway (AI Services):"
    Write-Host "1. Go to Railway project settings"
    Write-Host "2. Add log drain:"
    Write-Host "   URL: https://in.logs.betterstack.com/$betterstackToken"
    Write-Host ""
    Write-Host "For Render (AI Services):"
    Write-Host "1. Go to service settings"
    Write-Host "2. Add log stream:"
    Write-Host "   Destination: Better Stack"
    Write-Host "   Token: $betterstackToken"
} else {
    Write-Host "Skipping Better Stack setup" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Blue
Write-Host "Uptime Monitoring Setup" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Create monitors in Better Stack:"
Write-Host ""
$domain = Read-Host "Enter your production domain (e.g., mentorlink.com)"

Write-Host ""
Write-Host "Create these monitors in Better Stack:"
Write-Host ""
Write-Host "1. Frontend Monitor:"
Write-Host "   - URL: https://$domain"
Write-Host "   - Check interval: 1 minute"
Write-Host "   - Timeout: 10 seconds"
Write-Host "   - Expected status: 200"
Write-Host ""
Write-Host "2. API Monitor:"
Write-Host "   - URL: https://[your-supabase-project].supabase.co/rest/v1/"
Write-Host "   - Check interval: 1 minute"
Write-Host "   - Headers: apikey: [your-anon-key]"
Write-Host "   - Expected status: 200"
Write-Host ""
Write-Host "3. AI Services Monitor:"
Write-Host "   - URL: https://[your-ai-service].railway.app/health"
Write-Host "   - Check interval: 2 minutes"
Write-Host "   - Expected status: 200"
Write-Host ""
Read-Host "Press Enter when monitors are created..."

Write-Host ""
Write-Host "==========================================" -ForegroundColor Blue
Write-Host "Alert Configuration" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Configure alerts in Sentry:"
Write-Host ""
Write-Host "1. Go to Alerts → Create Alert Rule"
Write-Host "2. Create these rules:"
Write-Host ""
Write-Host "   Error Rate Spike:"
Write-Host "   - Condition: Error count > 50 in 5 minutes"
Write-Host "   - Action: Email + Slack"
Write-Host ""
Write-Host "   Performance Degradation:"
Write-Host "   - Condition: p95 response time > 2s"
Write-Host "   - Action: Email"
Write-Host ""
Write-Host "   Payment Failures:"
Write-Host "   - Condition: Payment error > 5 in 1 hour"
Write-Host "   - Action: Email + Slack"
Write-Host ""
Read-Host "Press Enter when Sentry alerts are configured..."

Write-Host ""
Write-Host "Configure alerts in Better Stack:"
Write-Host ""
Write-Host "1. Go to Incidents → Policies"
Write-Host "2. Create policy:"
Write-Host "   - Trigger: Service down for 2 minutes"
Write-Host "   - Escalation: Email → SMS → Phone"
Write-Host ""
Read-Host "Press Enter when Better Stack alerts are configured..."

Write-Host ""
Write-Host "==========================================" -ForegroundColor Blue
Write-Host "Vercel Analytics" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Enable Vercel Analytics:"
Write-Host ""
Write-Host "1. Go to Vercel project"
Write-Host "2. Navigate to Analytics tab"
Write-Host "3. Click 'Enable Analytics'"
Write-Host "4. Choose plan (Hobby is free)"
Write-Host ""
$vercelResponse = Read-Host "Have you enabled Vercel Analytics? (y/N)"

if ($vercelResponse -eq "y" -or $vercelResponse -eq "Y") {
    Write-Host "✓ Vercel Analytics enabled" -ForegroundColor Green
} else {
    Write-Host "Remember to enable Vercel Analytics" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Monitoring Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:"
Write-Host "✓ Sentry configured for error tracking"
Write-Host "✓ Better Stack configured for logs and uptime"
Write-Host "✓ Vercel Analytics enabled"
Write-Host "✓ Alerts configured"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Test error tracking by throwing a test error"
Write-Host "2. Verify logs are flowing to Better Stack"
Write-Host "3. Check uptime monitors are active"
Write-Host "4. Test alert notifications"
Write-Host "5. Create custom dashboards"
Write-Host ""
Write-Host "Documentation:"
Write-Host "- Monitoring Guide: docs/MONITORING_AND_LOGGING.md"
Write-Host "- Setup Checklist: docs/MONITORING_SETUP_CHECKLIST.md"
Write-Host "- Deployment Guide: DEPLOYMENT_GUIDE.md"
Write-Host ""
Write-Host "Happy monitoring!" -ForegroundColor Blue
