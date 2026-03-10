export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN' | 'INSPECTOR';

export type AuthProvider = 'google' | 'email';
export interface Address {
  _id?: string;
  label: string;
  street?: string;
  wardName?: string;
  wardCode?: string;
  districtName?: string;
  districtId?: number;
  provinceName?: string;
  provinceId?: number;
  fullAddress?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  firebaseUId?: string;
  email: string;
  fullName?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  addresses?: Address[];
  avatarUrl?: string;
  roles: UserRole[];
  reputationScore: number;
  isVerified: boolean;
  isActive: boolean;
  authProvider: AuthProvider;
  createdAt?: string;
  updatedAt?: string;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request
export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

// Auth response from backend
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    roles: UserRole[];
    isVerified: boolean;
    gender?: string;
    dateOfBirth?: string;
    authProvider: AuthProvider;
    idToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

// Profile response
export interface ProfileResponse {
  success: boolean;
  data: User;
}
