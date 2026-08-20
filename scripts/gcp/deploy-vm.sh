#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Deploy do BACKEND no Google Cloud Compute Engine (e2-micro, sempre-grátis)
# Rode DENTRO da VM (botão SSH no console da GCP):
#   FIRST_SETUP=1 bash scripts/gcp/deploy-vm.sh     # primeira vez
#   bash scripts/gcp/deploy-vm.sh                   # deploys seguintes
# ============================================================

REPO_URL="${REPO_URL:?Defina REPO_URL, ex.: https://github.com/SEU-USER/SEU-REPO.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-/opt/agrobuscafacil}"
GCS_EMAIL="${GCS_EMAIL:-admin@agrobuscafacil.com.br}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

step() { echo; echo "==> $*"; }

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    echo "Docker já instalado."
    return
  fi
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo "Docker instalado. Faça logout/login na VM e reexecute o script."
  exit 0
}

prepare_repo() {
  sudo mkdir -p "$APP_DIR"
  sudo chown -R "$USER":"$USER" "$APP_DIR"
  cd "$APP_DIR"

  if [ ! -d .git ]; then
    step "Clonando repositório..."
    git clone "$REPO_URL" .
  fi
  git fetch origin
  git checkout "$BRANCH"
  git pull --ff-only || echo "Sem alterações novas."

  if [ ! -f .env.gcp ]; then
    cp backend/.env.gcp.example .env.gcp
    echo
    echo "Edite $APP_DIR/.env.gcp com os segredos (JWT, senhas, GCS) e rode novamente."
    exit 0
  fi

  set -a
  # shellcheck disable=SC1091
  source .env.gcp
  set +a

  if [ -n "${GCS_BUCKET:-}" ] && [ ! -f "$APP_DIR/docker/gcp/credentials.json" ]; then
    echo "AVISO: GCS_BUCKET definido, mas docker/gcp/credentials.json não existe."
    echo "Crie uma service account com 'roles/storage.objectAdmin' e salve a chave JSON"
    echo "em $APP_DIR/docker/gcp/credentials.json. (Na VM do GCE a ADC também funciona.)"
  fi
}

setup_ssl() {
  mkdir -p "$APP_DIR/docker/nginx/ssl" "$APP_DIR/docker/nginx/certbot/www"
  if [ -f "$APP_DIR/docker/nginx/ssl/fullchain.pem" ]; then
    echo "Certificados SSL já existem."
    return
  fi
  step "Emitindo certificado Let's Encrypt para api.agrobuscafacil.com.br (standalone)..."
  docker compose -f docker-compose.gcp.yml stop nginx 2>/dev/null || true
  docker run --rm -p 80:80 \
    -v "$APP_DIR/docker/nginx/ssl:/etc/letsencrypt" \
    certbot/certbot certonly --standalone \
    -d api.agrobuscafacil.com.br \
    --email "$GCS_EMAIL" --agree-tos --no-eff-email --rsa-key-size 4096
  cp "$APP_DIR/docker/nginx/ssl/live/api.agrobuscafacil.com.br/fullchain.pem" \
     "$APP_DIR/docker/nginx/ssl/fullchain.pem"
  cp "$APP_DIR/docker/nginx/ssl/live/api.agrobuscafacil.com.br/privkey.pem" \
     "$APP_DIR/docker/nginx/ssl/privkey.pem"
}

deploy() {
  step "Buildando imagem do backend..."
  docker compose -f docker-compose.gcp.yml build --pull backend

  step "Subindo postgres, redis e nginx..."
  docker compose -f docker-compose.gcp.yml up -d postgres redis nginx

  step "Rodando migrations do Prisma..."
  docker compose -f docker-compose.gcp.yml run --rm --no-deps backend npx prisma migrate deploy

  step "Subindo o backend..."
  docker compose -f docker-compose.gcp.yml up -d --no-deps backend
  docker compose -f docker-compose.gcp.yml restart nginx
}

install_backup_cron() {
  step "Instalando backup diário (3h da manhã)..."
  mkdir -p "$APP_DIR/scripts"
  cp scripts/gcp/backup-db.sh "$APP_DIR/scripts/backup-db.sh" 2>/dev/null || true
  chmod +x "$APP_DIR/scripts/backup-db.sh"
  ( crontab -l 2>/dev/null | grep -v "backup-db.sh" ; echo "0 3 * * * bash $APP_DIR/scripts/backup-db.sh >> /var/log/agrobusca-backup.log 2>&1" ) | crontab -
}

install_docker
prepare_repo
setup_ssl
deploy
install_backup_cron

echo
echo "Pronto! Backend em https://api.agrobuscafacil.com.br"
echo "Swagger em https://api.agrobuscafacil.com.br/docs"
