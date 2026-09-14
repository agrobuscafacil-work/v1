#!/bin/bash
# Script para rodar migration Prisma no GCP Compute Engine
# Execute: chmod +x run-migration.sh && ./run-migration.sh

set -e  # Para o script se houver erro

echo "=========================================="
echo "  AgroBuscaFácil - Migration Prisma"
echo "=========================================="

# Verifica se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "ERRO: Execute este script dentro da pasta 'backend'"
    echo "Exemplo: cd /opt/agrobusca/backend && ./run-migration.sh"
    exit 1
fi

# Carrega variáveis de ambiente do .env se existir
if [ -f ".env" ]; then
    echo "Carregando .env..."
    export $(grep -v '^#' .env | xargs)
elif [ -f ".env.local" ]; then
    echo "Carregando .env.local..."
    export $(grep -v '^#' .env.local | xargs)
fi

# Verifica DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo ""
    echo "ERRO: DATABASE_URL não está definida!"
    echo ""
    echo "Defina a variável antes de rodar:"
    echo "  export DATABASE_URL=\"postgresql://user:pass@/dbname?host=/cloudsql/PROJECT:REGION:INSTANCE\""
    echo ""
    echo "Ou crie um arquivo .env na pasta backend com:"
    echo "  DATABASE_URL=postgresql://user:pass@/dbname?host=/cloudsql/PROJECT:REGION:INSTANCE"
    exit 1
fi

echo "DATABASE_URL configurada: ${DATABASE_URL:0:50}..."
echo ""

# Para serviços se estiverem rodando
echo "Parando serviços (se houver)..."
sudo systemctl stop agrobusca-backend 2>/dev/null || true
pm2 stop agrobusca-backend 2>/dev/null || true
docker stop agrobusca-backend 2>/dev/null || true

# Instala dependências se node_modules não existir
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm ci
fi

# Gera Prisma Client
echo "Gerando Prisma Client..."
npx prisma generate

# Roda migration
echo "Rodando migration..."
npx prisma migrate deploy

echo ""
echo "=========================================="
echo "  Migration concluída com sucesso!"
echo "=========================================="
echo ""

# Reinicia serviços
echo "Reiniciando serviços..."
sudo systemctl start agrobusca-backend 2>/dev/null || true
pm2 start agrobusca-backend 2>/dev/null || true
docker start agrobusca-backend 2>/dev/null || true

echo ""
echo "Verifique os logs:"
echo "  sudo journalctl -u agrobusca-backend -f"
echo "  pm2 logs agrobusca-backend"
echo "  docker logs -f agrobusca-backend"