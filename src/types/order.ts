export type OrderStatus =
  | 'RESERVED_FULL'
  | 'RESERVED_DEPOSIT'
  | 'DEPOSIT_EXPIRED'
  | 'PAYMENT_TIMEOUT'
  | 'WAITING_SELLER_CONFIRMATION'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'WAITING_FOR_PICKUP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'DEPOSIT_CONFIRMED'
  | 'WAITING_REMAINING_PAYMENT'
  | 'COMPLETED'
  | 'FUNDS_RELEASED'
  | 'CANCELLED'
  | 'CANCELLED_BY_BUYER'
  | 'DISPUTED';

export type PaymentType = 'DEPOSIT_10' | 'FULL_100';

export interface OrderPricing {
  originalPrice: number;
  discountAmount: number;
  discountPercent: number;
  discountReason?: string;
  finalPrice: number;
}

export interface OrderAmounts {
  total: number;
  deposit: number;
  shippingFee: number;
  pricing: OrderPricing;
  depositPaid: number;
  remainingPaid: number;
  escrowAmount: number;
  releasedAmount: number;
}

export interface OrderUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface OrderBicycle {
  _id: string;
  title: string;
  price: number;
  primaryImage?: string;
  condition?: string;
}

export interface Order {
  _id: string;
  orderCode: string;
  status: OrderStatus;
  paymentType: PaymentType;
  buyer: OrderUser;
  seller: OrderUser;
  bicycle: OrderBicycle;
  amounts: OrderAmounts;
  review?: { rating: number; comment: string; createdAt: string };
  reservedAt?: string;
  reservationExpiresAt?: string;
  sellerConfirmedAt?: string;
  buyerConfirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderParams {
  bicycleId: string;
  paymentType: PaymentType;
  shippingAddressId: string;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

export interface OrdersListResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: { page: number; limit: number; total: number };
  };
}

export type MyOrdersRole = 'buyer' | 'seller' | 'all';
