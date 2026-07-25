import { createContext, useContext, useState } from 'react';
import api, { STORAGE_KEY } from '../api/client';

// Contexte d'authentification : expose l'utilisateur connecté et les
// actions register / login / logout à toute l'application.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  });

  const saveAuth = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAuth(data);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    saveAuth(data.data);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    saveAuth(data.data);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  };

  const value = {
    user: auth?.user ?? null,
    isAuthenticated: Boolean(auth?.token),
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
