export interface Category {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  success: boolean;
  count: number;
  data: Category[];
}
