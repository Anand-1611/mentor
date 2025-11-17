# Monitoring Verification Script for Windows PowerShell
# This script verifies that all monitoring components are properly configured

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "MentorLink Monitoring Verification" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()
$success = @()

# Function to check environment variable
function Test-EnvVar {
    param($name, $required = $true)
    
    $value = [Environment]::GetEnvironmentVariable($name)
    if (-not $value) {
        # Try reading from .env file
        if (Test-Path ".env") {
            $content = Get-Content ".env" -Raw
            if ($content -match "$name=(.+)") {
                $value = $matches[1].Trim()
            }
        }
    }
    
    if ($value -and $value -ne "your-" -and $value -ne "[") {
        $success += "[OK] $name is configured"
        return $true
    } elseif ($required) {
        $errors += "[ERROR] $name is not configured"
        return $false
    } else {
        $warnings += "[WARN] $name is not configured (optional)"
        return $false
    }
}

# Function to test HTTP endpoint
function Test-Endpoint {
    param($name, $url, $expectedStatus = 200)
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq $expectedStatus) {
            $success += "[OK] $name is accessible (Status: $($response.StatusCode))"
            return $true
        } else {
            $warnings += "[WARN] $name returned unexpected status: $($response.StatusCode)"
            return $false
        }
    } catch {
        $errors += "[ERROR] $name is not accessible: $($_.Exception.Message)"
        return $false
    }
}

Write-Host "1. Checking Environment Variables..." -ForegroundColor Yellow
Write-Host ""

# Check Sentry configuration
Test-EnvVar "VITE_SENTRY_DSN" $false
Test-EnvVar "VITE_SENTRY_ENVIRONMENT" $false

# Check Supabase configuration
Test-EnvVar "VITE_SUPABASE_URL" $true
Test-EnvVar "VITE_SUPABASE_PUBLISHABLE_KEY" $true

# Check AI Services configuration
Test-EnvVar "VITE_AI_SERVICE_URL" $false

Write-Host ""
Write-Host "2. Checking Service Endpoints..." -ForegroundColor Yellow
Write-Host ""

# Check Supabase API
$supabaseUrl = [Environment]::GetEnvironmentVariable("VITE_SUPABASE_URL")
if (-not $supabaseUrl) {
    if (Test-Path ".env") {
        $content = Get-Content ".env" -Raw
        if ($content -match "VITE_SUPABASE_URL=(.+)") {
            $supabaseUrl = $matches[1].Trim().Trim('"')
        }
    }
}

if ($supabaseUrl) {
    Test-Endpoint "Supabase API" "$supabaseUrl/rest/v1/"
    Test-Endpoint "Supabase Storage" "$supabaseUrl/storage/v1/"
}

# Check AI Services (if configured)
$aiServiceUrl = [Environment]::GetEnvironmentVariable("VITE_AI_SERVICE_URL")
if (-not $aiServiceUrl) {
    if (Test-Path ".env") {
        $content = Get-Content ".env" -Raw
        if ($content -match "VITE_AI_SERVICE_URL=(.+)") {
            $aiServiceUrl = $matches[1].Trim().Trim('"')
        }
    }
}

if ($aiServiceUrl -and $aiServiceUrl -ne "http://localhost:8000") {
    Test-Endpoint "AI Services Health" "$aiServiceUrl/health"
}

Write-Host ""
Write-Host "3. Checking Monitoring Configuration Files..." -ForegroundColor Yellow
Write-Host ""

# Check for monitoring config files
if (Test-Path "monitoring-config.json") {
    $success += "[OK] monitoring-config.json exists"
} else {
    $warnings += "[WARN] monitoring-config.json not found"
}

if (Test-Path "sentry-alerts.json") {
    $success += "[OK] sentry-alerts.json exists"
} else {
    $warnings += "[WARN] sentry-alerts.json not found"
}

# Check for Sentry integration in code
if (Test-Path "src/lib/sentry.ts") {
    $success += "[OK] Sentry integration code exists"
} else {
    $errors += "[ERROR] Sentry integration code not found"
}

# Check for error boundary
if (Test-Path "src/components/ErrorBoundary.tsx") {
    $success += "[OK] Error boundary component exists"
} else {
    $errors += "[ERROR] Error boundary component not found"
}

Write-Host ""
Write-Host "4. Checking Package Dependencies..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    if ($packageJson.dependencies.'@sentry/react') {
        $success += "[OK] @sentry/react is installed"
    } else {
        $errors += "[ERROR] @sentry/react is not installed"
    }
} else {
    $errors += "[ERROR] package.json not found"
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Verification Results" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Display results
if ($success.Count -gt 0) {
    Write-Host "SUCCESS ($($success.Count)):" -ForegroundColor Green
    foreach ($item in $success) {
        Write-Host "  $item" -ForegroundColor Green
    }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($item in $warnings) {
        Write-Host "  $item" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($errors.Count -gt 0) {
    Write-Host "ERRORS ($($errors.Count)):" -ForegroundColor Red
    foreach ($item in $errors) {
        Write-Host "  $item" -ForegroundColor Red
    }
    Write-Host ""
}

# Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$total = $success.Count + $warnings.Count + $errors.Count
$successRate = [math]::Round(($success.Count / $total) * 100, 2)

Write-Host "Total Checks: $total" -ForegroundColor White
Write-Host "Passed: $($success.Count)" -ForegroundColor Green
Write-Host "Warnings: $($warnings.Count)" -ForegroundColor Yellow
Write-Host "Failed: $($errors.Count)" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })
Write-Host ""

if ($errors.Count -eq 0) {
    Write-Host "[SUCCESS] Monitoring verification completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Configure Sentry DSN in environment variables (if not done)" -ForegroundColor White
    Write-Host "2. Set up Better Stack log aggregation" -ForegroundColor White
    Write-Host "3. Create uptime monitors in Better Stack" -ForegroundColor White
    Write-Host "4. Configure alert channels (email, Slack, SMS)" -ForegroundColor White
    Write-Host "5. Test monitoring by triggering a test error" -ForegroundColor White
    Write-Host ""
    Write-Host "See docs/MONITORING_SETUP_GUIDE.md for detailed instructions" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "[FAILED] Monitoring verification failed. Please fix the errors above." -ForegroundColor Red
    Write-Host ""
    Write-Host "See docs/MONITORING_SETUP_GUIDE.md for setup instructions" -ForegroundColor Cyan
    exit 1
}
