import { apiClient } from './apiClient';
import { Category, CategoryResponse } from '../types/category';

export const categoryService = {
  /**
   * Get all categories
   */
  async getCategories(params?: {
    isActive?: boolean;
    search?: string;
  }): Promise<Category[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.isActive !== undefined) {
        queryParams.append('isActive', params.isActive.toString());
      }

      if (params?.search) {
        queryParams.append('search', params.search);
      }

      const queryString = queryParams.toString();
      const url = `/categories${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<CategoryResponse>(url);

      if (!response.success) {
        throw new Error('Failed to fetch categories');
      }

      return response.data;
    } catch (error: any) {
      console.error('Get categories error:', error);
      throw error;
    }
  },

  /**
   * Get active categories only
   */
  async getActiveCategories(): Promise<Category[]> {
    return this.getCategories({ isActive: true });
  },
};
