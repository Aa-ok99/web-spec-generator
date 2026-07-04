#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo "=========================================="
echo "  Web Spec Generator Pro - Server"
echo "=========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    exit 1
fi

# Check .env
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "WARNING: No .env file found."
    echo "Creating from template..."
    cat > "$BACKEND_DIR/.env" << EOF
PORT=5000
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
RATE_LIMIT_MAX=10
EOF
    echo "Created $BACKEND_DIR/.env"
    echo "Please edit it and set your OPENROUTER_API_KEY"
    echo ""
fi

# Install deps if needed
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo "Installing dependencies..."
    cd "$BACKEND_DIR"
    npm install
    cd "$SCRIPT_DIR"
    echo ""
fi

echo "Starting server..."
echo ""
cd "$BACKEND_DIR"
exec node server.js
