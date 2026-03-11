#!/bin/bash
# Docker entrypoint script - starts both Nginx (frontend) and FastAPI (backend)

set -e  # Exit on error

# Default API URL if not provided
API_URL="${API_URL:-http://localhost:8000}"

# Replace placeholder in frontend config if it exists
if [ -f "/usr/share/nginx/html/config.js" ]; then
  sed -i "s|'\${API_URL}'|'${API_URL}'|g" /usr/share/nginx/html/config.js
fi

# Test Nginx configuration
echo "Testing Nginx configuration..."
nginx -t || { echo "Nginx configuration test failed!"; exit 1; }

# Debug: Check nginx config loading
echo "Checking loaded nginx configuration..."
nginx -T 2>&1 | head -20

# Function to handle signals
cleanup() {
  echo "Shutting down..."
  kill $NGINX_PID $UVICORN_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGTERM SIGINT

# Start Nginx (NOT in daemon mode, so it blocks)
echo "Starting Nginx on port 80..."
nginx -g "daemon off;" &
NGINX_PID=$!
echo "Nginx started (PID: $NGINX_PID)"

# Start FastAPI backend
echo "Starting FastAPI backend on port 8000..."
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8000 &
UVICORN_PID=$!
echo "FastAPI started (PID: $UVICORN_PID)"

# Wait for both processes
wait
