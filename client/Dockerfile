# ==========================
# Stage 1 - Build
# ==========================
FROM node:24-alpine AS builder

WORKDIR /app

# Build arguments
ARG VITE_BASE_URL=/api/admin
ENV VITE_BASE_URL=$VITE_BASE_URL

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source and build
COPY . .
RUN npm run build

# ==========================
# Stage 2 - Serve with nginx
# ==========================
FROM nginx:alpine

# Build arguments
ARG VERSION=dev
ARG BUILD_DATE=unknown

# Environment variables
ENV APP_VERSION=$VERSION \
    BUILD_DATE=$BUILD_DATE

# nginx:alpine ships without wget/curl; install wget for the healthcheck
RUN apk add --no-cache wget

# Reverse proxy + SPA routing config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Built static assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s \
             --timeout=5s \
             --start-period=10s \
             --retries=3 \
CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
