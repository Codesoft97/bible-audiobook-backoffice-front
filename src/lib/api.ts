import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/login') &&
      !window.location.pathname.includes('/register')
    ) {
      localStorage.removeItem('user');
      // Clear the token cookie on the Next.js domain
      await fetch('/api/auth/clear-token', { method: 'POST' }).catch(() => { });
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
