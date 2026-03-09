import { apiClient } from './apiClient';

export interface Package {
  _id: string;
  name: string;
  code: string;
  price: number;
  postLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPackage {
  _id: string;
  userId: string;
  packageId: string;
  package: {
    _id: string;
    name: string;
    code: string;
    postLimit: number;
  };
  postedUsed: number;
  postRemaining: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  purchasedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const packageService = {
  async getPackages(): Promise<Package[]> {
    const res = await apiClient.get<{ success: boolean; count: number; data: Package[] }>(
      '/packages',
      { params: { isActive: true } },
    );
    return res.data ?? [];
  },

  async getMyPackages(): Promise<UserPackage[]> {
    const res = await apiClient.get<{ success: boolean; data: UserPackage[] }>('/users/packages');
    return res.data ?? [];
  },

  async cancelPackage(id: string): Promise<void> {
    await apiClient.patch(`/users/packages/${id}`, { status: 'CANCELLED' });
  },

  async getActivePackage(): Promise<UserPackage | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: UserPackage }>(
        '/users/packages/active',
      );
      return res.data ?? null;
    } catch {
      return null;
    }
  },
};
