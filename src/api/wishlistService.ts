import { apiClient } from './apiClient';

export interface WishlistBicycle {
  _id: string;
  title: string;
  price: number;
  primaryImage?: string;
  condition?: string;
  status: string;
}

export interface WishlistItem {
  _id: string;
  bicycleId: string;
  bicycle: WishlistBicycle;
  createdAt: string;
}

export const wishlistService = {
  getWishlist: async (page = 1, limit = 20): Promise<{ items: WishlistItem[]; totalPages: number }> => {
    const res: any = await apiClient.get('/wishlist', { params: { page, limit } });
    const d = res.data;
    return { items: d.data, totalPages: d.pagination.totalPages };
  },

  add: async (bicycleId: string): Promise<void> => {
    await apiClient.post('/wishlist', { bicycleId });
  },

  remove: async (bicycleId: string): Promise<void> => {
    await apiClient.delete(`/wishlist/${bicycleId}`);
  },

  check: async (bicycleId: string): Promise<boolean> => {
    const res: any = await apiClient.get(`/wishlist/${bicycleId}`);
    return res.data.data.isWishlisted;
  },
};
