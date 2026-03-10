import { apiClient } from './apiClient';
// import { API_BASE_URL } from '../config/appConfig';
import { Product } from '../types/product';

const apiUrl = 'https://690dec0bbd0fefc30a02db68.mockapi.io';

export const productService = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      const products = await apiClient.get<Product[]>(`${apiUrl}/products`);
      return products;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },

  // Get product by ID
  async getProductById(id: string): Promise<Product> {
    try {
      const product = await apiClient.get<Product>(`${apiUrl}/products/${id}`);
      return product;
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  },

  // Get featured/hot products (for now, just return first 5)
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const products = await this.getProducts();
      return products.slice(0, 5);
    } catch (error) {
      console.error('Get featured products error:', error);
      throw error;
    }
  },
};
