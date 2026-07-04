#!/bin/bash

# Exit immediately if any step fails
set -e

echo "🛑 Stopping all Prism Migration containers..."
docker compose down

echo "🚀 Starting all containers in background (detached)..."
docker compose up -d

echo ""
echo "✅ All containers stopped and started successfully!"
echo "👉 Tenant Frontend Admin: http://localhost:3000"
echo "👉 Storefront: http://localhost:3001"
echo "👉 Tenant Backend: http://localhost:8080"
