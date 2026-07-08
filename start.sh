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

APEXBYTE_PORT_PIDS=$(lsof -t -i:3002 2>/dev/null || true)
if [ ! -z "$APEXBYTE_PORT_PIDS" ]; then
  echo "⚡ Stopping existing process on port 3002..."
  echo "$APEXBYTE_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi



BACKEND_PORT_PIDS=$(lsof -t -i:8080 2>/dev/null || true)
if [ ! -z "$BACKEND_PORT_PIDS" ]; then
  echo "☕ Stopping existing process on port 8080..."
  echo "$BACKEND_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi


echo "🚀 Starting all services via Docker Compose..."
echo "👉 Tenant Frontend Admin URL: http://localhost:3000"
echo "👉 Storefront Brand A: http://localhost:3001"
echo "👉 Storefront ApexByte: http://localhost:3002"
echo "👉 Tenant Backend URL: http://localhost:8080"
echo "💡 Press Ctrl+C to stop all services."
echo ""

docker compose up --build
