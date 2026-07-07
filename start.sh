#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
PID_FILE="$BACKEND_DIR/.server.pid"

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

echo "Building TypeScript..."
cd "$BACKEND_DIR"
npx tsc
echo ""

# Kill existing server process (PID file or ps-based detection)
PORT="${PORT:-5000}"

if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" &>/dev/null; then
        echo "Killing previous server (PID: $OLD_PID)..."
        kill "$OLD_PID" 2>/dev/null || true
        sleep 2
    fi
    rm -f "$PID_FILE"
fi

# Also find any leftover node dist/server processes via ps
OLD_PIDS=$(ps aux 2>/dev/null | grep "[d]ist/server.js" | awk '{print $2}')
if [ -n "$OLD_PIDS" ]; then
    echo "Killing leftover server processes: $OLD_PIDS"
    kill $OLD_PIDS 2>/dev/null || true
    sleep 1
fi

echo ""
echo "Starting server on port $PORT..."
echo ""

# Start server in background, save PID
cd "$BACKEND_DIR"
node dist/server.js &
SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

# Wait briefly and check
sleep 2
if ! ps -p $SERVER_PID &>/dev/null; then
    echo "ERROR: Server failed to start. Check the log above."
    rm -f "$PID_FILE"
    exit 1
fi

echo ""
echo "Server started (PID: $SERVER_PID)"
echo "Listening on http://localhost:$PORT"
echo ""
echo "To stop: kill $SERVER_PID"
echo "To view logs: check console output above"

# Cleanup on exit
cleanup() {
    rm -f "$PID_FILE"
}
trap cleanup EXIT INT TERM

# Keep the script running so logs are visible
wait $SERVER_PID
