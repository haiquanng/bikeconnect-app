import { apiClient } from './apiClient';

export type DisputeType =
  | 'ITEM_NOT_AS_DESCRIBED'
  | 'ITEM_NOT_RECEIVED'
  | 'DAMAGED_ITEM'
  | 'FAKE_ITEM'
  | 'OTHER';

export const DISPUTE_TYPE_LABELS: Record<DisputeType, string> = {
  ITEM_NOT_AS_DESCRIBED: 'Không đúng mô tả',
  ITEM_NOT_RECEIVED:     'Chưa nhận được hàng',
  DAMAGED_ITEM:          'Hàng bị hư hỏng',
  FAKE_ITEM:             'Hàng giả / nhái',
  OTHER:                 'Khác',
};

export interface CreateDisputeParams {
  orderId: string;
  disputeType: DisputeType;
  reason: string;
  evidenceImages?: string[];
}

export const disputeService = {
  create: async (params: CreateDisputeParams): Promise<void> => {
    await apiClient.post('/disputes', params);
  },
};
