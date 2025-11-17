#!/bin/bash

# MentorLink Vercel Deployment Script
# This script automates the deployment process to Vercel

set -e

echo "=========================================="
echo "MentorLink Vercel Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✓ Vercel CLI installed${NC}"
fi

# Check if user is logged in
echo "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Not logged in to Vercel. Please log in:${NC}"
    vercel login
fi

echo -e "${GREEN}✓ Authenticated with Vercel${NC}"
echo ""

# Ask for deployment type
echo "Select deployment type:"
echo "1) Production deployment"
echo "2) Preview deployment"
echo "3) Development deployment"
read -p "Enter choice (1-3): " DEPLOY_TYPE

case $DEPLOY_TYPE in
    1)
        DEPLOY_ENV="production"
        DEPLOY_FLAG="--prod"
        ;;
    2)
        DEPLOY_ENV="preview"
        DEPLOY_FLAG=""
        ;;
    3)
        DEPLOY_ENV="development"
        DEPLOY_FLAG="--target development"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}Deploying to: $DEPLOY_ENV${NC}"
echo ""

# Pre-deployment checks
echo "Running pre-deployment checks..."

# Check if .env.production exists for production deployments
if [ "$DEPLOY_ENV" = "production" ] && [ ! -f .env.production ]; then
    echo -e "${YELLOW}Warning: .env.production not found${NC}"
    echo "Make sure environment variables are set in Vercel dashboard"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run linter
echo "Running linter..."
if npm run lint; then
    echo -e "${GREEN}✓ Linting passed${NC}"
else
    echo -e "${RED}✗ Linting failed${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build locally to check for errors
echo "Testing build..."
if npm run build; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    echo "Fix build errors before deploying"
    exit 1
fi

echo ""
echo -e "${BLUE}All pre-deployment checks passed!${NC}"
echo ""

# Confirm deployment
read -p "Ready to deploy to $DEPLOY_ENV. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Deploy to Vercel
echo ""
echo "Deploying to Vercel..."
echo ""

if vercel $DEPLOY_FLAG; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo "✓ Deployment successful!"
    echo "==========================================${NC}"
    echo ""
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls --prod 2>/dev/null | grep -m 1 "https://" | awk '{print $2}')
    
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        echo -e "Deployment URL: ${BLUE}$DEPLOYMENT_URL${NC}"
        echo ""
    fi
    
    echo "Next steps:"
    echo "1. Test the deployment thoroughly"
    echo "2. Check Vercel Analytics for performance"
    echo "3. Monitor Sentry for errors"
    echo "4. Verify all features are working"
    echo ""
    
    if [ "$DEPLOY_ENV" = "production" ]; then
        echo -e "${YELLOW}Production deployment complete!${NC}"
        echo "Remember to:"
        echo "- Announce the deployment to the team"
        echo "- Monitor error rates closely"
        echo "- Be ready to rollback if needed"
    fi
else
    echo ""
    echo -e "${RED}=========================================="
    echo "✗ Deployment failed!"
    echo "==========================================${NC}"
    echo ""
    echo "Check the error messages above and try again"
    exit 1
fi
