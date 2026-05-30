FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/ .
RUN npx prisma generate
RUN npm run build

# Imagem final — apenas o necessário para produção
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY backend/prisma ./prisma

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy && ADMIN_BOOTSTRAP_ON_START=true node prisma/bootstrap-admin.cjs; node dist/server.js"]
