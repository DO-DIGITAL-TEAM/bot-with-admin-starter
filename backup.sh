#!/bin/bash

set -a
source .env
set +a

DB_CONTAINER_NAME="${PROJECT_NAME}_database"
UPLOADS_DIR="$PWD/back/uploads"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
UPLOADS_BACKUP_FILE="$BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz"

backup_postgres() {
    echo "Creating Postgres backup..."
    docker exec "$DB_CONTAINER_NAME" pg_dump -U "$DB_USERNAME" -Fc "$DB_NAME" > "$DB_BACKUP_FILE"
    if [ $? -eq 0 ]; then
        echo "Database backup saved to $DB_BACKUP_FILE"
    else
        echo "Failed to create database backup"
        exit 1
    fi
}

backup_uploads() {
    echo "Creating uploads backup..."
    tar -czf "$UPLOADS_BACKUP_FILE" -C "$UPLOADS_DIR" .
    if [ $? -eq 0 ]; then
        echo "Uploads backup saved to $UPLOADS_BACKUP_FILE"
    else
        echo "Failed to create uploads backup"
        exit 1
    fi
}

send_backup_to_telegram() {
    local FILE_PATH="$1"
    echo "Sending $FILE_PATH to Telegram..."
    curl -s -F "chat_id=$BACKUP_TELEGRAM_CHAT_ID" -F "document=@$FILE_PATH" "https://api.telegram.org/bot$BACKUP_TELEGRAM_BOT_TOKEN/sendDocument" > /dev/null
    if [ $? -eq 0 ]; then
        echo "Backup $FILE_PATH successfully sent to Telegram"
    else
        echo "Failed to send backup to Telegram"
        exit 1
    fi
}

backup_postgres
send_backup_to_telegram "$DB_BACKUP_FILE"

backup_uploads
send_backup_to_telegram "$UPLOADS_BACKUP_FILE"
