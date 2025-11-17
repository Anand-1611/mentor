#!/bin/bash

# MentorLink Production Environment Setup Script
# This script helps set up environment variables for production deployment

set -e

echo "=========================================="
echo "MentorLink Production Environment Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ -f .env.production ]; then
    echo -e "${YELLOW}Warning: .env.production already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting without changes"
        exit 0
    fi
fi

echo "This script will help you create a .env.production file"
echo "Please have the following information ready:"
echo "  - Supabase production project URL and keys"
echo "  - Stripe production API keys"
echo "  - AI service deployment URL"
echo "  - Sentry DSN"
echo ""
read -p "Press Enter to continue..."
echo ""

# Create .env.production file
cat > .env.production << 'EOF'
# MentorLink Production Environment Variables
# Generated on: $(date)

# ============================================
# Supabase Configuration
# ============================================
EOF

# Supabase URL
echo ""
echo -e "${GREEN}Supabase Configuration${NC}"
read -p "Enter Supabase Project URL (https://[project-ref].supabase.co): " SUPABASE_URL
echo "VITE_SUPABASE_URL=$SUPABASE_URL" >> .env.production

# Extract project ref from URL
PROJECT_REF=$(echo $SUPABASE_URL | sed -n 's/.*https:\/\/\([^.]*\).*/\1/p')
echo "VITE_SUPABASE_PROJECT_ID=$PROJECT_REF" >> .env.production

# Supabase Anon Key
read -p "Enter Supabase Anon/Public Key: " SUPABASE_KEY
echo "VITE_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_KEY" >> .env.production

# Storage URL
echo "VITE_STORAGE_URL=$SUPABASE_URL/storage/v1" >> .env.production

# Stripe Configuration
echo ""
echo -e "${GREEN}Stripe Configuration${NC}"
echo "Make sure you're using LIVE mode keys (pk_live_ and sk_live_)"
read -p "Enter Stripe Publishable Key (pk_live_...): " STRIPE_KEY
echo "" >> .env.production
echo "# ============================================" >> .env.production
echo "# Stripe Configuration (Production Mode)" >> .env.production
echo "# ============================================" >> .env.production
echo "VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_KEY" >> .env.production

# AI Services URL
echo ""
echo -e "${GREEN}AI Services Configuration${NC}"
read -p "Enter AI Service URL (https://[service].railway.app or .onrender.com): " AI_URL
echo "" >> .env.production
echo "# ============================================" >> .env.production
echo "# AI Services Configuration" >> .env.production
echo "# ============================================" >> .env.production
echo "VITE_AI_SERVICE_URL=$AI_URL" >> .env.production

# Sentry Configuration
echo ""
echo -e "${GREEN}Sentry Configuration${NC}"
read -p "Enter Sentry DSN (https://[key]@sentry.io/[project]): " SENTRY_DSN
echo "" >> .env.production
echo "# ============================================" >> .env.production
echo "# Sentry Configuration (Error Monitoring)" >> .env.production
echo "# ============================================" >> .env.production
echo "VITE_SENTRY_DSN=$SENTRY_DSN" >> .env.production
echo "VITE_SENTRY_ENVIRONMENT=production" >> .env.production
echo "VITE_SENTRY_TRACES_SAMPLE_RATE=0.1" >> .env.production
echo "VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1" >> .env.production
echo "VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0" >> .env.production

# Feature Flags
echo "" >> .env.production
echo "# ============================================" >> .env.production
echo "# Feature Flags" >> .env.production
echo "# ============================================" >> .env.production
echo "VITE_ENABLE_ANALYTICS=true" >> .env.production
echo "VITE_ENABLE_VIDEO_CALLS=true" >> .env.production
echo "VITE_ENABLE_AI_FEATURES=true" >> .env.production

# Application Settings
echo ""
read -p "Enter your production domain (e.g., mentorlink.com): " DOMAIN
echo "" >> .env.production
echo "# ============================================" >> .env.production
echo "# Application Settings" >> .env.production
echo "# ============================================" >> .env.production
echo "VITE_APP_NAME=MentorLink" >> .env.production
echo "VITE_APP_URL=https://$DOMAIN" >> .env.production
echo "VITE_SUPPORT_EMAIL=support@$DOMAIN" >> .env.production

echo ""
echo -e "${GREEN}✓ .env.production file created successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Review the .env.production file"
echo "2. Add these variables to Vercel: vercel env pull"
echo "3. Or manually add them in Vercel dashboard"
echo ""
echo -e "${YELLOW}Important: Never commit .env.production to Git!${NC}"
echo ""

# Verify .gitignore includes .env.production
if ! grep -q ".env.production" .gitignore 2>/dev/null; then
    echo ".env.production" >> .gitignore
    echo -e "${GREEN}✓ Added .env.production to .gitignore${NC}"
fi

# Create AI services environment file
echo ""
read -p "Do you want to create AI services environment variables? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}AI Services Environment Variables${NC}"
    
    read -p "Enter Supabase Service Role Key (keep this secret!): " SERVICE_KEY
    read -p "Enter OpenAI API Key: " OPENAI_KEY
    read -p "Enter Anthropic API Key (optional, press Enter to skip): " ANTHROPIC_KEY
    
    cat > ai-services/.env.production << EOF
# AI Services Production Environment Variables
# Generated on: $(date)

SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_KEY=$SERVICE_KEY
OPENAI_API_KEY=$OPENAI_KEY
ANTHROPIC_API_KEY=$ANTHROPIC_KEY
STORAGE_URL=$SUPABASE_URL/storage/v1
ENVIRONMENT=production
LOG_LEVEL=INFO
MAX_WORKERS=4
FAISS_INDEX_PATH=/app/data/faiss_index
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
EOF
    
    echo -e "${GREEN}✓ AI services .env.production created!${NC}"
    echo ""
    echo "Add these variables to Railway/Render:"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_SERVICE_KEY"
    echo "  - OPENAI_API_KEY"
    echo "  - ANTHROPIC_API_KEY"
    echo "  - STORAGE_URL"
    echo "  - ENVIRONMENT"
    echo "  - LOG_LEVEL"
    echo "  - MAX_WORKERS"
    echo "  - FAISS_INDEX_PATH"
    echo "  - CORS_ORIGINS"
fi

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo "Refer to DEPLOYMENT_GUIDE.md for next steps"
