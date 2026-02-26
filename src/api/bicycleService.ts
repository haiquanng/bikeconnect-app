import { apiClient } from './apiClient';
import type { Brand, BicycleListing, BicycleStatus, CreateBicycleRequest } from '../types/bicycle';

interface BrandsResponse {
  success: boolean;
  data: Brand[];
}

interface CreateBicycleResponse {
  success: boolean;
  message: string;
  data: any;
}

interface MyListingsResponse {
  success: boolean;
  data: BicycleListing[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface BicyclesResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: BicycleListing[];
}

export interface MyListingsParams {
  status?: BicycleStatus;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface BicyclesParams {
  status?: BicycleStatus;
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  search?: string;
}

export const bicycleService = {
  async getBrands(): Promise<Brand[]> {
    const response = await apiClient.get<BrandsResponse>('/brands');
    return response.data;
  },

  async createBicycle(payload: CreateBicycleRequest): Promise<any> {
    const response = await apiClient.post<CreateBicycleResponse>('/bicycles', payload);
    return response.data;
  },

  async getMyListings(params?: MyListingsParams): Promise<MyListingsResponse> {
    return apiClient.get<MyListingsResponse>('/bicycles/my', { params });
  },

  async getBicycles(params?: BicyclesParams): Promise<BicyclesResponse> {
    return apiClient.get<BicyclesResponse>('/bicycles', { params });
  },
};
