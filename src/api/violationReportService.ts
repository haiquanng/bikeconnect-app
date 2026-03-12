import { apiClient } from './apiClient';

export type ViolationType =
  | 'FRAUD'
  | 'FAKE_LISTING'
  | 'INAPPROPRIATE'
  | 'STOLEN_BICYCLE'
  | 'DUPLICATE_LISTING'
  | 'OTHER';

export const VIOLATION_TYPE_LABELS: Record<ViolationType, string> = {
  FRAUD:             'Lừa đảo',
  FAKE_LISTING:      'Tin đăng giả',
  INAPPROPRIATE:     'Nội dung không phù hợp',
  STOLEN_BICYCLE:    'Xe bị đánh cắp',
  DUPLICATE_LISTING: 'Tin đăng trùng lặp',
  OTHER:             'Khác',
};

export interface CreateViolationReportParams {
  reportedUserId: string;
  bicycleId: string;
  violationType: ViolationType;
  description: string;
}

export const violationReportService = {
  create: async (params: CreateViolationReportParams): Promise<void> => {
    await apiClient.post('/violation-reports', params);
  },
};
