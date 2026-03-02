import axios from 'axios';

const api = axios.create({
  baseURL: '/backend-api',
  headers: {
    'Content-Type': 'application/json',
  },
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
