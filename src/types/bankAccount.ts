export interface BankAccount {
  _id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountOwner: string;
  isDefault: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  addedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface VietQRBank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}
