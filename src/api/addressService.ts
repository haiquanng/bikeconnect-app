import { apiClient } from './apiClient';
import { Address } from '../types/user';
import { authService } from './authService';

interface AddressResponse {
  success: boolean;
  data: Address[];
}

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    const user = await authService.getProfile();
    return user.addresses || [];
  },

  async addAddress(
    data: Omit<Address, '_id'>,
  ): Promise<Address[]> {
    const response = await apiClient.post<AddressResponse>(
      '/users/addresses',
      data,
    );
    return response.data;
  },

  async updateAddress(
    id: string,
    data: Omit<Address, '_id'>,
  ): Promise<Address[]> {
    const response = await apiClient.put<AddressResponse>(
      `/users/addresses/${id}`,
      data,
    );
    return response.data;
  },

  async deleteAddress(id: string): Promise<Address[]> {
    const response = await apiClient.delete<AddressResponse>(
      `/users/addresses/${id}`,
    );
    return response.data;
  },

  async setDefaultAddress(id: string): Promise<Address[]> {
    const response = await apiClient.put<AddressResponse>(
      `/users/addresses/${id}/default`,
    );
    return response.data;
  },
};
