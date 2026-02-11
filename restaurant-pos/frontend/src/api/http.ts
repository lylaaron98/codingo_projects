import axios, { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
http.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Only redirect to login on 401 if we're not already on the login page
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      // Handle unauthorized - user session expired
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default http;
