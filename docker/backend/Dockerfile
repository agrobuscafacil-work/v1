FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG DATABASE_URL=postgresql://agrobusca:agrobusca123@localhost:5432/agrobuscafacil?schema=public
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

RUN mkdir -p /app/uploads && \
    chown -R nestjs:nodejs /app/uploads

USER nestjs

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "dist/main"]
