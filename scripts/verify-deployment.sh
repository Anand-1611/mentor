#!/bin/bash

# MentorLink Deployment Verification Script
# Verifies that all services are running correctly after deployment

set -e

echo "=========================================="
echo "MentorLink Deployment Verification"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="${1:-https://your-domain.com}"
API_URL="${2:-https://your-project.supabase.co}"
AI_SERVICE_URL="${3:-https://your-ai-service.railway.app}"

echo "Testing deployment at:"
echo "  Frontend: $FRONTEND_URL"
echo "  API: $API_URL"
echo "  AI Services: $AI_SERVICE_URL"
echo ""

# Function to check HTTP status
check_http() {
    local url=$1
    local expected=$2
    local name=$3
    
    echo -n "Checking $name... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$status" = "$expected" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $status)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $status, expected $expected)"
        return 1
    fi
}

# Function to check JSON response
check_json() {
    local url=$1
    local field=$2
    local expected=$3
    local name=$4
    
    echo -n "Checking $name... "
    
    response=$(curl -s "$url" || echo "{}")
    value=$(echo "$response" | grep -o "\"$field\":\"[^\"]*\"" | cut -d'"' -f4)
    
    if [ "$value" = "$expected" ]; then
        echo -e "${GREEN}✓ OK${NC} ($field: $value)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} ($field: $value, expected $expected)"
        return 1
    fi
}

# Track failures
failures=0

echo "=========================================="
echo "Frontend Checks"
echo "=========================================="
echo ""

check_http "$FRONTEND_URL" "200" "Frontend homepage" || ((failures++))
check_http "$FRONTEND_URL/notes" "200" "Notes page" || ((failures++))
check_http "$FRONTEND_URL/mentors" "200" "Mentors page" || ((failures++))
check_http "$FRONTEND_URL/dashboard" "200" "Dashboard page" || ((failures++))

echo ""
echo "=========================================="
echo "API Checks"
echo "=========================================="
echo ""

check_http "$API_URL/rest/v1/" "200" "Supabase REST API" || ((failures++))
check_http "$API_URL/storage/v1/" "200" "Supabase Storage API" || ((failures++))

echo ""
echo "=========================================="
echo "AI Services Checks"
echo "=========================================="
echo ""

check_http "$AI_SERVICE_URL/health" "200" "AI Services health" || ((failures++))
check_json "$AI_SERVICE_URL/health" "status" "healthy" "AI Services status" || ((failures++))
check_http "$AI_SERVICE_URL/docs" "200" "AI Services docs" || ((failures++))

echo ""
echo "=========================================="
echo "SSL/TLS Checks"
echo "=========================================="
echo ""

echo -n "Checking SSL certificate... "
if echo | openssl s_client -connect "${FRONTEND_URL#https://}:443" -servername "${FRONTEND_URL#https://}" 2>/dev/null | grep -q "Verify return code: 0"; then
    echo -e "${GREEN}✓ Valid${NC}"
else
    echo -e "${YELLOW}⚠ Warning${NC} (certificate may have issues)"
    ((failures++))
fi

echo ""
echo "=========================================="
echo "DNS Checks"
echo "=========================================="
echo ""

echo -n "Checking DNS resolution... "
if host "${FRONTEND_URL#https://}" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    ((failures++))
fi

echo ""
echo "=========================================="
echo "Performance Checks"
echo "=========================================="
echo ""

echo -n "Checking response time... "
response_time=$(curl -o /dev/null -s -w '%{time_total}' "$FRONTEND_URL")
response_time_ms=$(echo "$response_time * 1000" | bc)

if (( $(echo "$response_time < 3" | bc -l) )); then
    echo -e "${GREEN}✓ OK${NC} (${response_time_ms}ms)"
else
    echo -e "${YELLOW}⚠ Slow${NC} (${response_time_ms}ms)"
fi

echo ""
echo "=========================================="
echo "Monitoring Checks"
echo "=========================================="
echo ""

echo -n "Checking Sentry DSN... "
if [ -n "$VITE_SENTRY_DSN" ]; then
    echo -e "${GREEN}✓ Configured${NC}"
else
    echo -e "${YELLOW}⚠ Not configured${NC}"
fi

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""

if [ $failures -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Deployment is healthy and ready for use."
    exit 0
else
    echo -e "${RED}✗ $failures check(s) failed${NC}"
    echo ""
    echo "Please review the failures above and fix any issues."
    exit 1
fi
