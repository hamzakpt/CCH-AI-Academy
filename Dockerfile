# Stage 1: Build ai-games
FROM node:20 AS ai_games_builder
WORKDIR /app/ai-games
COPY AI-Games/package.json AI-Games/pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY AI-Games/ ./
RUN pnpm run build

# Stage 2: Build learning-path
FROM node:20 AS learning_path_builder
WORKDIR /app/learning-path
COPY learning-path/package.json learning-path/package-lock.json ./
RUN npm ci --production=false
COPY learning-path/ ./
RUN npm run build

# Stage 3: Serve both with Nginx
FROM nginx:1.25-alpine AS final
WORKDIR /usr/share/nginx/html

# Clean default Nginx folder
RUN rm -rf ./*

# Copy both builds into separate folders
COPY --from=ai_games_builder /app/ai-games/dist ./ai-games
COPY --from=learning_path_builder /app/learning-path/dist ./learning-path

# Copy shared nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
