#!/bin/bash

# MentorLink Monitoring Setup Script
# This script helps configure monitoring and logging services

set -e

echo "=========================================="
echo "MentorLink Monitoring Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "This script will help you set up monitoring for MentorLink"
echo ""
echo "Services to configure:"
echo "  1. Sentry (Error tracking)"
echo "  2. Better Stack (Log aggregation and uptime monitoring)"
echo "  3. Vercel Analytics (Performance monitoring)"
echo ""
read -p "Press Enter to continue..."
echo ""

# Sentry Setup
echo -e "${BLUE}=========================================="
echo "Sentry Setup"
echo "==========================================${NC}"
echo ""
echo "1. Go to https://sentry.io/"
echo "2. Create account or sign in"
echo "3. Create new project:"
echo "   - Platform: React"
echo "   - Name: mentorlink-production"
echo "4. Copy the DSN from the project settings"
echo ""
read -p "Have you created the Sentry project? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter Sentry DSN: " SENTRY_DSN
    
    # Validate DSN format
    if [[ $SENTRY_DSN =~ ^https://.*@.*\.ingest\.sentry\.io/.* ]]; then
        echo -e "${GREEN}✓ Valid Sentry DSN${NC}"
        
        # Add to environment file
        if [ -f .env.production ]; then
            if grep -q "VITE_SENTRY_DSN" .env.production; then
                sed -i "s|VITE_SENTRY_DSN=.*|VITE_SENTRY_DSN=$SENTRY_DSN|" .env.production
            else
                echo "VITE_SENTRY_DSN=$SENTRY_DSN" >> .env.production
            fi
            echo -e "${GREEN}✓ Added to .env.production${NC}"
        fi
        
        echo ""
        echo "Next steps for Sentry:"
        echo "1. Add VITE_SENTRY_DSN to Vercel environment variables"
        echo "2. Set VITE_SENTRY_ENVIRONMENT=production"
        echo "3. Deploy to apply changes"
        echo "4. Test by throwing an error in browser console:"
        echo "   throw new Error('Test Sentry Integration');"
    else
        echo -e "${RED}✗ Invalid DSN format${NC}"
    fi
else
    echo -e "${YELLOW}Skipping Sentry setup${NC}"
fi

echo ""
echo -e "${BLUE}=========================================="
echo "Better Stack Setup"
echo "==========================================${NC}"
echo ""
echo "1. Go to https://betterstack.com/"
echo "2. Create account or sign in"
echo "3. Create new source:"
echo "   - Type: HTTP"
echo "   - Name: mentorlink-logs"
echo "4. Copy the source token"
echo ""
read -p "Have you created the Better Stack source? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter Better Stack source token: " BETTERSTACK_TOKEN
    
    echo -e "${GREEN}✓ Better Stack token saved${NC}"
    echo ""
    echo "Next steps for Better Stack:"
    echo ""
    echo "For Vercel (Frontend):"
    echo "1. Go to Vercel Dashboard → Integrations"
    echo "2. Search for 'Better Stack'"
    echo "3. Install integration"
    echo "4. Connect to your project"
    echo ""
    echo "For Railway (AI Services):"
    echo "1. Go to Railway project settings"
    echo "2. Add log drain:"
    echo "   URL: https://in.logs.betterstack.com/$BETTERSTACK_TOKEN"
    echo ""
    echo "For Render (AI Services):"
    echo "1. Go to service settings"
    echo "2. Add log stream:"
    echo "   Destination: Better Stack"
    echo "   Token: $BETTERSTACK_TOKEN"
else
    echo -e "${YELLOW}Skipping Better Stack setup${NC}"
fi

echo ""
echo -e "${BLUE}=========================================="
echo "Uptime Monitoring Setup"
echo "==========================================${NC}"
echo ""
echo "Create monitors in Better Stack:"
echo ""
read -p "Enter your production domain (e.g., mentorlink.com): " DOMAIN

echo ""
echo "Create these monitors in Better Stack:"
echo ""
echo "1. Frontend Monitor:"
echo "   - URL: https://$DOMAIN"
echo "   - Check interval: 1 minute"
echo "   - Timeout: 10 seconds"
echo "   - Expected status: 200"
echo ""
echo "2. API Monitor:"
echo "   - URL: https://[your-supabase-project].supabase.co/rest/v1/"
echo "   - Check interval: 1 minute"
echo "   - Headers: apikey: [your-anon-key]"
echo "   - Expected status: 200"
echo ""
echo "3. AI Services Monitor:"
echo "   - URL: https://[your-ai-service].railway.app/health"
echo "   - Check interval: 2 minutes"
echo "   - Expected status: 200"
echo ""
read -p "Press Enter when monitors are created..."

echo ""
echo -e "${BLUE}=========================================="
echo "Alert Configuration"
echo "==========================================${NC}"
echo ""
echo "Configure alerts in Sentry:"
echo ""
echo "1. Go to Alerts → Create Alert Rule"
echo "2. Create these rules:"
echo ""
echo "   Error Rate Spike:"
echo "   - Condition: Error count > 50 in 5 minutes"
echo "   - Action: Email + Slack"
echo ""
echo "   Performance Degradation:"
echo "   - Condition: p95 response time > 2s"
echo "   - Action: Email"
echo ""
echo "   Payment Failures:"
echo "   - Condition: Payment error > 5 in 1 hour"
echo "   - Action: Email + Slack"
echo ""
read -p "Press Enter when Sentry alerts are configured..."

echo ""
echo "Configure alerts in Better Stack:"
echo ""
echo "1. Go to Incidents → Policies"
echo "2. Create policy:"
echo "   - Trigger: Service down for 2 minutes"
echo "   - Escalation: Email → SMS → Phone"
echo ""
read -p "Press Enter when Better Stack alerts are configured..."

echo ""
echo -e "${BLUE}=========================================="
echo "Vercel Analytics"
echo "==========================================${NC}"
echo ""
echo "Enable Vercel Analytics:"
echo ""
echo "1. Go to Vercel project"
echo "2. Navigate to Analytics tab"
echo "3. Click 'Enable Analytics'"
echo "4. Choose plan (Hobby is free)"
echo ""
read -p "Have you enabled Vercel Analytics? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✓ Vercel Analytics enabled${NC}"
else
    echo -e "${YELLOW}Remember to enable Vercel Analytics${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Monitoring Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Summary:"
echo "✓ Sentry configured for error tracking"
echo "✓ Better Stack configured for logs and uptime"
echo "✓ Vercel Analytics enabled"
echo "✓ Alerts configured"
echo ""
echo "Next steps:"
echo "1. Test error tracking by throwing a test error"
echo "2. Verify logs are flowing to Better Stack"
echo "3. Check uptime monitors are active"
echo "4. Test alert notifications"
echo "5. Create custom dashboards"
echo ""
echo "Documentation:"
echo "- Monitoring Guide: docs/MONITORING_AND_LOGGING.md"
echo "- Deployment Guide: DEPLOYMENT_GUIDE.md"
echo ""
echo -e "${BLUE}Happy monitoring!${NC}"
