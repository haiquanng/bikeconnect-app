import { apiClient } from './apiClient';
import type { Brand, BicycleModel, BicycleListing, BicycleStatus, CreateBicycleRequest } from '../types/bicycle';

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

interface BicycleDetailResponse {
  success: boolean;
  data: BicycleListing;
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
  condition?: string;
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

  async getBicycleById(id: string): Promise<BicycleListing> {
    const response = await apiClient.get<BicycleDetailResponse>(`/bicycles/${id}`);
    return response.data;
  },

  async updateBicycle(id: string, payload: Partial<CreateBicycleRequest>): Promise<BicycleListing> {
    const response = await apiClient.put<BicycleDetailResponse>(`/bicycles/${id}`, payload);
    return response.data;
  },

  async getModels(brandId: string): Promise<BicycleModel[]> {
    const response = await apiClient.get<{ success: boolean; data: BicycleModel[] }>(
      '/bicycle-models',
      { params: { brandId, isActive: 'true', limit: '100' } },
    );
    return response.data ?? [];
  },

  async deleteBicycle(id: string): Promise<void> {
    await apiClient.delete(`/bicycles/${id}`);
  },

  async updateStatus(id: string, status: BicycleStatus): Promise<BicycleListing> {
    const response = await apiClient.put<BicycleDetailResponse>(`/bicycles/${id}/status`, { status });
    return response.data;
  },

  async getInspectionReport(bicycleId: string): Promise<InspectionReport> {
    const response = await apiClient.get<{ success: boolean; data: InspectionReport }>(
      `/bicycles/${bicycleId}/inspection-report`,
    );
    return response.data;
  },

  async resubmitBicycle(id: string): Promise<BicycleListing> {
    const response = await apiClient.post<BicycleDetailResponse>(`/bicycles/${id}/resubmit`);
    return response.data;
  },
};

export interface InspectionReport {
  _id: string;
  bicycleId: string;
  inspectorId: string;
  assignedBy: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  conditions: {
    frame: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
    brake: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
    drivetrain: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
    wheels: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
    notes?: string;
  };
  overallRating: number;
  isPassed: boolean;
  images: string[];
  notes?: string;
  completedAt?: string;
  submittedAt?: string;
  createdAt: string;
}
