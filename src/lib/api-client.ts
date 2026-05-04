import { getUser, getToken } from '@/lib/utils/auth-utils';
import axios from 'axios';
import { setToken, clearAuthData } from '@/lib/utils/auth-utils';

// Queue to store requests that need to be retried after token refresh
let refreshTokenQueue: Array<() => void> = [];
let isRefreshing = false;

const apiClient = axios.create({
  baseURL:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_API_URL
      : 'http://localhost:4300', // Updated fallback URL
});

// Function to refresh the token
async function refreshToken() {
  try {
    const currentToken = getToken();
    if (!currentToken) {
      // Don't override with custom message - let the actual login attempt fail and show backend message
      const error = new Error('No refresh token available');
      error.name = 'NoTokenError';
      throw error;
    }

    // Make direct API call to refresh token
    const baseURL =
      typeof process !== 'undefined'
        ? process.env.NEXT_PUBLIC_API_URL
        : 'http://localhost:4300'; // Updated fallback URL
    const response = await axios.post(`${baseURL}/api/auth/refresh`, {
      refreshToken: currentToken.refreshToken,
    });

    const refreshedToken = response.data;

    // Update the token in localStorage using auth-utils
    if (typeof window !== 'undefined') {
      setToken(refreshedToken.token);
    }

    return refreshedToken.token;
  } catch (error) {
    // Clear auth data on refresh failure using auth-utils
    if (typeof window !== 'undefined') {
      clearAuthData();
    }
    throw error;
  }
}

// Add a request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve token and user from localStorage using auth-utils
    const token = getToken();
    const user = getUser();

    // If token exists, add to headers
    if (token?.accessToken) {
      config.headers.Authorization = `Bearer ${token.accessToken}`;
    }

    // If user exists, add to headers for middleware validation
    if (user) {
      config.headers['x-user-data'] = JSON.stringify(user);
    }

    // Set Content-Type only if it's not FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Handle request data structure
    if (config.data) {
      // If data contains params, add them to the URL
      if (config.data.params) {
        const { params } = config.data;
        if (config.url && params.token) {
          config.url = config.url.replace('[token]', params.token);
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If this is a login request, don't try to refresh - just pass the error through
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/login')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If a refresh is already in progress, queue this request
        return new Promise((resolve) => {
          refreshTokenQueue.push(() => {
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();

        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${newToken.accessToken}`;

        // Also update user data header in case it changed
        const user = getUser();
        if (user) {
          originalRequest.headers['x-user-data'] = JSON.stringify(user);
        }

        // Retry all queued requests
        refreshTokenQueue.forEach((callback) => callback());
        refreshTokenQueue = [];

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login (only if not already on login page)
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/login')
        ) {
          // Use replace to prevent back button issues
          window.location.replace('/app/auth/login');
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Public API client for unauthenticated requests
const publicApiClient = axios.create({
  baseURL:
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_API_URL
      : 'http://localhost:4300',
});

// Add request interceptor for public client (no auth headers)
publicApiClient.interceptors.request.use(
  (config) => {
    // Set Content-Type only if it's not FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for public client (no redirect on 401)
publicApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect to login for public endpoints - just return the error
    return Promise.reject(error);
  }
);

export { apiClient, publicApiClient };
