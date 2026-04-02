import { apiClient } from './apiClient';
import type { BankAccount } from '../types/bankAccount';

interface BankAccountResponse {
  success: boolean;
  data: BankAccount;
}

interface BankAccountListResponse {
  success: boolean;
  data: BankAccount[];
}

export interface AddBankAccountParams {
  bankName: string;
  accountNumber: string;
  accountOwner: string;
  isDefault?: boolean;
}

export const bankAccountService = {
  async getAll(): Promise<BankAccount[]> {
    const res = await apiClient.get<BankAccountListResponse>('/bank-accounts', {
      params: { status: 'ACTIVE' },
    });
    return res.data;
  },

  async add(params: AddBankAccountParams): Promise<BankAccount> {
    const res = await apiClient.post<BankAccountResponse>('/bank-accounts', params);
    return res.data;
  },

  async update(id: string, params: Partial<AddBankAccountParams>): Promise<BankAccount> {
    const res = await apiClient.put<BankAccountResponse>(`/bank-accounts/${id}`, params);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/bank-accounts/${id}`);
  },

  async setDefault(id: string): Promise<BankAccount> {
    const res = await apiClient.put<BankAccountResponse>(`/bank-accounts/${id}/default`);
    return res.data;
  },
};
