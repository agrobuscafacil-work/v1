#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Backup diário do PostgreSQL para o Google Cloud Storage.
# Rode manualmente ou via cron (o deploy-vm.sh já instala o cron).
# Requer BACKUP_BUCKET e GCS_PROJECT_ID no .env.gcp.
# ============================================================

APP_DIR="${APP_DIR:-/opt/agrobuscafacil}"
BACKUP_DIR="${BACKUP_DIR:-$APP_DIR/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

cd "$APP_DIR"

if [ -f .env.gcp ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.gcp
  set +a
fi

: "${BACKUP_BUCKET:?Defina BACKUP_BUCKET no .env.gcp}"
: "${GCS_PROJECT_ID:?Defina GCS_PROJECT_ID no .env.gcp}"

DATE=$(date +%F_%H%M)
LOCAL_FILE="$BACKUP_DIR/agrobuscafacil-$DATE.sql.gz"
REMOTE_NAME="backend/agrobuscafacil-$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "==> Dump do Postgres..."
docker compose -f docker-compose.gcp.yml exec -T postgres \
  pg_dump -U agrobusca -d agrobuscafacil | gzip -9 > "$LOCAL_FILE"

echo "==> Enviando para gs://$BACKUP_BUCKET/$REMOTE_NAME ..."
docker run --rm \
  -v "$BACKUP_DIR":/backup \
  -v "$HOME/.config/gcloud:/root/.config/gcloud" \
  -v "$APP_DIR/docker/gcp/credentials.json:/tmp/credentials.json:ro" \
  gcr.io/google.com/cloudsdktool/cloud-sdk:latest \
  sh -c "gcloud auth activate-service-account --key-file=/tmp/credentials.json --project=${GCS_PROJECT_ID} >/dev/null 2>&1; gsutil cp /backup/$(basename "$LOCAL_FILE") gs://${BACKUP_BUCKET}/${REMOTE_NAME}"

echo "==> Limpando backups locais com mais de ${RETENTION_DAYS} dias..."
find "$BACKUP_DIR" -name 'agrobuscafacil-*.sql.gz' -mtime +"$RETENTION_DAYS" -delete

echo "Backup OK: gs://$BACKUP_BUCKET/$REMOTE_NAME"
