import axios from 'axios';

export const STORAGE_KEY = 'gmc_auth';

// Instance axios partagée : toutes les requêtes passent par /api
// (redirigé vers le backend par le proxy Vite en développement).
const api = axios.create({ baseURL: '/api' });

// Ajoute automatiquement le jeton JWT à chaque requête si l'utilisateur est connecté
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // stockage corrompu : on continue sans jeton
  }
  return config;
});

// Si le backend répond 401 (jeton expiré ou invalide), on déconnecte l'utilisateur
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthCall = error.config?.url?.startsWith('/auth/');
    if (status === 401 && !isAuthCall) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Extrait un message d'erreur lisible depuis une réponse de l'API
export const getErrorMessage = (error) =>
  error.response?.data?.message || 'Une erreur est survenue, veuillez réessayer';

export default api;
