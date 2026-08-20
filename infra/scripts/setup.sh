#!/bin/bash
set -euo pipefail

# ── MTG Explorer Setup Script ───────────────────────────────
# Run once on a fresh server to provision the service

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🃏 MTG Explorer Setup"
echo "====================="

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Install Docker first."
    exit 1
fi

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose not found."
    exit 1
fi

# Create deployment directory
DEPLOY_DIR="/opt/mtg-explorer"
sudo mkdir -p "$DEPLOY_DIR"
sudo cp "$PROJECT_DIR"/.env.production "$DEPLOY_DIR/.env" 2>/dev/null || true

echo "📋 Environment file:"
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    echo "  Creating from example..."
    sudo cp "$PROJECT_DIR/.env.production.example" "$DEPLOY_DIR/.env"
    echo "  ⚠️  Edit $DEPLOY_DIR/.env with your secrets!"
fi

echo "✅ Setup complete"
echo "   Deploy dir: $DEPLOY_DIR"
echo "   Next: Configure Caddy for TLS routing"
