import { apiClient } from './apiClient';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  url: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  unreadCount: number;
}

export const notificationService = {
  getNotifications: async (page = 1, limit = 10): Promise<NotificationsResponse> => {
    const res: any = await apiClient.get('/notifications', { params: { page, limit } });
    return res.data.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },
};
