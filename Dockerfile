# ==============================================================================
# Multi-Stage Dockerfile for ChatSpace (Full-Stack React + Node.js + Socket.IO)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend (Vite + React)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Install Backend Dependencies
# ------------------------------------------------------------------------------
FROM node:20-alpine AS server-deps
WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --omit=dev

# ------------------------------------------------------------------------------
# Stage 3: Production Runner
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Set default production environment variables
ENV NODE_ENV=production \
    PORT=5000

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy backend dependencies and source code
COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY server ./server

# Ensure upload directory exists and has proper permissions
RUN mkdir -p server/uploads && chown -R node:node /app

# Copy built frontend assets
COPY --from=client-builder --chown=node:node /app/client/dist ./client/dist

# Switch to non-root user
USER node

# Expose port (default: 5000)
EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start backend server (serves API, WebSockets, and frontend static assets)
CMD ["node", "server/server.js"]
