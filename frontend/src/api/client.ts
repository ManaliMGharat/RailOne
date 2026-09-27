export const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeout = 15000, ...customConfig } = options;

  const token = localStorage.getItem('railone_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  let cleanEndpoint = endpoint;
  if (cleanEndpoint.startsWith('/api/') && API_BASE_URL.endsWith('/api')) {
    cleanEndpoint = cleanEndpoint.substring(4);
  } else if (cleanEndpoint === '/api' && API_BASE_URL.endsWith('/api')) {
    cleanEndpoint = '';
  }
  const url = cleanEndpoint.startsWith('http') ? cleanEndpoint : `${API_BASE_URL}${cleanEndpoint.startsWith('/') ? '' : '/'}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers,
      signal: controller.signal,
    });

    clearTimeout(id);

    // If explicit 401 Unauthorized from server
    if (response.status === 401) {
      // Do not clear auth if on login/register endpoints
      if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register') && !endpoint.includes('/auth/otp')) {
        // Only clear if server explicitly rejects an existing token
        if (token) {
          localStorage.removeItem('railone_token');
          localStorage.removeItem('railone_user');
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      }
    }

    if (!response.ok) {
      let errorMsg = `Server error (${response.status})`;
      let errorData = null;
      try {
        errorData = await response.json();
        errorMsg = errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch {
        // If not JSON (e.g. 502/503 Render cold start)
        errorMsg = response.statusText || errorMsg;
      }
      throw new ApiError(errorMsg, response.status, errorData);
    }

    // 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(id);

    if (error.name === 'AbortError') {
      throw new ApiError(
        'The railway server took too long to respond. Render free servers may take a few moments to wake up.',
        408
      );
    }

    if (error instanceof ApiError) {
      throw error;
    }

    // Network error (offline or cold start connection drop)
    // NOTE: Section 22: Do not clear auth on temporary network errors!
    throw new ApiError(
      'Unable to connect to RailOne server. Please verify your internet connection or backend server status.',
      0
    );
  }
}
