#!/bin/bash

set -e

BACKUP_DIR="/backups/postgres"
DB_NAME="agrobuscafacil"
DB_USER="agrobusca"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

echo "📦 Iniciando backup do banco de dados..."
echo "📁 Arquivo: $BACKUP_FILE"

mkdir -p $BACKUP_DIR

docker-compose exec -T postgres pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

echo "✅ Backup concluído: $BACKUP_FILE"

echo "🧹 Removendo backups antigos (mais de $RETENTION_DAYS dias)..."
find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "📊 Backup atual: $(ls -lh $BACKUP_FILE | awk '{print $5}')"
echo "📊 Total de backups: $(ls $BACKUP_DIR/*.sql.gz 2>/dev/null | wc -l)"
