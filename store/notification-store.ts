import { create } from 'zustand';
const API_BASE = 'https://social-backend-y1rg.onrender.com';

// Define the shape of a single notification object from the backend
export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    name: string;
    profileImage: string;
  };
  type: 'like' | 'comment' | 'reply' | 'follow' | 'repost';
  message: string;
  postId?: {
    _id: string;
    discription: string;
    media: string[];
  };
  read: boolean;
  createdAt: string;
}

// Define the state and actions for the store
interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,
  unreadCount: 0,

  /**
   * Fetches notifications from the backend API.
   */
  fetchNotifications: async () => {
    const { token } = require('./auth-store').useAuthStore.getState();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/notification`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      const fetchedNotifications: Notification[] = data.body || [];
      
      const unread = fetchedNotifications.filter(n => !n.read).length;

      set({ 
        notifications: fetchedNotifications, 
        isLoading: false,
        unreadCount: unread,
      });

    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Fetch Notifications API Error:', error);
    }
  },

  /**
   * Marks a single notification as read on the backend and updates the state.
   */
  markAsRead: async (notificationId: string) => {
    const { token } = require('./auth-store').useAuthStore.getState();
    if (!token) return;
    
    // Optimistic UI update: mark as read immediately in the frontend
    const currentNotifications = get().notifications;
    const notification = currentNotifications.find(n => n._id === notificationId);

    if (notification && !notification.read) {
        set(state => ({
            notifications: state.notifications.map(n =>
                n._id === notificationId ? { ...n, read: true } : n
            ),
            unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
        }));
    }
    
    try {
      await fetch(`${API_BASE}/notification/read/${notificationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Mark as Read API Error:', error);
      // Optional: Revert optimistic update on failure
    }
  },
  
  /**
   * Marks all unread notifications as read.
   */
  markAllAsRead: async () => {
      const { token } = require('./auth-store').useAuthStore.getState();
      if (!token) return;
      
      // Optimistic update
      set(state => ({
          notifications: state.notifications.map(n => ({...n, read: true})),
          unreadCount: 0,
      }));

      try {
          await fetch(`${API_BASE}/notification/read/all`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
          });
      } catch (error) {
          console.error('Mark All as Read API Error:', error);
      }
  }
}));
