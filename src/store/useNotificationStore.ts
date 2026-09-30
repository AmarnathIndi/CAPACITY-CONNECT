import { create } from 'zustand';
import { NotificationItem } from '../types';

interface NotificationState {
  notifications: NotificationItem[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'date' | 'read'>) => void;
}

import initialNotifications from '../data/notifications.json';

export const useNotificationStore = create<NotificationState>((set) => {
  const saved = localStorage.getItem('capacity_connect_notifications');
  let initial: NotificationItem[] = initialNotifications as NotificationItem[];
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= initialNotifications.length) {
        initial = parsed;
      }
    } catch {
      initial = initialNotifications as NotificationItem[];
    }
  }

  return {
    notifications: initial,
    markAsRead: (id: string) => {
      set((state) => {
        const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
        localStorage.setItem('capacity_connect_notifications', JSON.stringify(updated));
        return { notifications: updated };
      });
    },
    markAllAsRead: () => {
      set((state) => {
        const updated = state.notifications.map((n) => ({ ...n, read: true }));
        localStorage.setItem('capacity_connect_notifications', JSON.stringify(updated));
        return { notifications: updated };
      });
    },
    addNotification: (item) => {
      const newNotif: NotificationItem = {
        ...item,
        id: `notif-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        read: false
      };
      set((state) => {
        const updated = [newNotif, ...state.notifications];
        localStorage.setItem('capacity_connect_notifications', JSON.stringify(updated));
        return { notifications: updated };
      });
    }
  };
});
