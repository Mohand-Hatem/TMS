import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxies through Next.js rewrites to eliminate third-party cookie isolation
  withCredentials: true, // Required for transmitting the httpOnly JWT cookie across sessions
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle 401 Unauthorized globally on the client side
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // If we are in the browser and not already on an auth page, redirect to login
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
          window.location.href = `/login?from=${encodeURIComponent(pathname)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
