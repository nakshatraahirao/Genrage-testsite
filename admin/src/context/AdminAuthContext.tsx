import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminFetch, getAdminToken, setAdminToken, removeAdminToken } from '../api/client';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) { setLoading(false); return; }
    adminFetch<{ user: AdminUser }>('/auth/me')
      .then((data) => {
        if (data.user.role !== 'ADMIN') {
          removeAdminToken();
          setAdmin(null);
        } else {
          setAdmin(data.user);
        }
      })
      .catch(() => { removeAdminToken(); setAdmin(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await adminFetch<{ user: AdminUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.user.role !== 'ADMIN') {
      throw new Error('This account does not have administrator access.');
    }
    setAdminToken(data.token);
    setAdmin(data.user);
  };

  const logout = () => {
    removeAdminToken();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
