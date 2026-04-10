# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (all, including dev) before copying source
# so that this layer is cached as long as package files don't change
COPY package*.json ./
RUN npm ci

# Copy source and compile TypeScript + copy static assets
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Stage 2: production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Create logs directory and hand ownership to the non-root node user
# before switching away from root
RUN mkdir -p logs && chown -R node:node /app

# node:alpine already ships with a non-root 'node' user (uid 1000)
USER node

EXPOSE 4000

CMD ["node", "dist/server.js"]
