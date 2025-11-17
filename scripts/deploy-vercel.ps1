# MentorLink Vercel Deployment Script (PowerShell)
# This script automates the deployment process to Vercel

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MentorLink Vercel Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✓ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✓ Vercel CLI installed" -ForegroundColor Green
}

# Check if user is logged in
Write-Host "Checking Vercel authentication..."
try {
    vercel whoami | Out-Null
    Write-Host "✓ Authenticated with Vercel" -ForegroundColor Green
} catch {
    Write-Host "Not logged in to Vercel. Please log in:" -ForegroundColor Yellow
    vercel login
}

Write-Host ""

# Ask for deployment type
Write-Host "Select deployment type:"
Write-Host "1) Production deployment"
Write-Host "2) Preview deployment"
Write-Host "3) Development deployment"
$DEPLOY_TYPE = Read-Host "Enter choice (1-3)"

switch ($DEPLOY_TYPE) {
    "1" {
        $DEPLOY_ENV = "production"
        $DEPLOY_FLAG = "--prod"
    }
    "2" {
        $DEPLOY_ENV = "preview"
        $DEPLOY_FLAG = ""
    }
    "3" {
        $DEPLOY_ENV = "development"
        $DEPLOY_FLAG = "--target development"
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Deploying to: $DEPLOY_ENV" -ForegroundColor Blue
Write-Host ""

# Pre-deployment checks
Write-Host "Running pre-deployment checks..."

# Check if .env.production exists for production deployments
if ($DEPLOY_ENV -eq "production" -and -not (Test-Path .env.production)) {
    Write-Host "Warning: .env.production not found" -ForegroundColor Yellow
    Write-Host "Make sure environment variables are set in Vercel dashboard"
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Run linter
Write-Host "Running linter..."
try {
    npm run lint
    Write-Host "✓ Linting passed" -ForegroundColor Green
} catch {
    Write-Host "✗ Linting failed" -ForegroundColor Red
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Build locally to check for errors
Write-Host "Testing build..."
try {
    npm run build
    Write-Host "✓ Build successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Build failed" -ForegroundColor Red
    Write-Host "Fix build errors before deploying"
    exit 1
}

Write-Host ""
Write-Host "All pre-deployment checks passed!" -ForegroundColor Blue
Write-Host ""

# Confirm deployment
$confirm = Read-Host "Ready to deploy to $DEPLOY_ENV. Continue? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Deployment cancelled"
    exit 0
}

# Deploy to Vercel
Write-Host ""
Write-Host "Deploying to Vercel..."
Write-Host ""

try {
    if ($DEPLOY_FLAG) {
        vercel $DEPLOY_FLAG
    } else {
        vercel
    }
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "✓ Deployment successful!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    
    # Get deployment URL
    $DEPLOYMENT_URL = (vercel ls --prod 2>$null | Select-String "https://" | Select-Object -First 1).ToString().Split()[1]
    
    if ($DEPLOYMENT_URL) {
        Write-Host "Deployment URL: $DEPLOYMENT_URL" -ForegroundColor Blue
        Write-Host ""
    }
    
    Write-Host "Next steps:"
    Write-Host "1. Test the deployment thoroughly"
    Write-Host "2. Check Vercel Analytics for performance"
    Write-Host "3. Monitor Sentry for errors"
    Write-Host "4. Verify all features are working"
    Write-Host ""
    
    if ($DEPLOY_ENV -eq "production") {
        Write-Host "Production deployment complete!" -ForegroundColor Yellow
        Write-Host "Remember to:"
        Write-Host "- Announce the deployment to the team"
        Write-Host "- Monitor error rates closely"
        Write-Host "- Be ready to rollback if needed"
    }
} catch {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "✗ Deployment failed!" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above and try again"
    exit 1
}
