import { apiClient } from './apiClient';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ProfileResponse,
} from '../types/user';
import { FIREBASE_CONFIG, FIREBASE_AUTH_URL } from '../config/appConfig';

/**
 * Auth Service
 */
export const authService = {
  /**
   * Register with email and password
   */
  async register(credentials: RegisterRequest): Promise<AuthResponse> {
    try {
      const { email, password, fullName } = credentials;

      if (!email || !password) {
        throw new Error('Email và mật khẩu là bắt buộc');
      }

      if (password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }

      // Call backend register endpoint
      const response = await apiClient.post<AuthResponse>(
        '/auth/email/register',
        {
          email,
          password,
          fullName: fullName || '',
        },
      );

      if (!response.success) {
        throw new Error(response.message || 'Đăng ký thất bại');
      }

      return response;
    } catch (error: any) {
      // console.error('Register error:', error);

      // Handle specific error messages
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      if (error.message) {
        throw error;
      }

      throw new Error('Đã xảy ra lỗi khi đăng ký');
    }
  },

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;

      if (!email || !password) {
        throw new Error('Email và mật khẩu là bắt buộc');
      }

      // Call backend login endpoint
      const response = await apiClient.post<AuthResponse>('/auth/email/login', {
        email,
        password,
      });

      if (!response.success) {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }

      return response;
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle specific error messages
      if (error.response?.data?.message) {
        const message = error.response.data.message;

        // Translate Firebase errors to Vietnamese
        if (
          message.includes('INVALID_LOGIN_CREDENTIALS') ||
          message.includes('Invalid email or password')
        ) {
          throw new Error('Email hoặc mật khẩu không đúng');
        }

        throw new Error(message);
      }

      if (error.message) {
        throw error;
      }

      throw new Error('Đã xảy ra lỗi khi đăng nhập');
    }
  },

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<{
    idToken: string;
    refreshToken: string;
    expiresIn: string;
  }> {
    try {
      const response: any = await apiClient.post('/auth/refresh-token', {
        refreshToken,
      });

      if (!response.success) {
        throw new Error('Token refresh failed');
      }

      return {
        idToken: response.data.idToken,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
      };
    } catch (error: any) {
      console.error('Refresh token error:', error);
      throw new Error('Failed to refresh token');
    }
  },

  /**
   * Get user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<ProfileResponse>('/auth/profile');

      if (!response.success) {
        throw new Error('Failed to get profile');
      }

      return response.data;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<ProfileResponse>(
        '/auth/profile',
        userData,
      );

      if (!response.success) {
        throw new Error('Failed to update profile');
      }

      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to update profile',
      );
    }
  },

  /**
   * Send email verification
   */
  async sendEmailVerification(): Promise<void> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>('/auth/send-verification-email');

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to send verification email',
        );
      }
    } catch (error: any) {
      console.error('Send verification error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to send verification email',
      );
    }
  },

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await fetch(
        `${FIREBASE_AUTH_URL}:sendOobCode?key=${FIREBASE_CONFIG.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestType: 'PASSWORD_RESET',
            email,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw new Error('Không thể gửi email đặt lại mật khẩu');
    }
  },
};
