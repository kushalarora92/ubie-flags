FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install deps
COPY apps/api/package*.json ./
RUN npm install

# Copy source
COPY apps/api/. .

# Build NestJS app
RUN npm run build

# ---- Runtime image ----
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Only copy what we need to run
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

# Expose Nest port
EXPOSE 3000

CMD ["node", "dist/main.js"]
