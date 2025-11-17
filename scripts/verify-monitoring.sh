#!/bin/bash
# Monitoring Verification Script for Unix/Linux/macOS
# This script verifies that all monitoring components are properly configured

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Arrays to store results
declare -a errors
declare -a warnings
declare -a success

echo -e "${CYAN}==================================${NC}"
echo -e "${CYAN}MentorLink Monitoring Verification${NC}"
echo -e "${CYAN}==================================${NC}"
echo ""

# Function to check environment variable
check_env_var() {
    local name=$1
    local required=${2:-true}
    local value=""
    
    # Try to get from environment
    value="${!name}"
    
    # If not in environment, try .env file
    if [ -z "$value" ] && [ -f ".env" ]; then
        value=$(grep "^${name}=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    fi
    
    if [ -n "$value" ] && [[ ! "$value" =~ ^(your-|\[) ]]; then
        success+=("✓ $name is configured")
        return 0
    elif [ "$required" = true ]; then
        errors+=("✗ $name is not configured")
        return 1
    else
        warnings+=("⚠ $name is not configured (optional)")
        return 1
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    if command -v curl &> /dev/null; then
        local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
        
        if [ "$status" = "$expected_status" ]; then
            success+=("✓ $name is accessible (Status: $status)")
            return 0
        elif [ "$status" = "000" ]; then
            errors+=("✗ $name is not accessible (connection failed)")
            return 1
        else
            warnings+=("⚠ $name returned unexpected status: $status")
            return 1
        fi
    else
        warnings+=("⚠ curl not available, skipping endpoint test for $name")
        return 1
    fi
}

# Function to get env var value
get_env_var() {
    local name=$1
    local value="${!name}"
    
    if [ -z "$value" ] && [ -f ".env" ]; then
        value=$(grep "^${name}=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    fi
    
    echo "$value"
}

echo -e "${YELLOW}1. Checking Environment Variables...${NC}"
echo ""

# Check Sentry configuration
check_env_var "VITE_SENTRY_DSN" false
check_env_var "VITE_SENTRY_ENVIRONMENT" false

# Check Supabase configuration
check_env_var "VITE_SUPABASE_URL" true
check_env_var "VITE_SUPABASE_PUBLISHABLE_KEY" true

# Check AI Services configuration
check_env_var "VITE_AI_SERVICE_URL" false

echo ""
echo -e "${YELLOW}2. Checking Service Endpoints...${NC}"
echo ""

# Check Supabase API
SUPABASE_URL=$(get_env_var "VITE_SUPABASE_URL")
if [ -n "$SUPABASE_URL" ]; then
    test_endpoint "Supabase API" "${SUPABASE_URL}/rest/v1/"
    test_endpoint "Supabase Storage" "${SUPABASE_URL}/storage/v1/"
fi

# Check AI Services (if configured)
AI_SERVICE_URL=$(get_env_var "VITE_AI_SERVICE_URL")
if [ -n "$AI_SERVICE_URL" ] && [ "$AI_SERVICE_URL" != "http://localhost:8000" ]; then
    test_endpoint "AI Services Health" "${AI_SERVICE_URL}/health"
fi

echo ""
echo -e "${YELLOW}3. Checking Monitoring Configuration Files...${NC}"
echo ""

# Check for monitoring config files
if [ -f "monitoring-config.json" ]; then
    success+=("✓ monitoring-config.json exists")
else
    warnings+=("⚠ monitoring-config.json not found")
fi

if [ -f "sentry-alerts.json" ]; then
    success+=("✓ sentry-alerts.json exists")
else
    warnings+=("⚠ sentry-alerts.json not found")
fi

# Check for Sentry integration in code
if [ -f "src/lib/sentry.ts" ]; then
    success+=("✓ Sentry integration code exists")
else
    errors+=("✗ Sentry integration code not found")
fi

# Check for error boundary
if [ -f "src/components/ErrorBoundary.tsx" ]; then
    success+=("✓ Error boundary component exists")
else
    errors+=("✗ Error boundary component not found")
fi

echo ""
echo -e "${YELLOW}4. Checking Package Dependencies...${NC}"
echo ""

if [ -f "package.json" ]; then
    if grep -q '"@sentry/react"' package.json; then
        success+=("✓ @sentry/react is installed")
    else
        errors+=("✗ @sentry/react is not installed")
    fi
else
    errors+=("✗ package.json not found")
fi

echo ""
echo -e "${CYAN}==================================${NC}"
echo -e "${CYAN}Verification Results${NC}"
echo -e "${CYAN}==================================${NC}"
echo ""

# Display results
if [ ${#success[@]} -gt 0 ]; then
    echo -e "${GREEN}SUCCESS (${#success[@]}):${NC}"
    for item in "${success[@]}"; do
        echo -e "${GREEN}  $item${NC}"
    done
    echo ""
fi

if [ ${#warnings[@]} -gt 0 ]; then
    echo -e "${YELLOW}WARNINGS (${#warnings[@]}):${NC}"
    for item in "${warnings[@]}"; do
        echo -e "${YELLOW}  $item${NC}"
    done
    echo ""
fi

if [ ${#errors[@]} -gt 0 ]; then
    echo -e "${RED}ERRORS (${#errors[@]}):${NC}"
    for item in "${errors[@]}"; do
        echo -e "${RED}  $item${NC}"
    done
    echo ""
fi

# Summary
echo -e "${CYAN}==================================${NC}"
echo -e "${CYAN}Summary${NC}"
echo -e "${CYAN}==================================${NC}"
echo ""

total=$((${#success[@]} + ${#warnings[@]} + ${#errors[@]}))
success_rate=0
if [ $total -gt 0 ]; then
    success_rate=$((${#success[@]} * 100 / total))
fi

echo -e "Total Checks: $total"
echo -e "${GREEN}Passed: ${#success[@]}${NC}"
echo -e "${YELLOW}Warnings: ${#warnings[@]}${NC}"
echo -e "${RED}Failed: ${#errors[@]}${NC}"

if [ $success_rate -ge 80 ]; then
    echo -e "${GREEN}Success Rate: ${success_rate}%${NC}"
elif [ $success_rate -ge 60 ]; then
    echo -e "${YELLOW}Success Rate: ${success_rate}%${NC}"
else
    echo -e "${RED}Success Rate: ${success_rate}%${NC}"
fi
echo ""

if [ ${#errors[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ Monitoring verification completed successfully!${NC}"
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo -e "1. Configure Sentry DSN in environment variables (if not done)"
    echo -e "2. Set up Better Stack log aggregation"
    echo -e "3. Create uptime monitors in Better Stack"
    echo -e "4. Configure alert channels (email, Slack, SMS)"
    echo -e "5. Test monitoring by triggering a test error"
    echo ""
    echo -e "${CYAN}See docs/MONITORING_SETUP_GUIDE.md for detailed instructions${NC}"
    exit 0
else
    echo -e "${RED}✗ Monitoring verification failed. Please fix the errors above.${NC}"
    echo ""
    echo -e "${CYAN}See docs/MONITORING_SETUP_GUIDE.md for setup instructions${NC}"
    exit 1
fi
