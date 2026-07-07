#!/bin/bash
# Automate the backend deployment process from local to VPS
set -e

# Configurations
VPS_IP="64.227.150.88"
VPS_PATH="/root/deploy_vps"

# Change directory to the deploy_vps folder
cd "$(dirname "$0")"

echo "--------------------------------------------------"
echo "🚀 Starting Backend Deployment to VPS ($VPS_IP)"
echo "--------------------------------------------------"

# 1. Build and Export Backend image locally
echo "📦 Step 1: Building and exporting Backend image locally..."
./build_and_export.sh

# 2. Transfer configuration files to VPS
echo "📤 Step 2: Uploading Caddyfile and docker-compose.yml to VPS..."
scp Caddyfile docker-compose.yml root@$VPS_IP:$VPS_PATH/

# 3. Transfer the built backend image tarball to VPS
echo "📤 Step 3: Uploading Backend Docker image..."
scp tenant-backend.tar.gz root@$VPS_IP:$VPS_PATH/

# 4. SSH into VPS, load image, start containers, and clean up tarball
echo "⚙️ Step 4: Loading image and restarting containers on VPS..."
ssh root@$VPS_IP << EOF
    cd $VPS_PATH
    
    echo "⚡ Loading backend image..."
    docker load < tenant-backend.tar.gz
    
    echo "🔄 Restarting containers..."
    docker compose down
    docker rm -f db_postgres software_tenant_backend software_caddy || true
    docker compose up -d
    
    echo "🧹 Cleaning up tar file on VPS..."
    rm -f tenant-backend.tar.gz
    
    echo "✅ Backend and Database restarted successfully!"
EOF

echo "--------------------------------------------------"
echo "🎉 Deployment Completed Successfully!"
echo "--------------------------------------------------"
