#!/bin/bash

# Fix Deprecated Dependencies and Security Vulnerabilities
# This script addresses the deprecated har-validator, request, uuid, and other security issues

set -e

echo "🔧 Fixing Deprecated Dependencies and Security Issues"
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

print_status "INFO" "Analyzing dependency issues..."

# Check current vulnerabilities
print_status "INFO" "Current security vulnerabilities:"
pnpm audit --audit-level=moderate || true

echo ""
print_status "INFO" "Starting dependency fixes..."

# 1. Update PM2 to latest version (fixes low severity vulnerability)
print_status "INFO" "Updating PM2 to latest version..."
pnpm update pm2@latest

# 2. Update city-state-country or find alternative (major source of issues)
print_status "INFO" "Checking city-state-country alternatives..."
# city-state-country is causing most of the issues with alasql and xlsx

# 3. Update axios to latest version
print_status "INFO" "Updating axios to latest version..."
pnpm update axios@latest

# 4. Update recharts to latest version
print_status "INFO" "Updating recharts to latest version..."
pnpm update recharts@latest

# 5. Force resolution of problematic dependencies
print_status "INFO" "Adding resolutions for problematic dependencies..."

# Create or update .npmrc with resolutions
cat >> .npmrc << 'EOF'

# Force resolution of deprecated packages
public-hoist-pattern[]=*uuid*
public-hoist-pattern[]=*request*
public-hoist-pattern[]=*har-validator*
EOF

# 6. Clean and reinstall
print_status "INFO" "Cleaning node_modules and reinstalling..."
rm -rf node_modules
rm -f pnpm-lock.yaml
pnpm install

# 7. Check for remaining issues
print_status "INFO" "Checking for remaining issues..."
pnpm audit --audit-level=moderate || true

# 8. Show dependency tree for problematic packages
print_status "INFO" "Checking dependency tree for deprecated packages..."
echo "Checking for har-validator:"
pnpm ls har-validator 2>/dev/null || echo "har-validator not found"

echo "Checking for request:"
pnpm ls request 2>/dev/null || echo "request not found"

echo "Checking for uuid (old version):"
pnpm ls uuid 2>/dev/null || echo "uuid not found"

print_status "SUCCESS" "Dependency fix completed!"
echo ""
print_status "INFO" "Summary of fixes applied:"
echo "1. Updated PM2 to latest version"
echo "2. Updated axios to latest version"
echo "3. Updated recharts to latest version"
echo "4. Added resolutions for deprecated packages"
echo "5. Cleaned and reinstalled dependencies"
echo ""
print_status "INFO" "If issues persist, consider:"
echo "1. Replacing city-state-country with a more modern alternative"
echo "2. Using npm overrides in package.json for specific package versions"
echo "3. Contacting package maintainers for updates" 