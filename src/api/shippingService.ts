import { apiClient } from './apiClient';

export interface GHNProvince {
  ProvinceID: number;
  ProvinceName: string;
}

export interface GHNDistrict {
  DistrictID: number;
  DistrictName: string;
  ProvinceID: number;
}

export interface GHNWard {
  WardCode: string;
  WardName: string;
  DistrictID: number;
}

interface GHNResponse<T> {
  success: boolean;
  data: T[];
}

export const shippingService = {
  async getProvinces(): Promise<GHNProvince[]> {
    const res = await apiClient.get<GHNResponse<GHNProvince>>('/shipping/provinces');
    return res.data ?? [];
  },

  async getDistricts(provinceId: number): Promise<GHNDistrict[]> {
    const res = await apiClient.get<GHNResponse<GHNDistrict>>(`/shipping/districts/${provinceId}`);
    return res.data ?? [];
  },

  async getWards(districtId: number): Promise<GHNWard[]> {
    const res = await apiClient.get<GHNResponse<GHNWard>>(`/shipping/wards/${districtId}`);
    return res.data ?? [];
  },
};
