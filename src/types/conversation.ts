export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  productId: string;
  productName: string;
  productImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

export type ConversationType = 'buying' | 'selling';

// ─── params for ChatDetailScreen ───────────────────────────────────

export interface ChatDetailParams {
  conversationId: string;
  partner: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
  };
  bicycleContext?: {
    id: string;
    name?: string;
    image?: string;
    price?: number;
  };
}
