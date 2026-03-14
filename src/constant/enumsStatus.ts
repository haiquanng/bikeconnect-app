import { OrderStatus } from '../types/order';
import { colors } from '../theme';
import { BicycleStatus } from '@/types/bicycle';

// my orders screen
const STATUS_LABEL: Record<OrderStatus, string> = {
  WAITING_SELLER_CONFIRMATION: 'Chờ xác nhận',
  CONFIRMED:                   'Đã xác nhận',
  WAITING_FOR_PICKUP:          'Chờ lấy hàng',
  RESERVED_FULL:               'Đã đặt chỗ',
  RESERVED_DEPOSIT:            'Đã đặt cọc',
  DEPOSIT_EXPIRED:             'Hết hạn đặt cọc',
  PAYMENT_TIMEOUT:             'Hết hạn thanh toán',
  REJECTED:                    'Bị từ chối',
  IN_TRANSIT:                  'Đang giao hàng',
  DELIVERED:                   'Đã giao',
  DEPOSIT_CONFIRMED:           'Chờ thanh toán',
  WAITING_REMAINING_PAYMENT:   'Chờ thanh toán',
  COMPLETED:                   'Hoàn thành',
  FUNDS_RELEASED:              'Hoàn thành',
  CANCELLED:                   'Đã huỷ',
  CANCELLED_BY_BUYER:          'Người mua huỷ',
  DISPUTED:                    'Tranh chấp',
};


const STATUS_COLOR: Record<OrderStatus, string> = {
  WAITING_SELLER_CONFIRMATION: colors.warning,
  CONFIRMED:                   colors.info,
  WAITING_FOR_PICKUP:          colors.info,
  RESERVED_FULL:               colors.primaryGreen,
  RESERVED_DEPOSIT:            colors.primaryGreen,
  DEPOSIT_EXPIRED:             colors.error,
  PAYMENT_TIMEOUT:             colors.error,
  REJECTED:                    colors.error,
  IN_TRANSIT:                  colors.info,
  DELIVERED:                   colors.success,
  DEPOSIT_CONFIRMED:           colors.warning,
  WAITING_REMAINING_PAYMENT:   colors.warning,
  COMPLETED:                   colors.success,
  FUNDS_RELEASED:              colors.success,
  CANCELLED:                   colors.error,
  CANCELLED_BY_BUYER:          colors.error,
  DISPUTED:                    colors.warning,
};

const STATUS_LABEL_SELLERS: Record<OrderStatus, string> = {
  WAITING_SELLER_CONFIRMATION: 'Xác nhận đơn',
  CONFIRMED:                   'Đã xác nhận',
  WAITING_FOR_PICKUP:          'Chờ lấy hàng',
  RESERVED_FULL:               'Đã đặt chỗ',
  RESERVED_DEPOSIT:            'Đã đặt cọc',
  DEPOSIT_EXPIRED:             'Hết hạn đặt cọc',
  PAYMENT_TIMEOUT:             'Hết hạn thanh toán',
  REJECTED:                    'Bị từ chối',
  IN_TRANSIT:                  'Đang giao hàng',
  DELIVERED:                   'Đã giao',
  DEPOSIT_CONFIRMED:           'Chờ thanh toán',
  WAITING_REMAINING_PAYMENT:   'Chờ thanh toán',
  COMPLETED:                   'Hoàn thành',
  FUNDS_RELEASED:              'Đã giải ngân',
  CANCELLED:                   'Đã huỷ',
  CANCELLED_BY_BUYER:          'Người mua huỷ',
  DISPUTED:                    'Tranh chấp',
};

// seller's listing screen
const STATUS_TABS: { label: string; value: BicycleStatus | undefined }[] = [
  { label: 'Tất cả', value: undefined },
  { label: 'Chờ duyệt', value: 'PENDING' },
  { label: 'Đang bán', value: 'APPROVED' },
  { label: 'Đã được đặt', value: 'RESERVED' },
  { label: 'Đã bán', value: 'SOLD' },
  { label: 'Bị ẩn', value: 'HIDDEN' },
  { label: 'Từ chối', value: 'REJECTED' },
  { label: 'Vi phạm', value: 'VIOLATED' },
];

const STATUS_CONFIG: Record<BicycleStatus, { label: string; color: string; bg: string }> = {
  PENDING:  { label: 'Chờ duyệt',  color: '#92400E', bg: '#FEF3C7' },
  APPROVED: { label: 'Đang bán',   color: '#065F46', bg: '#D1FAE5' },
  RESERVED: { label: 'Đã đặt',     color: '#1D4ED8', bg: '#DBEAFE' },
  SOLD:     { label: 'Đã bán',     color: '#374151', bg: '#F3F4F6' },
  HIDDEN:   { label: 'Bị ẩn',      color: '#6B7280', bg: '#F9FAFB' },
  REJECTED: { label: 'Từ chối',    color: '#991B1B', bg: '#FEE2E2' },
  VIOLATED: { label: 'Vi phạm',    color: '#7F1D1D', bg: '#FFE4E6' },
};

export { STATUS_LABEL, STATUS_COLOR, STATUS_LABEL_SELLERS, STATUS_TABS, STATUS_CONFIG };