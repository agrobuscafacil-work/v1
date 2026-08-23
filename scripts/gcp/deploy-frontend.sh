#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Deploy do FRONTEND (Next.js) no Google Cloud Run.
# Execute NA SUA MÁQUINA (ou Cloud Shell) com o gcloud autenticado:
#   gcloud auth login
#   bash scripts/gcp/deploy-frontend.sh
# ============================================================

PROJECT_ID="${PROJECT_ID:?Defina PROJECT_ID, ex.: SEU-PROJETO-GCP}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-agrobuscafacil-frontend}"
API_URL="${API_URL:-https://api.agrobuscafacil.com.br/api/v1}"
SOCKET_URL="${SOCKET_URL:-https://api.agrobuscafacil.com.br}"
APP_NAME="${APP_NAME:-AgroBuscaFacil}"
APP_URL="${APP_URL:-https://www.agrobuscafacil.com.br}"

cd "$(dirname "$0")"

step() { echo; echo "==> $*"; }

step "Definindo projeto $PROJECT_ID..."
gcloud config set project "$PROJECT_ID" >/dev/null

step "Buildando e publicando imagem no Container Registry..."
gcloud builds submit ../frontend \
  --config cloudbuild.frontend.yaml \
  --substitutions "_NEXT_PUBLIC_API_URL=$API_URL,_NEXT_PUBLIC_SOCKET_URL=$SOCKET_URL,_NEXT_PUBLIC_APP_NAME=$APP_NAME,_NEXT_PUBLIC_APP_URL=$APP_URL"

step "Deploy no Cloud Run ($SERVICE)..."
gcloud run deploy "$SERVICE" \
  --image "gcr.io/$PROJECT_ID/agrobuscafacil-frontend:latest" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars "NEXT_PUBLIC_API_URL=$API_URL,NEXT_PUBLIC_SOCKET_URL=$SOCKET_URL,NEXT_PUBLIC_APP_NAME=$APP_NAME,NEXT_PUBLIC_APP_URL=$APP_URL"

step "Pronto. A URL gerada do serviço:"
gcloud run services describe "$SERVICE" --region "$REGION" --format 'value(status.url)'

echo
echo "Para apontar www.agrobuscafacil.com.br para o Cloud Run:"
echo "  gcloud run domain-mappings create --service $SERVICE --region $REGION --domain www.agrobuscafacil.com.br"
echo "Depois crie no DNS: CNAME www -> ghs.googlehosted.com"
