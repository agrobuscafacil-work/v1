import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Login e refresh nao possuem sessao para renovar o token:
      // o erro original (com sua mensagem) deve ser repassado ao chamador.
      const url = originalRequest?.url ?? '';
      if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The refresh token is stored in an httpOnly cookie and is sent automatically
        // because the axios instance uses `withCredentials: true`.
        await axios.post(`${API_URL}/auth/refresh`, undefined, {
          withCredentials: true,
        });
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
<<<<<<< HEAD
<<<<<<< HEAD
        processQueue(error, null);
        // O bootstrap (/users/me) falha com 401 para visitantes anonimos;
        // nesse caso nao ha sessao para redirecionar - o redirecionamento
        // fica reservado para sessoes que expiraram durante o uso.
        const isAnonymousBootstrap = originalRequest?.url?.includes('/users/me');
        if (
          !isAnonymousBootstrap &&
          typeof window !== 'undefined' &&
          window.location.pathname !== '/auth/login'
        ) {
          // Axios interceptor runs outside React; a full redirect is required here.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = '/auth/login';
=======
=======
>>>>>>> 1bd5b84952c5cba1f9d0394813bdfc2f92774806
        processQueue(refreshError, null);
        // Limpa o estado de autenticação sem redirecionar para a tela de login.
        try {
          const { useAuth } = await import('@/hooks/use-auth');
          useAuth.setState({ user: null, isAuthenticated: false, isLoading: false });
        } catch {
          // Ignora falha ao limpar o store.
<<<<<<< HEAD
>>>>>>> 1bd5b84952c5cba1f9d0394813bdfc2f92774806
=======
>>>>>>> 1bd5b84952c5cba1f9d0394813bdfc2f92774806
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export const fetcher = (url: string) => api.get(url).then((res) => res.data);