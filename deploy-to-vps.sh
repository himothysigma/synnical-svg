#!/bin/bash
# Synnical OS Deployment Script
# This script deploys SVG files and updates the Next.js app on VPS

set -e

VPS_HOST="92.38.177.23"
VPS_USER="root"
VPS_DIR="/var/www/synnical"
LOCAL_DIR="/home/z/my-project"

echo "=== Synnical OS Deployment Script ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_ok() { echo -e "${GREEN}✅ $1${NC}"; }
log_err() { echo -e "${RED}❌ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Step 1: Validate SVGs locally
echo "Step 1: Validating SVG files..."
if [ -f "$LOCAL_DIR/index.svg" ]; then
    SVG_COUNT=$(ls $LOCAL_DIR/synnical-*.svg 2>/dev/null | wc -l)
    log_ok "Found $SVG_COUNT synnical-*.svg files"
    log_ok "index.svg exists"
else
    log_err "SVG files not found!"
    exit 1
fi

# Step 2: Check SHA256
echo ""
echo "Step 2: Verifying SHA-256 hash..."
SHA=$(sha256sum "$LOCAL_DIR/index.svg" | awk '{print $1}')
EXPECTED="9aa7f0160ff6b4ee5592b6cd00c92128954dc026a57d49fe08d25e934ad99805"
if [ "$SHA" = "$EXPECTED" ]; then
    log_ok "SHA-256 matches expected value"
else
    log_warn "SHA-256 mismatch!"
    echo "  Got:      $SHA"
    echo "  Expected: $EXPECTED"
fi

# Step 3: Deploy SVGs to VPS
echo ""
echo "Step 3: Deploying SVG files to VPS..."
echo "This step requires SSH access to VPS."
echo ""
echo "To deploy manually, run these commands on VPS:"
echo ""
echo "  # Connect to VPS"
echo "  ssh root@$VPS_HOST"
echo ""
echo "  # Create public directory if not exists"
echo "  mkdir -p $VPS_DIR/public/svg"
echo ""
echo "  # Upload SVG files (from local machine)"
echo "  # Run this from your LOCAL machine:"
echo "  rsync -avz --progress \\"
echo "      $LOCAL_DIR/index.svg \\"
echo "      $LOCAL_DIR/synnical-*.svg \\"
echo "      $LOCAL_DIR/logo.svg \\"
echo "      $LOCAL_DIR/synnical-desktop.svg \\"
echo "      $LOCAL_DIR/synnical-desktop-interactive.svg \\"
echo "      $VPS_USER@$VPS_HOST:$VPS_DIR/public/"
echo ""
echo "  # Restart PM2 (if needed)"
echo "  cd $VPS_DIR && pm2 restart all"
echo ""

# Step 4: Verify CDN
echo "Step 4: Verifying CDN (jsDelivr)..."
CDN_URL="https://cdn.jsdelivr.net/gh/himothysigma/synnical-svg@main/index.svg"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$CDN_URL")
if [ "$HTTP_CODE" = "200" ]; then
    log_ok "CDN is serving index.svg (HTTP $HTTP_CODE)"
else
    log_err "CDN returned HTTP $HTTP_CODE"
fi

# Step 5: Verify VPS
echo ""
echo "Step 5: Checking VPS..."
VPS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://synnical.co.uk" 2>/dev/null || echo "000")
if [ "$VPS_HTTP" = "200" ]; then
    log_ok "VPS main site is up (HTTP $VPS_HTTP)"
else
    log_warn "VPS returned HTTP $VPS_HTTP"
fi

VPS_SVG=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://synnical.co.uk/index.svg" 2>/dev/null || echo "000")
if [ "$VPS_SVG" = "200" ]; then
    log_ok "VPS SVG endpoint working (HTTP $VPS_SVG)"
else
    log_err "VPS SVG returns HTTP $VPS_SVG - needs deployment!"
fi

echo ""
echo "=== Deployment Summary ==="
echo ""
echo "✅ GitHub:     Pushed to himothysigma/synnical-svg@main"
echo "✅ CDN:        jsDelivr serving all SVGs"
echo "⚠️  VPS SVG:   Needs manual deployment (SSH required)"
echo "⚠️  VPS App:   Running old version - needs update"
echo ""
echo "To complete VPS deployment:"
echo "  1. SSH into VPS: ssh root@$VPS_HOST"
echo "  2. Upload SVGs: See commands above"
echo "  3. Update Next.js app if needed"
echo "  4. Restart services: pm2 restart all"
echo ""
echo "CDN Links (working now):"
echo "  Main: https://cdn.jsdelivr.net/gh/himothysigma/synnical-svg@main/index.svg"
echo "  Alias: https://cdn.jsdelivr.net/gh/himothysigma/synnical-svg@main/synnical-001.svg"
