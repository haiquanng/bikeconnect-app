import { Platform } from 'react-native';
import { apiClient } from './apiClient';

export const deviceTokenService = {
  register: async (fcmToken: string): Promise<void> => {
    await apiClient.post('/device-tokens/register', {
      fcmToken,
      deviceType: Platform.OS === 'ios' ? 'ios' : 'android',
    });
  },

  unregister: async (fcmToken: string): Promise<void> => {
    await apiClient.delete('/device-tokens', { data: { fcmToken } } as any);
  },
};
