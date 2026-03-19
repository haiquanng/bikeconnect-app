import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigateTo(name: string, params?: object) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
}

export function handleNotificationTap(data: Record<string, string>) {
  const { type, conversationId, orderId } = data ?? {};

  if (type === 'NEW_MESSAGE' && conversationId) {
    navigateTo('Main', { screen: 'Inbox' });
  } else if (orderId) {
    navigateTo('OrderDetail', { orderId });
  } else {
    navigateTo('Notifications');
  }
}
