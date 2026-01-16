import { apiClient } from './apiClient';
import { User, LoginRequest } from '../types/user';
import { API_BASE_URL } from '../config/appConfig';

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<User> {
    try {
      // Fetch all users from MockAPI
      const users = await apiClient.get<User[]>(`${API_BASE_URL}/users`);

      // Find user with matching email
      const user = users.find(u => u.email === credentials.email);

      if (!user) {
        throw new Error('Email không tồn tại');
      }

      // In a real app, password would be hashed and compared on backend
      // For now, we'll just check if password matches (MockAPI stores plain text)
      if (user.password !== credentials.password) {
        throw new Error('Mật khẩu không đúng');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userWithoutPassword } = user;

      return userWithoutPassword as User;
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error('Đã xảy ra lỗi khi đăng nhập');
    }
  },

  /**
   * Register new user
   * TODO: Implement when needed
   */
  async register(userData: Partial<User>): Promise<User> {
    const newUser = await apiClient.post<User>(
      `${API_BASE_URL}/users`,
      userData,
    );
    return newUser;
  },

  /**
   * Forgot password
   * TODO: Implement when needed
   */
  async forgotPassword(email: string): Promise<void> {
    // Mock implementation
    console.log('Forgot password for:', email);
  },
};
