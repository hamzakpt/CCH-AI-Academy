/**
 * API Configuration
 * Simple, reliable API base URL detection
 */

// Simple environment-based API base URL
// Development: http://localhost:8000 (direct backend connection)
// Production: /api (nginx proxy strips prefix and forwards to backend)
export const API_BASE = import.meta.env.DEV
  ? 'http://localhost:8000'  // Development: direct backend
  : '/api';                  // Production: nginx proxy