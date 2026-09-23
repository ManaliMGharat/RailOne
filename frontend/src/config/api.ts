/**
 * RailOne API Configuration
 * Reads VITE_API_BASE_URL from environment variables (e.g. on Vercel)
 * and defaults to http://localhost:8000 for local development.
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Remove any trailing slash to ensure consistent paths
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

// Fully qualified API endpoint prefix (/api)
export const API_URL = `${API_BASE_URL}/api`;

export default {
  API_BASE_URL,
  API_URL,
};
