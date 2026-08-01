#!/bin/bash

set -e

echo "🚀 Iniciando deploy do AgroBuscaFácil v2..."

ENV=${1:-production}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENV" = "development" ]; then
    COMPOSE_FILE="docker-compose.override.yml"
fi

echo "📦 Parando containers existentes..."
docker-compose -f $COMPOSE_FILE down --remove-orphans

echo "🏗️  Construindo imagens..."
docker-compose -f $COMPOSE_FILE build --no-cache

echo "🔄 Iniciando serviços..."
docker-compose -f $COMPOSE_FILE up -d

echo "⏳ Aguardando PostgreSQL ficar pronto..."
until docker-compose -f $COMPOSE_FILE exec -T postgres pg_isready -U agrobusca
do
    sleep 2
done

echo "🗄️  Executando migrações..."
docker-compose -f $COMPOSE_FILE exec -T backend npx prisma migrate deploy

echo "🌱 Executando seeds..."
docker-compose -f $COMPOSE_FILE exec -T backend npx prisma db seed

echo "🧹 Limpando imagens não utilizadas..."
docker image prune -f

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Frontend: http://localhost:3000"
echo "🌐 Backend: http://localhost:4000"
echo "📖 Swagger: http://localhost:4000/docs"
