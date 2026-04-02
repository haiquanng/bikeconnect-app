import { apiClient } from './apiClient';
import type { KycStatus } from '../types/user';

export interface KycInfo {
  kycStatus: KycStatus;
  kycFullName: string | null;
  kycIdNumber: string | null;
  kycDob: string | null;
  kycAddress: string | null;
  kycVerifiedAt: string | null;
}

interface KycResponse {
  success: boolean;
  data: KycInfo;
}

export const kycService = {
  async getStatus(): Promise<KycInfo> {
    const res = await apiClient.get<KycResponse>('/users/kyc');
    return res.data;
  },

  async verify(imageUrl: string): Promise<KycInfo> {
    const res = await apiClient.post<KycResponse>('/users/kyc', { imageUrl });
    return res.data;
  },
};
