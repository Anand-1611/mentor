# MentorLink Production Environment Setup Script (PowerShell)
# This script helps set up environment variables for production deployment

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MentorLink Production Environment Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.production exists
if (Test-Path .env.production) {
    Write-Host "Warning: .env.production already exists" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Exiting without changes"
        exit 0
    }
}

Write-Host "This script will help you create a .env.production file"
Write-Host "Please have the following information ready:"
Write-Host "  - Supabase production project URL and keys"
Write-Host "  - Stripe production API keys"
Write-Host "  - AI service deployment URL"
Write-Host "  - Sentry DSN"
Write-Host ""
Read-Host "Press Enter to continue..."
Write-Host ""

# Initialize .env.production content
$envContent = @"
# MentorLink Production Environment Variables
# Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# ============================================
# Supabase Configuration
# ============================================
"@

# Supabase URL
Write-Host "Supabase Configuration" -ForegroundColor Green
$SUPABASE_URL = Read-Host "Enter Supabase Project URL (https://[project-ref].supabase.co)"
$envContent += "`nVITE_SUPABASE_URL=$SUPABASE_URL"

# Extract project ref from URL
$PROJECT_REF = ($SUPABASE_URL -replace "https://", "" -replace "\.supabase\.co.*", "")
$envContent += "`nVITE_SUPABASE_PROJECT_ID=$PROJECT_REF"

# Supabase Anon Key
$SUPABASE_KEY = Read-Host "Enter Supabase Anon/Public Key"
$envContent += "`nVITE_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_KEY"

# Storage URL
$envContent += "`nVITE_STORAGE_URL=$SUPABASE_URL/storage/v1"

# Stripe Configuration
Write-Host ""
Write-Host "Stripe Configuration" -ForegroundColor Green
Write-Host "Make sure you're using LIVE mode keys (pk_live_ and sk_live_)"
$STRIPE_KEY = Read-Host "Enter Stripe Publishable Key (pk_live_...)"
$envContent += @"

# ============================================
# Stripe Configuration (Production Mode)
# ============================================
VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_KEY
"@

# AI Services URL
Write-Host ""
Write-Host "AI Services Configuration" -ForegroundColor Green
$AI_URL = Read-Host "Enter AI Service URL (https://[service].railway.app or .onrender.com)"
$envContent += @"

# ============================================
# AI Services Configuration
# ============================================
VITE_AI_SERVICE_URL=$AI_URL
"@

# Sentry Configuration
Write-Host ""
Write-Host "Sentry Configuration" -ForegroundColor Green
$SENTRY_DSN = Read-Host "Enter Sentry DSN (https://[key]@sentry.io/[project])"
$envContent += @"

# ============================================
# Sentry Configuration (Error Monitoring)
# ============================================
VITE_SENTRY_DSN=$SENTRY_DSN
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0
"@

# Feature Flags
$envContent += @"

# ============================================
# Feature Flags
# ============================================
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_VIDEO_CALLS=true
VITE_ENABLE_AI_FEATURES=true
"@

# Application Settings
Write-Host ""
$DOMAIN = Read-Host "Enter your production domain (e.g., mentorlink.com)"
$envContent += @"

# ============================================
# Application Settings
# ============================================
VITE_APP_NAME=MentorLink
VITE_APP_URL=https://$DOMAIN
VITE_SUPPORT_EMAIL=support@$DOMAIN
"@

# Write to file
$envContent | Out-File -FilePath .env.production -Encoding UTF8

Write-Host ""
Write-Host "✓ .env.production file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Review the .env.production file"
Write-Host "2. Add these variables to Vercel: vercel env pull"
Write-Host "3. Or manually add them in Vercel dashboard"
Write-Host ""
Write-Host "Important: Never commit .env.production to Git!" -ForegroundColor Yellow
Write-Host ""

# Verify .gitignore includes .env.production
if (Test-Path .gitignore) {
    $gitignoreContent = Get-Content .gitignore -Raw
    if ($gitignoreContent -notmatch ".env.production") {
        Add-Content -Path .gitignore -Value "`n.env.production"
        Write-Host "✓ Added .env.production to .gitignore" -ForegroundColor Green
    }
} else {
    ".env.production" | Out-File -FilePath .gitignore -Encoding UTF8
    Write-Host "✓ Created .gitignore and added .env.production" -ForegroundColor Green
}

# Create AI services environment file
Write-Host ""
$createAI = Read-Host "Do you want to create AI services environment variables? (y/N)"
if ($createAI -eq "y" -or $createAI -eq "Y") {
    Write-Host ""
    Write-Host "AI Services Environment Variables" -ForegroundColor Green
    
    $SERVICE_KEY = Read-Host "Enter Supabase Service Role Key (keep this secret!)"
    $OPENAI_KEY = Read-Host "Enter OpenAI API Key"
    $ANTHROPIC_KEY = Read-Host "Enter Anthropic API Key (optional, press Enter to skip)"
    
    $aiEnvContent = @"
# AI Services Production Environment Variables
# Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

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
"@
    
    # Create ai-services directory if it doesn't exist
    if (-not (Test-Path ai-services)) {
        New-Item -ItemType Directory -Path ai-services | Out-Null
    }
    
    $aiEnvContent | Out-File -FilePath ai-services/.env.production -Encoding UTF8
    
    Write-Host "✓ AI services .env.production created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Add these variables to Railway/Render:"
    Write-Host "  - SUPABASE_URL"
    Write-Host "  - SUPABASE_SERVICE_KEY"
    Write-Host "  - OPENAI_API_KEY"
    Write-Host "  - ANTHROPIC_API_KEY"
    Write-Host "  - STORAGE_URL"
    Write-Host "  - ENVIRONMENT"
    Write-Host "  - LOG_LEVEL"
    Write-Host "  - MAX_WORKERS"
    Write-Host "  - FAISS_INDEX_PATH"
    Write-Host "  - CORS_ORIGINS"
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Refer to DEPLOYMENT_GUIDE.md for next steps"
