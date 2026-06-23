#!/bin/bash

# stop.sh - Stop all Docker containers (Storefronts, Tenant Backend, Tenant Admin, Postgres) and free up ports.

echo "================================================="
echo "🛑  Initiating Safe Shutdown & Port Freeing..."
echo "================================================="

# 1. Stop all Docker containers
echo "🐳 Stopping Docker containers..."
docker compose down --remove-orphans || true

# 2. Terminate local Tenant Frontend Admin process running on port 3000
FRONTEND_PORT_PIDS=$(lsof -t -i:3000 2>/dev/null)
if [ ! -z "$FRONTEND_PORT_PIDS" ]; then
  echo "⚡ Stopping Next.js Tenant Frontend Admin (Port 3000)..."
  echo "$FRONTEND_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi

# 3. Terminate local Storefront process running on port 3001 & 3002
ADMIN_PORT_PIDS=$(lsof -t -i:3001 2>/dev/null)
if [ ! -z "$ADMIN_PORT_PIDS" ]; then
  echo "⚡ Stopping Next.js Storefront (Port 3001)..."
  echo "$ADMIN_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi

BRANDB_PORT_PIDS=$(lsof -t -i:3002 2>/dev/null)
if [ ! -z "$BRANDB_PORT_PIDS" ]; then
  echo "⚡ Stopping Next.js Storefront (Port 3002)..."
  echo "$BRANDB_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi

BRANDC_PORT_PIDS=$(lsof -t -i:3003 2>/dev/null)
if [ ! -z "$BRANDC_PORT_PIDS" ]; then
  echo "⚡ Stopping Next.js Storefront (Port 3003)..."
  echo "$BRANDC_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi

BRANDD_PORT_PIDS=$(lsof -t -i:3004 2>/dev/null)
if [ ! -z "$BRANDD_PORT_PIDS" ]; then
  echo "⚡ Stopping Next.js Storefront (Port 3004)..."
  echo "$BRANDD_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi

BRANDE_PORT_PIDS=$(lsof -t -i:3005 2>/dev/null)
if [ ! -z "$BRANDE_PORT_PIDS" ]; then
  echo "⚡ Stopping Next.js Storefront (Port 3005)..."
  echo "$BRANDE_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi

# 4. Terminate local Tenant Backend process running on port 8080
BACKEND_PORT_PIDS=$(lsof -t -i:8080 2>/dev/null)
if [ ! -z "$BACKEND_PORT_PIDS" ]; then
  echo "☕ Stopping Spring Boot Tenant Backend (Port 8080)..."
  echo "$BACKEND_PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi

echo "================================================="
echo "🎉 Done! All containers stopped and ports are now free!"
echo "================================================="
