#!/bin/bash

# Exit immediately if any step fails
set -e

# Function to handle graceful shutdown on script exit/Ctrl+C
cleanup() {
  echo ""
  echo "🛑 Stopping all containers and cleaning up..."
  docker compose down
  echo "✅ Shutdown complete."
}

# Trap exit/termination signals to trigger cleanups
trap cleanup SIGINT SIGTERM EXIT

echo "🧹 Checking and freeing ports to prevent binding conflicts..."
FRONTEND_PORT_PIDS=$(lsof -t -i:3000 2>/dev/null || true)
if [ ! -z "$FRONTEND_PORT_PIDS" ]; then
  echo "⚡ Stopping existing process on port 3000..."
  echo "$FRONTEND_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi

ADMIN_PORT_PIDS=$(lsof -t -i:3001 2>/dev/null || true)
if [ ! -z "$ADMIN_PORT_PIDS" ]; then
  echo "⚡ Stopping existing process on port 3001..."
  echo "$ADMIN_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi

BRANDB_PORT_PIDS=$(lsof -t -i:3002 2>/dev/null || true)
if [ ! -z "$BRANDB_PORT_PIDS" ]; then
  echo "⚡ Stopping existing process on port 3002..."
  echo "$BRANDB_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi

BRANDC_PORT_PIDS=$(lsof -t -i:3003 2>/dev/null || true)
if [ ! -z "$BRANDC_PORT_PIDS" ]; then
  echo "⚡ Stopping existing process on port 3003..."
  echo "$BRANDC_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi

BRANDD_PORT_PIDS=$(lsof -t -i:3004 2>/dev/null || true)
if [ ! -z "$BRANDD_PORT_PIDS" ]; then
  echo "⚡ Stopping existing process on port 3004..."
  echo "$BRANDD_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi

BRANDE_PORT_PIDS=$(lsof -t -i:3005 2>/dev/null || true)
if [ ! -z "$BRANDE_PORT_PIDS" ]; then
  echo "⚡ Stopping existing process on port 3005..."
  echo "$BRANDE_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi

BACKEND_PORT_PIDS=$(lsof -t -i:8080 2>/dev/null || true)
if [ ! -z "$BACKEND_PORT_PIDS" ]; then
  echo "☕ Stopping existing process on port 8080..."
  echo "$BACKEND_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi


echo "🚀 Starting all services via Docker Compose..."
echo "👉 Tenant Frontend Admin URL: http://localhost:3000"
echo "👉 Storefront URL: http://localhost:3001"
echo "👉 Tenant Backend URL: http://localhost:8080"
echo "💡 Press Ctrl+C to stop all services."
echo ""

docker compose up --build
