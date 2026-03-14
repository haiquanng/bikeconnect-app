// Bicycle / Listing Types

export type BicycleCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
export type BicycleStatus = 'PENDING' | 'APPROVED' | 'RESERVED' | 'SOLD' | 'HIDDEN' | 'REJECTED' | 'VIOLATED';

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
  location?: {
    address?: string;
    ward?: string;
    wardCode?: string;
    district?: string;
    districtId?: number;
    city?: string;
    provinceId?: number;
  };
  images: MediaItem[];
  rejectionReason?: string;
  hasChangedSinceRejection?: boolean;
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
  brand: { _id: string; name: string };
  year?: number;
  isActive: boolean;
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
  // Location (GHN)
  city: string;
  provinceId: number | null;
  district: string;
  districtId: number | null;
  ward: string;
  wardCode: string;
  street: string;
  // Specs
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
  provinceId: null,
  district: '',
  districtId: null,
  ward: '',
  wardCode: '',
  street: '',
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

