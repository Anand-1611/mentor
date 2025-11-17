# MentorLink Deployment Verification Script (PowerShell)
# Verifies that all services are running correctly after deployment

param(
    [string]$FrontendUrl = "https://your-domain.com",
    [string]$ApiUrl = "https://your-project.supabase.co",
    [string]$AiServiceUrl = "https://your-ai-service.railway.app"
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================" -ForegroundColor Blue
Write-Host "MentorLink Deployment Verification" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Testing deployment at:"
Write-Host "  Frontend: $FrontendUrl"
Write-Host "  API: $ApiUrl"
Write-Host "  AI Services: $AiServiceUrl"
Write-Host ""

# Track failures
$failures = 0

# Function to check HTTP status
function Test-HttpEndpoint {
    param(
        [string]$Url,
        [int]$ExpectedStatus,
        [string]$Name
    )
    
    Write-Host -NoNewline "Checking $Name... "
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -TimeoutSec 10
        $status = $response.StatusCode
        
        if ($status -eq $ExpectedStatus) {
            Write-Host "✓ OK" -ForegroundColor Green -NoNewline
            Write-Host " (HTTP $status)"
            return $true
        } else {
            Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
            Write-Host " (HTTP $status, expected $ExpectedStatus)"
            return $false
        }
    } catch {
        Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
        Write-Host " (Error: $($_.Exception.Message))"
        return $false
    }
}

# Function to check JSON response
function Test-JsonField {
    param(
        [string]$Url,
        [string]$Field,
        [string]$Expected,
        [string]$Name
    )
    
    Write-Host -NoNewline "Checking $Name... "
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 10
        $value = $response.$Field
        
        if ($value -eq $Expected) {
            Write-Host "✓ OK" -ForegroundColor Green -NoNewline
            Write-Host " ($Field: $value)"
            return $true
        } else {
            Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
            Write-Host " ($Field: $value, expected $Expected)"
            return $false
        }
    } catch {
        Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
        Write-Host " (Error: $($_.Exception.Message))"
        return $false
    }
}

Write-Host "==========================================" -ForegroundColor Blue
Write-Host "Frontend Checks" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

if (-not (Test-HttpEndpoint "$FrontendUrl" 200 "Frontend homepage")) { $failures++ }
if (-not (Test-HttpEndpoint "$FrontendUrl/notes" 200 "Notes page")) { $failures++ }
if (-not (Test-HttpEndpoint "$FrontendUrl/mentors" 200 "Mentors page")) { $failures++ }
if (-not (Test-HttpEndpoint "$FrontendUrl/dashboard" 200 "Dashboard page")) { $failures++ }

Write-Host ""
Write-Host "==========================================" -ForegroundColor Blue
Write-Host "API Checks" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

if (-not (Test-HttpEndpoint "$ApiUrl/rest/v1/" 200 "Supabase REST API")) { $failures++ }
if (-not (Test-HttpEndpoint "$ApiUrl/storage/v1/" 200 "Supabase Storage API")) { $failures++ }

Write-Host ""
Write-Host "==========================================" -ForegroundColor Blue
Write-Host "AI Services Checks" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

if (-not (Test-HttpEndpoint "$AiServiceUrl/health" 200 "AI Services health")) { $failures++ }
if (-not (Test-JsonField "$AiServiceUrl/health" "status" "healthy" "AI Services status")) { $failures++ }
if (-not (Test-HttpEndpoint "$AiServiceUrl/docs" 200 "AI Services docs")) { $failures++ }

Write-Host ""
Write-Host "==========================================" -ForegroundColor Blue
Write-Host "DNS Checks" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

Write-Host -NoNewline "Checking DNS resolution... "
$domain = $FrontendUrl -replace "https://", "" -replace "http://", ""
try {
    $dns = Resolve-DnsName $domain -ErrorAction Stop
    Write-Host "✓ OK" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED" -ForegroundColor Red
    $failures++
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Blue
Write-Host "Performance Checks" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

Write-Host -NoNewline "Checking response time... "
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri $FrontendUrl -Method Get -UseBasicParsing -TimeoutSec 10
    $stopwatch.Stop()
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($responseTime -lt 3000) {
        Write-Host "✓ OK" -ForegroundColor Green -NoNewline
        Write-Host " (${responseTime}ms)"
    } else {
        Write-Host "⚠ Slow" -ForegroundColor Yellow -NoNewline
        Write-Host " (${responseTime}ms)"
    }
} catch {
    Write-Host "✗ FAILED" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Blue
Write-Host "Monitoring Checks" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

Write-Host -NoNewline "Checking Sentry DSN... "
if ($env:VITE_SENTRY_DSN) {
    Write-Host "✓ Configured" -ForegroundColor Green
} else {
    Write-Host "⚠ Not configured" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Blue
Write-Host "Summary" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

if ($failures -eq 0) {
    Write-Host "✓ All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Deployment is healthy and ready for use."
    exit 0
} else {
    Write-Host "✗ $failures check(s) failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review the failures above and fix any issues."
    exit 1
}
