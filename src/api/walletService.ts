import { apiClient } from './apiClient';

export interface Wallet {
  _id: string;
  userId: string;
  totalEarn: number;
  totalWithdrawn: number;
  totalReceived: number;
  frozenBalance: number;
  // availableBalance = totalEarn - totalWithdrawn - frozenBalance (computed by backend)
}

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface WalletTransaction {
  _id: string;
  transactionCode: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'ESCROW_IN' | 'ESCROW_OUT' | 'FULL' | 'REMAINING';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  paymentMethod: string;
  createdAt: string;
  data?: { status?: TransactionStatus };
}

interface WalletResponse {
  success: boolean;
  data: Wallet;
}

interface DepositResponse {
  success: boolean;
  data: { paymentUrl: string; txnRef: string };
}

interface TransactionsResponse {
  success: boolean;
  data: {
    transactions: WalletTransaction[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

export const walletService = {
  async getMyWallet(): Promise<Wallet> {
    const res = await apiClient.get<WalletResponse>('/wallets/me');
    return res.data;
  },

  async deposit(amount: number): Promise<{ paymentUrl: string; txnRef: string }> {
    const res = await apiClient.post<DepositResponse>('/wallets/deposit', { amount });
    return res.data;
  },

  async getTransactions(page = 1, limit = 20): Promise<TransactionsResponse['data']> {
    const res = await apiClient.get<TransactionsResponse>('/wallets/transactions', {
      params: { page, limit },
    });
    return res.data;
  },

  availableBalance(wallet: Wallet): number {
    return wallet.totalEarn - wallet.totalWithdrawn - wallet.frozenBalance;
  },
};
