# Multi-stage production build for INDO CHINESE Restaurant Fullstack App
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
COPY --from=builder /app/src/assets ./src/assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/index.html ./index.html

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
