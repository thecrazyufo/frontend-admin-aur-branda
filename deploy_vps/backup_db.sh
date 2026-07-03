#!/bin/bash

# Database Backup Script for Multi-Tenant Software Platform
# It performs a compressed pg_dump of the dockerized PostgreSQL database
# and purges backup files older than 7 days.

# Configurations
BACKUP_DIR="/root/backups"
DB_CONTAINER_NAME="db_postgres"
DB_USER="admin"
DB_NAME="software_platform"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="${BACKUP_DIR}/db_backup_${DATE}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup.log"

# 1. Create backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Log start time
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Starting database backup process..." >> "$LOG_FILE"

# 2. Run pg_dump inside the docker container, compress on the fly, and save on the host VPS
docker exec -t "$DB_CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"

# 3. Check if pg_dump succeeded
if [ ${PIPESTATUS[0]} -eq 0 ] && [ -s "$BACKUP_FILE" ]; then
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] Success: Backup saved to $BACKUP_FILE" >> "$LOG_FILE"
    
    # 4. Clean up backups older than 7 days
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] Purging backups older than 7 days..." >> "$LOG_FILE"
    find "$BACKUP_DIR" -type f -name "db_backup_*.sql.gz" -mtime +7 -exec rm -f {} \; >> "$LOG_FILE" 2>&1
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] Backup cleanup complete." >> "$LOG_FILE"
else
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ERROR: Database backup failed!" >> "$LOG_FILE"
    # Clean up empty backup file if it failed
    rm -f "$BACKUP_FILE"
fi

echo "--------------------------------------------------" >> "$LOG_FILE"
