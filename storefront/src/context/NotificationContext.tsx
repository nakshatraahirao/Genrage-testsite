import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types';
import { fetchApi } from '../api/client';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchApi<{ notifications: Notification[]; unreadCount: number }>('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Notifications fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshNotifications();
    // Poll every 30 seconds for live order status changes
    const interval = setInterval(refreshNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id: string) => {
    if (!user) return;
    try {
      await fetchApi(`/notifications/${id}/read`, { method: 'PUT' });
      await refreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await fetchApi('/notifications/read-all', { method: 'PUT' });
      await refreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
