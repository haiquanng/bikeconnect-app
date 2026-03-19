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

function mapNotification(n: any): AppNotification {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.is_read ?? n.isRead ?? false,
    url: n.url ?? null,
    metadata: n.metadata ?? null,
    createdAt: n.created_at ?? n.createdAt ?? new Date().toISOString(),
  };
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  unreadCount: number;
}

export const notificationService = {
  getNotifications: async (page = 1, limit = 10): Promise<NotificationsResponse> => {
    const res: any = await apiClient.get('/notifications', { params: { page, limit } });
    const d = res.data;
    return {
      notifications: (d.notifications ?? []).map(mapNotification),
      pagination: d.pagination,
      unreadCount: d.unreadCount,
    };
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },
};
