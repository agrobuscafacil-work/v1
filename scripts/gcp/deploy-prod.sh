#!/usr/bin/env bash
# ============================================================
# AgroBuscaFácil - Deploy de Produção no GCP (Free Tier)
# Usa ADC (Application Default Credentials) da VM - sem JSON key
# Uso: bash scripts/gcp/deploy-prod.sh
# ============================================================
set -euo pipefail

# Configurações
REPO_URL="${REPO_URL:-https://github.com/SEU_USUARIO/SEU_REPO.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-/opt/agrobuscafacil}"
GCS_EMAIL="${GCS_EMAIL:-admin@agrobuscafacil.com.br}"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

step() { echo -e "\n${GREEN}==>${NC} $*"; }
warn() { echo -e "${YELLOW}!!${NC} $*"; }
err()  { echo -e "${RED}!! ERRO:${NC} $*" >&2; exit 1; }

# ============================================================
# 0. Verificações iniciais
# ============================================================
step "Verificando pré-requisitos"
command -v docker >/dev/null     || err "Docker não instalado"
command -v docker compose >/dev/null || err "Docker Compose não instalado"
command -v gcloud >/dev/null     || err "gcloud não instalado"
command -v certbot >/dev/null    || err "certbot não instalado"

[[ -f "$APP_DIR/.env.gcp" ]] || err "Falta $APP_DIR/.env.gcp (copie de backend/.env.gcp.example e edite)"

# Carrega variáveis do .env.gcp
set -a; source "$APP_DIR/.env.gcp"; set +a

# Valida variáveis obrigatórias (SEM credentials.json - usa ADC)
required_vars=(
  "POSTGRES_PASSWORD" "REDIS_PASSWORD"
  "JWT_SECRET" "JWT_REFRESH_SECRET"
  "GCS_PROJECT_ID" "GCS_BUCKET" "GCS_PRIVATE_BUCKET"
  "CORS_ORIGIN" "GCS_PUBLIC_BASE_URL"
)
for v in "${required_vars[@]}"; do
  [[ -n "${!v:-}" ]] || err "Variável $v não definida no .env.gcp"
done

