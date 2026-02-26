import { apiClient } from './apiClient';
import type { Brand, CreateBicycleRequest } from '../types/bicycle';

interface BrandsResponse {
  success: boolean;
  data: Brand[];
}

interface CreateBicycleResponse {
  success: boolean;
  message: string;
  data: any;
}

export const bicycleService = {
  async getBrands(): Promise<Brand[]> {
    try {
      const response = await apiClient.get<BrandsResponse>('/brands');
      return response.data;
    } catch (error: any) {
      console.error('Get brands error:', error);
      throw error;
    }
  },

  async createBicycle(payload: CreateBicycleRequest): Promise<any> {
    try {
      const response = await apiClient.post<CreateBicycleResponse>(
        '/bicycles',
        payload,
      );
      return response.data;
    } catch (error: any) {
      console.error('Create bicycle error:', error);
      throw error;
    }
  },
};
