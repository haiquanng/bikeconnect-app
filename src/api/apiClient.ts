import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config/appConfig';

class ApiClient {
  private client: AxiosInstance;
  private store: any = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      config => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.client.interceptors.response.use(
      response => {
        console.log('API Response:', response.config.url, response.status);
        return response;
      },
      async error => {
        // Log error details (skip expected status codes)
        const status = error.response?.status;
        if (status !== 409) {
          console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status,
            message: error.message,
          });
        }

        // Handle 401 - try to refresh token
        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;

          try {
            const refreshed = await this.handleTokenRefresh();
            if (refreshed) {
              // Retry the original request with new token
              const token = this.getAuthToken();
              if (token) {
                error.config.headers.Authorization = `Bearer ${token}`;
              }
              return this.client.request(error.config);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            this.handleUnauthorized();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // Set Redux store reference
  setStore(store: any): void {
    this.store = store;
  }

  private getAuthToken(): string | null {
    if (!this.store) {
      return null;
    }
    const state = this.store.getState();
    return state.auth?.idToken || null;
  }

  private getRefreshToken(): string | null {
    if (!this.store) {
      return null;
    }
    const state = this.store.getState();
    return state.auth?.refreshToken || null;
  }

  private async handleTokenRefresh(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken || !this.store) {
      return false;
    }

    try {
      // Import authService to avoid circular dependency
      const { authService } = await import('./authService');
      const newTokens = await authService.refreshToken(refreshToken);

      // Update tokens in store
      const { updateTokens } = await import('../redux/auth/authSlice');
      this.store.dispatch(updateTokens(newTokens));

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  private handleUnauthorized(): void {
    if (!this.store) {
      return;
    }
    // Dispatch logout action
    import('../redux/auth/authSlice').then(({ logout }) => {
      this.store.dispatch(logout());
    });
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config,
    );
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      config,
    );
    return response.data;
  }
}

export const apiClient = new ApiClient();
