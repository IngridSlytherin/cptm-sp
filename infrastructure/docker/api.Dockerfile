FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

FROM deps AS builder
COPY . .
RUN npm run prisma:generate && npm run build --workspace=@rail-status/api && npm prune --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl && addgroup --system --gid 1001 api && adduser --system --uid 1001 api
COPY --from=builder --chown=api:api /app/node_modules ./node_modules
COPY --from=builder --chown=api:api /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=api:api /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=api:api /app/apps/api/package.json ./apps/api/package.json
USER api
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
