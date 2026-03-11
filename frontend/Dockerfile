# Stage 1: Dependencies
FROM node:20-alpine AS deps

# Install pnpm
RUN npm install -g pnpm@latest

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package.json pnpm-lock.yaml ./

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile

# Stage 2: Build the application
FROM deps AS builder

# Copy the rest of the application source code
COPY . .

# Build the application
# Note: API URL is NOT set at build time - it's configured at runtime via environment variable
RUN pnpm run build

# Stage 3: Serve the application with Nginx
FROM nginx:1.25-alpine

# Remove default Nginx public folder
RUN rm -rf /usr/share/nginx/html/*

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the Docker entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Expose port 80
EXPOSE 80

# Use entrypoint script to substitute environment variables at runtime
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
