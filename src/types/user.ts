export interface Address {
  street: string;
  city: string;
  isMain: boolean;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  avatar: string;
  role: string[]; // Array of roles: BUYER, SELLER, etc.
  fullName: string;
  phone: string;
  address: Address[];
  dob: string;
  emailNotification: boolean;
  pushNotification: boolean;
  gender: number; // 0: male, 1: female, 2: other
  isVerified: boolean;
  status: string; // ACTIVE, INACTIVE, ...
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string; // For future JWT implementation
}