# Valida segredos fortes
for v in JWT_SECRET JWT_REFRESH_SECRET POSTGRES_PASSWORD REDIS_PASSWORD; do
  val="${!v}"
  if [[ ${#val} -lt 32 || "$val" =~ (change-me|troque-|your-super-secret) ]]; then
    err "$v parece placeholder ou fraco – gere segredo forte (openssl rand -base64 48) e edite .env.gcp"
  fi
done

# Verifica ADC (Application Default Credentials)
step "Verificando ADC (Application Default Credentials)"
if ! gcloud auth application-default print-access-token >/dev/null 2>&1; then
  err "ADC não configurado. Execute: gcloud auth application-default login
  Ou certifique-se que a VM tem Service Account com escopo cloud-platform."
fi

# ============================================================
# 1. Atualiza repositório
# ============================================================
step "Atualizando repositório ($BRANCH)"
cd "$APP_DIR"
if [[ ! -d .git ]]; then
  git clone "$REPO_URL" .
else
  git fetch origin
  git checkout "$BRANCH"
  git pull --ff-only || true
fi

# ============================================================
# 2. Buckets GCS (usa ADC via gsutil)
# ============================================================
step "Garantindo buckets GCS (via ADC)"
gcloud config set project "$GCS_PROJECT_ID" >/dev/null

# Bucket público (imagens produtos)
gsutil mb -l us-central1 -b on "gs://$GCS_BUCKET" 2>/dev/null || true
gsutil iam ch allUsers:objectViewer "gs://$GCS_BUCKET" 2>/dev/null || true
gsutil web set -m index.html -e 404.html "gs://$GCS_BUCKET" 2>/dev/null || true

# Bucket privado (anexos suporte)
gsutil mb -l us-central1 -b on "gs://$GCS_PRIVATE_BUCKET" 2>/dev/null || true
gsutil iam ch -d allUsers:objectViewer "gs://$GCS_PRIVATE_BUCKET" 2>/dev/null || true
gsutil iam ch -d allAuthenticatedUsers:objectViewer "gs://$GCS_PRIVATE_BUCKET" 2>/dev/null || true

# Migra anexos antigos se existirem no bucket público
if gsutil -q stat "gs://$GCS_BUCKET/support/**" 2>/dev/null; then
  step "Migrando anexos de suporte do bucket público para o privado"
  gsutil -m mv "gs://$GCS_BUCKET/support" "gs://$GCS_PRIVATE_BUCKET/support"
fi

# ============================================================
# 3. Certificados SSL (Let's Encrypt)
# ============================================================
step "Emitindo/renovando certificado Let's Encrypt para api.agrobuscafacil.com.br"
mkdir -p "$APP_DIR/docker/nginx/ssl" "$APP_DIR/docker/nginx/certbot/www"

step "Verificando DNS para api.agrobuscafacil.com.br..."
CURRENT_IP=$(dig +short api.agrobuscafacil.com.br | tail -1)
VM_IP=$(curl -s ifconfig.me || curl -s icanhazip.com)
if [[ "$CURRENT_IP" != "$VM_IP" ]]; then
  warn "DNS de api.agrobuscafacil.com.br ($CURRENT_IP) não aponta para esta VM ($VM_IP)"
  warn "Configure o DNS A record antes de continuar. Pressione Enter quando pronto..."
  read -r
fi

docker compose -f "$APP_DIR/docker-compose.gcp.yml" stop nginx 2>/dev/null || true

docker run --rm -p 80:80 \
  -v "$APP_DIR/docker/nginx/ssl:/etc/letsencrypt" \
  -v "$APP_DIR/docker/nginx/certbot/www:/var/www/certbot" \
  certbot/certbot certonly --standalone \
  -d api.agrobuscafacil.com.br \
  --email "$GCS_EMAIL" --agree-tos --no-eff-email --rsa-key-size 4096

cp "$APP_DIR/docker/nginx/ssl/live/api.agrobuscafacil.com.br/fullchain.pem" "$APP_DIR/docker/nginx/ssl/fullchain.pem"
cp "$APP_DIR/docker/nginx/ssl/live/api.agrobuscafacil.com.br/privkey.pem"  "$APP_DIR/docker/nginx/ssl/privkey.pem"

# ============================================================
# 4. Build & Deploy Backend
# ============================================================
step "Build da imagem do backend"
docker compose -f "$APP_DIR/docker-compose.gcp.yml" build --pull backend

step "Subindo Postgres, Redis e Nginx"
docker compose -f "$APP_DIR/docker-compose.gcp.yml" up -d postgres redis nginx

step "Rodando migrations do Prisma"
docker compose -f "$APP_DIR/docker-compose.gcp.yml" run --rm --no-deps backend npx prisma migrate deploy

step "Subindo backend"
docker compose -f "$APP_DIR/docker-compose.gcp.yml" up -d --no-deps backend
docker compose -f "$APP_DIR/docker-compose.gcp.yml" restart nginx

# ============================================================
# 5. Health Checks
# ============================================================
step "Validando health checks"
sleep 10

check_url() {
  local url=$1 name=$2
  if curl -fsS -o /dev/null -w "%{http_code}" "$url" | grep -q '^2'; then
    echo "✅ $name OK"
    return 0
  else
    echo "❌ $name FALHOU ($url)"
    return 1
  fi
}

check_url "https://api.agrobuscafacil.com.br/api/v1" "API" || err "API não respondeu 2xx"

# Teste rápido de auth
step "Teste de autenticação (login + refresh)"
curl -sfS -c /tmp/cookies.txt -X POST "https://api.agrobuscafacil.com.br/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senhaerrada"}' >/dev/null || true

if grep -q 'HttpOnly.*Secure.*SameSite=None' /tmp/cookies.txt 2>/dev/null; then
  echo "✅ Cookies de autenticação OK"
else
  warn "Cookies de autenticação não detectados (pode ser usuário inexistente – verifique manualmente)"
fi

# ============================================================
# 6. Backup Automático (cron)
# ============================================================
step "Instalando backup diário (3h da manhã)"
mkdir -p "$APP_DIR/scripts"
cp scripts/gcp/backup-db.sh "$APP_DIR/scripts/backup-db.sh" 2>/dev/null || true
chmod +x "$APP_DIR/scripts/backup-db.sh"

( crontab -l 2>/dev/null | grep -v "backup-db.sh" ; echo "0 3 * * * bash $APP_DIR/scripts/backup-db.sh >> /var/log/agrobusca-backup.log 2>&1" ) | crontab -

# ============================================================
# Sucesso
# ============================================================
echo -e "\n${GREEN}============================================================${NC}"
echo -e "${GREEN}🎉 DEPLOY CONCLUÍDO COM SUCESSO (ADC)${NC}"
echo -e "${GREEN}============================================================${NC}"
echo "API:      https://api.agrobuscafacil.com.br"
echo "Frontend: https://agrobuscafacil.vercel.app (deploy via Vercel)"
echo "Swagger:  https://api.agrobuscafacil.com.br/docs (desabilitado em prod)"
echo -e "${GREEN}============================================================${NC}"
echo -e "\nPróximos passos:"
echo "  1. Deploy do frontend na Vercel (git push origin main)"
echo "  2. Configure monitoramento (Uptime checks, alertas)"
echo "  3. Teste backup: bash $APP_DIR/scripts/backup-db.sh"
echo "  4. Verifique logs: docker compose -f docker-compose.gcp.yml logs -f backend"