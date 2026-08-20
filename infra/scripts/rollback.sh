#!/bin/bash
set -euo pipefail

# ── Rollback Script ─────────────────────────────────────────
# Reverts to the previous release SHA

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DEPLOY_DIR="/opt/mtg-explorer"

RELEASE_FILE="$PROJECT_DIR/.current-release"

if [ ! -f "$RELEASE_FILE" ]; then
    echo "❌ No release file found"
    exit 1
fi

CURRENT_SHA=$(cat "$RELEASE_FILE")
echo "📋 Current release: $CURRENT_SHA"

# Find previous release from git log
PREV_SHA=$(git -C "$PROJECT_DIR" log --oneline -2 --format="%h" | tail -1)

if [ -z "$PREV_SHA" ]; then
    echo "❌ No previous release found"
    exit 1
fi

echo "⏪ Rolling back to: $PREV_SHA"
export RELEASE_SHA=$PREV_SHA
docker compose -f "$PROJECT_DIR/docker-compose.deploy.yml" pull
docker compose -f "$PROJECT_DIR/docker-compose.deploy.yml" up -d --remove-orphans

echo "$PREV_SHA" > "$RELEASE_FILE"
echo "✅ Rollback complete"
