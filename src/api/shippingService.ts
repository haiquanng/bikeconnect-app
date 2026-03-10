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

export interface ShippingFeeResult {
  total: number;
  serviceFee: number;
  insuranceFee: number;
}

interface ShippingFeeResponse {
  success: boolean;
  data: ShippingFeeResult;
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

  async calculateFee(params: {
    fromDistrictId: number;
    fromWardCode: string;
    toDistrictId: number;
    toWardCode: string;
    weight?: number;
    insuranceValue?: number;
  }): Promise<ShippingFeeResult> {
    const res = await apiClient.post<ShippingFeeResponse>('/shipping/calculate-fee', params);
    return res.data;
  },
};
