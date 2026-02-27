// Bicycle / Listing Types

export type BicycleCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
export type BicycleStatus = 'PENDING' | 'APPROVED' | 'RESERVED' | 'SOLD' | 'HIDDEN' | 'REJECTED';

export interface BicycleListing {
  _id: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  condition: BicycleCondition;
  usageMonths?: number;
  viewCount: number;
  status: BicycleStatus;
  isInspected: boolean;
  isFeatured?: boolean;
  category?: { _id: string; name: string };
  brand?: { _id: string; name: string };
  seller?: { _id: string; fullName: string; avatarUrl?: string; reputationScore: number };
  specifications?: {
    yearManufactured?: number;
    frameSize?: string;
    frameMaterial?: string;
    color?: string;
  };
  location?: { address?: string; city?: string };
  images: MediaItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  _id: string;
  name: string;
  country?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface BicycleModel {
  _id: string;
  name: string;
  brandId: string;
}

export interface MediaItem {
  url: string;
  mediaType: 'image' | 'video';
  isPrimary: boolean;
  displayOrder: number;
}

export interface CreateListingFormData {
  // Step 1 — Tìm xe
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;

  // Step 2 — Thông tin cơ bản
  title: string;
  description: string;
  city: string;
  origin: string;
  yearManufactured: string;
  frameSize: string;
  frameMaterial: string;
  isElectric: boolean;
  color: string;

  // Step 3 — Tình trạng xe
  condition: BicycleCondition | '';
  usageMonths: string;

  // Step 4 — Ảnh
  images: MediaItem[];

  // Step 5 — Giá bán
  price: string;
  originalPrice: string;
}

export const INITIAL_FORM_DATA: CreateListingFormData = {
  categoryId: '',
  categoryName: '',
  brandId: '',
  brandName: '',
  modelId: '',
  modelName: '',
  title: '',
  description: '',
  city: '',
  origin: '',
  yearManufactured: '',
  frameSize: '',
  frameMaterial: '',
  isElectric: false,
  color: '',
  condition: '',
  usageMonths: '',
  images: [],
  price: '',
  originalPrice: '',
};

export interface CreateBicycleRequest {
  title: string;
  price: number;
  condition: BicycleCondition;
  categoryId: string;
  description?: string;
  originalPrice?: number;
  brandId?: string;
  images?: MediaItem[];
  specifications?: Record<string, unknown>;
  location?: Record<string, unknown>;
  usageMonths?: number;
}

// Options cho Step 2 dropdowns
export const ORIGIN_OPTIONS = [
  'Việt Nam', 'Nhật Bản', 'Đài Loan', 'Trung Quốc', 'Mỹ', 'Đức', 'Ý', 'Khác',
];

export const YEAR_OPTIONS = Array.from(
  { length: 30 },
  (_, i) => String(new Date().getFullYear() - i),
);

export const FRAME_SIZE_OPTIONS = [
  'XS (44-46cm)', 'S (46.5-50cm)', 'M (51-54cm)', 'L (55-58cm)', 'XL (59-62cm)', 'Khác',
];

export const FRAME_MATERIAL_OPTIONS = [
  'Nhôm', 'Thép', 'Carbon', 'Hợp kim Titan', 'Chromoly', 'Khác',
];

export const COLOR_OPTIONS = [
  'Đen', 'Trắng', 'Đỏ', 'Xanh dương', 'Xanh lá', 'Vàng', 'Bạc', 'Xám', 'Cam', 'Hồng', 'Khác',
];

// Mock data cho models (backend chưa có endpoint)
export const MOCK_MODELS: Record<string, BicycleModel[]> = {
  giant: [
    { _id: 'm1', name: 'TCR Advanced', brandId: 'giant' },
    { _id: 'm2', name: 'Defy Advanced', brandId: 'giant' },
    { _id: 'm3', name: 'Propel Advanced', brandId: 'giant' },
    { _id: 'm4', name: 'Contend', brandId: 'giant' },
    { _id: 'm5', name: 'Escape', brandId: 'giant' },
  ],
  trek: [
    { _id: 'm6', name: 'Madone', brandId: 'trek' },
    { _id: 'm7', name: 'Domane', brandId: 'trek' },
    { _id: 'm8', name: 'Émonda', brandId: 'trek' },
    { _id: 'm9', name: 'FX Sport', brandId: 'trek' },
  ],
  specialized: [
    { _id: 'm10', name: 'Tarmac', brandId: 'specialized' },
    { _id: 'm11', name: 'Roubaix', brandId: 'specialized' },
    { _id: 'm12', name: 'Allez', brandId: 'specialized' },
  ],
};
