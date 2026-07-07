#!/bin/bash
# Helper script to build and export Backend Docker image locally
# to be transferred and loaded on the VPS.
set -e

# Change directory to script's location
cd "$(dirname "$0")"

echo "☕ Building backend Docker image..."
docker build --platform linux/amd64 -t tenant-backend:latest ../Tenant_Backend
echo "💾 Exporting backend image to tenant-backend.tar.gz (compressed)..."
docker save tenant-backend:latest | gzip > tenant-backend.tar.gz

echo "✅ Backend image built and saved successfully under deploy_vps/"
echo "Now you can commit, push to GitHub, pull on your VPS, and load the backend tar file."
