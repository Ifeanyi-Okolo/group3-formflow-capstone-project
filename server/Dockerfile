# ==========================
# Stage 1 - Install Dependencies
# ==========================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy application source
COPY . .

# ==========================
# Stage 2 - Production Image
# ==========================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Build arguments
ARG VERSION=dev
ARG BUILD_DATE=unknown

# Environment variables
ENV NODE_ENV=production \
    APP_VERSION=$VERSION \
    BUILD_DATE=$BUILD_DATE \
    PORT=3000 \
    MONGO_URI=mongodb://mongodb:27017/mydatabase

# Copy application from builder
COPY --from=builder /app /app

# Create a non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s \
             --timeout=5s \
             --start-period=10s \
             --retries=3 \
CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "server.js"]