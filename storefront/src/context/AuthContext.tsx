import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { fetchApi, getAuthToken, setAuthToken, removeAuthToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchApi<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await fetchApi<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuthToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const data = await fetchApi<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone })
    });
    setAuthToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
