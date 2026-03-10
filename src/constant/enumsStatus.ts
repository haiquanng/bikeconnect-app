import { OrderStatus } from '../types/order';
import { colors } from '../theme';

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

export { STATUS_LABEL, STATUS_COLOR };