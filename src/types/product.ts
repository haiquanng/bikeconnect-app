// Product Types
export interface Product {
  id: string;
  brandId: string;
  modelId: string;
  category: string;
  year: number;
  price: number;
  condition: string;
  frameSize: string;
  fitRange: string;
  inspectionStatus: string;
  listingStatus: string;
  media: {
    thumbnails: string[];
    slides: string[];
  };
  submittedBy: string;
  createdAt: string;
}

// Category Type
export interface BikeCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}
