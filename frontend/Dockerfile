# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency manifests
COPY package.json pnpm-lock.yaml ./

# Install dependencies
# We use --frozen-lockfile to ensure we use the exact versions from the lockfile
# We also handle the potential issue with @tailwindcss/oxide by installing the correct binary for linux
RUN pnpm install --frozen-lockfile
RUN pnpm add @tailwindcss/oxide-linux-x64-gnu

# Copy the rest of the application source code
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.25-alpine AS final

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default Nginx public folder
RUN rm -rf ./*

# Copy the built assets from the builder stage
COPY --from=builder /app/dist .

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
