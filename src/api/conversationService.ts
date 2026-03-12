import { apiClient } from './apiClient';

export interface ApiMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'PRODUCT' | 'IMAGE' | 'SYSTEM';
  bicycleId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiConversation {
  _id: string;
  chatPartner: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    email: string;
  };
  lastMessage?: {
    _id: string;
    content: string;
    type: string;
    createdAt: string;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
  isOnline?: boolean;
  lockedStatus?: 'NONE' | 'TEMP_LOCKED' | 'PERM_LOCKED';
  updatedAt: string;
}

export const conversationService = {
  createOrFind: async (receiverId: string): Promise<{ conversationId: string }> => {
    const res: any = await apiClient.post('/conversations', { receiverId });
    return { conversationId: res.conversation._id };
  },

  getConversations: async (cursor?: string): Promise<{
    data: ApiConversation[];
    nextCursor: string | null;
  }> => {
    const params: any = { limit: 20 };
    if (cursor) params.cursor = cursor;
    const res: any = await apiClient.get('/conversations', { params });
    return {
      data: res.data ?? [],
      nextCursor: res.pagination?.nextCursor ?? null,
    };
  },

  getMessages: async (conversationId: string, cursor?: string): Promise<{
    messages: ApiMessage[];
    nextCursor: string | null;
  }> => {
    const params: any = { limit: 30 };
    if (cursor) params.cursor = cursor;
    const res: any = await apiClient.get(`/conversations/${conversationId}`, { params });
    return {
      messages: res.data ?? [],
      nextCursor: res.pagination?.nextCursor ?? null,
    };
  },

  sendMessage: async (conversationId: string, content: string): Promise<ApiMessage> => {
    const res: any = await apiClient.post(
      `/conversations/${conversationId}/messages`,
      { content, type: 'TEXT' },
    );
    return res.data ?? res.message;
  },

  markAsRead: (conversationId: string): Promise<any> =>
    apiClient.put(`/conversations/${conversationId}/read`),

  getUnreadCount: async (): Promise<number> => {
    const res: any = await apiClient.get('/conversations/unread-count');
    return res.unreadCount ?? res.data?.unreadCount ?? 0;
  },
};
