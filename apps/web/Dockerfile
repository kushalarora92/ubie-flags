FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install deps
COPY apps/web/package*.json ./
RUN npm install

# Copy source
COPY apps/web/. .

# Build Next.js app
RUN npm run build

# ---- Runtime image ----
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy built app + deps
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package*.json ./

# Next.js default port
EXPOSE 3000

CMD ["npm", "run", "start"]
