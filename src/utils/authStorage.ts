import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types/user';

const AUTH_KEY = '@bikeconnect_auth';

interface PersistedAuth {
  refreshToken: string;
  user: User;
}

export const authStorage = {
  save: async (data: PersistedAuth): Promise<void> => {
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(data));
    } catch {}
  },

  load: async (): Promise<PersistedAuth | null> => {
    try {
      const json = await AsyncStorage.getItem(AUTH_KEY);
      return json ? (JSON.parse(json) as PersistedAuth) : null;
    } catch {
      return null;
    }
  },

  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
    } catch {}
  },
};
