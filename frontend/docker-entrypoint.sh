#!/bin/sh
# Docker entrypoint script - substitutes environment variables in config.js

# Default API URL if not provided
API_URL="${API_URL:-http://localhost:8000}"

# Replace placeholder in config.js with actual API URL
sed -i "s|'\${API_URL}'|'${API_URL}'|g" /usr/share/nginx/html/config.js

# Start Nginx
nginx -g "daemon off;"
