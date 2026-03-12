# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

# Install pnpm
RUN npm install -g pnpm@latest

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend dependency manifests
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile

# Copy frontend source code
COPY frontend/ .

# Build the frontend application
RUN pnpm run build && echo "Frontend build completed successfully"

# Stage 2: Runtime
FROM python:3.11-slim

# Install Nginx and supervisord
RUN apt-get update && apt-get install -y nginx supervisor && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application
COPY backend/ ./backend/

# Copy frontend built assets
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Replace entire nginx configuration with our config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy and setup entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose ports: 80 for Nginx (frontend), 8000 for FastAPI (backend)
EXPOSE 80 8000

# Use entrypoint script to start both services
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
