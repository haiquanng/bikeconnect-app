import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/appConfig';
import type { ApiMessage } from '../api/conversationService';

export interface SocketNewMessageEvent {
  conversationId: string;
  message: ApiMessage;
}

export interface SocketTypingEvent {
  conversationId: string;
  senderId: string;
}

export interface SocketMessagesReadEvent {
  conversationId: string;
  readerId: string;
}

type EventMap = {
  new_message: SocketNewMessageEvent;
  typing: SocketTypingEvent;
  stop_typing: SocketTypingEvent;
  messagesRead: SocketMessagesReadEvent;
  user_online: { userId: string };
  user_offline: { userId: string };
  conversation_locked: { conversationId: string; lockedStatus: string };
};

type Handler<K extends keyof EventMap> = (data: EventMap[K]) => void;

class SocketService {
  private socket: Socket | null = null;
  private handlers = new Map<string, Set<Function>>();

  connect(idToken: string): void {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token: idToken },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', reason => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', err => {
      console.warn('[Socket] connect_error:', err.message);
    });

    const events: (keyof EventMap)[] = [
      'new_message',
      'typing',
      'stop_typing',
      'messagesRead',
      'user_online',
      'user_offline',
      'conversation_locked',
    ];

    events.forEach(event => {
      this.socket!.on(event, (data: any) => {
        this.handlers.get(event)?.forEach(h => h(data));
      });
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.handlers.clear();
  }

  on<K extends keyof EventMap>(event: K, handler: Handler<K>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as Function);
    return () => this.off(event, handler);
  }

  off<K extends keyof EventMap>(event: K, handler: Handler<K>): void {
    this.handlers.get(event)?.delete(handler as Function);
  }

  emitTyping(conversationId: string, receiverId: string): void {
    this.socket?.emit('typing', { conversationId, receiverId });
  }

  emitStopTyping(conversationId: string, receiverId: string): void {
    this.socket?.emit('stop_typing', { conversationId, receiverId });
  }

  get connected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
