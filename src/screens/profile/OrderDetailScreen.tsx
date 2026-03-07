import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { colors } from '../../theme';
import { orderService } from '../../api/orderService';
import { walletService } from '../../api/walletService';
import type { Order, OrderStatus } from '../../types/order';

/* ─── Helpers ─── */
const STATUS_LABEL: Record<OrderStatus, string> = {
  WAITING_SELLER_CONFIRMATION: 'Chờ người bán xác nhận',
  CONFIRMED:                   'Người bán đã xác nhận',
  WAITING_FOR_PICKUP:          'Chờ lấy hàng',
  RESERVED_FULL:               'Đã đặt chỗ (100%)',
  RESERVED_DEPOSIT:            'Đã đặt cọc (10%)',
  DEPOSIT_EXPIRED:             'Hết hạn đặt cọc',
  PAYMENT_TIMEOUT:             'Hết giờ thanh toán',
  REJECTED:                    'Bị từ chối',
  IN_TRANSIT:                  'Đang giao hàng',
  DELIVERED:                   'Đã giao hàng',
  WAITING_REMAINING_PAYMENT:   'Chờ thanh toán phần còn lại',
  COMPLETED:                   'Hoàn thành',
  FUNDS_RELEASED:              'Đã hoàn tiền người bán',
  CANCELLED:                   'Đã huỷ',
  CANCELLED_BY_BUYER:          'Người mua huỷ đơn',
  DISPUTED:                    'Đang tranh chấp',
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
  WAITING_REMAINING_PAYMENT:   colors.warning,
  COMPLETED:                   colors.success,
  FUNDS_RELEASED:              colors.success,
  CANCELLED:                   colors.error,
  CANCELLED_BY_BUYER:          colors.error,
  DISPUTED:                    colors.warning,
};
  
const CANCELLABLE: OrderStatus[] = [
  'WAITING_SELLER_CONFIRMATION',
  'RESERVED_FULL',
  'RESERVED_DEPOSIT',
];


const formatPrice = (p: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const formatDateTime = (s?: string) => {
  if (!s) { return '—'; }
  const d = new Date(s);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/* ─── Small UI helpers ─── */
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const SectionCard = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Icon name={icon as any} size={18} color={colors.primaryGreen} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const PRE_PAYMENT_STATUSES = new Set(['RESERVED_FULL', 'RESERVED_DEPOSIT']);

/* ─── Main Screen ─── */
const OrderDetailScreen = ({ navigation, route }: any) => {
  const { orderId, paymentResult } = route.params as { orderId: string; paymentResult?: 'success' | 'failed' | 'cancelled' };

  const [order, setOrder]     = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying]   = useState(false);

  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show VNPay result toast once on mount
  useEffect(() => {
    if (paymentResult === 'success') {
      Toast.show({ type: 'success', text1: 'Thanh toán VNPay thành công!', text2: 'Đơn hàng đang chờ người bán xác nhận.' });
    } else if (paymentResult === 'failed') {
      Toast.show({ type: 'error', text1: 'Thanh toán thất bại', text2: 'Vui lòng thử lại hoặc chọn phương thức khác.' });
    }
    return () => {
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
      // If we just came from a successful VNPay payment and status hasn't updated yet,
      // schedule one retry after 3s to wait for IPN processing
      if (paymentResult === 'success' && PRE_PAYMENT_STATUSES.has(data.status)) {
        retryTimerRef.current = setTimeout(async () => {
          try {
            const refreshed = await orderService.getOrderById(orderId);
            setOrder(refreshed);
          } catch { /* silent */ }
        }, 3000);
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể tải đơn hàng', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [orderId, navigation, paymentResult]);

  useFocusEffect(
    useCallback(() => {
      fetchOrder();
      return () => {
        if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); }
      };
    }, [fetchOrder]),
  );

  const handleCancel = () => {
    Alert.alert(
      'Huỷ đơn hàng',
      'Bạn có chắc muốn huỷ đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Huỷ đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              const updated = await orderService.cancelOrder(orderId, 'Người mua huỷ đơn');
              setOrder(updated);
            } catch (e: any) {
              Alert.alert('Lỗi', e?.response?.data?.message ?? 'Không thể huỷ đơn');
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  const handlePay = async () => {
    if (!order) { return; }
    try {
      // Check wallet balance first
      const wallet = await walletService.getMyWallet();
      const available = walletService.availableBalance(wallet);
      const needed = order.status === 'RESERVED_DEPOSIT' ? order.amounts.deposit : order.amounts.total;

      if (available < needed) {
        const shortage = needed - available;
        Alert.alert(
          'Số dư không đủ',
          `Cần thêm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shortage)}.`,
          [
            { text: 'Nạp tiền', onPress: () => navigation.navigate('Wallet') },
            { text: 'Huỷ', style: 'cancel' },
          ],
        );
        return;
      }

      Alert.alert(
        'Xác nhận thanh toán',
        `Thanh toán ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(needed)} từ ví?`,
        [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Thanh toán',
            onPress: async () => {
              try {
                setPaying(true);
                const updated = await orderService.payOrder(order._id);
                setOrder(updated);
                Alert.alert('Thành công', 'Thanh toán thành công!');
              } catch (e: any) {
                Alert.alert('Lỗi', e?.response?.data?.message ?? 'Không thể thanh toán');
              } finally {
                setPaying(false);
              }
            },
          },
        ],
      );
    } catch {
      Alert.alert('Lỗi', 'Không thể kiểm tra số dư ví');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
      </View>
    );
  }

  if (!order) { return null; }

  const statusColor = STATUS_COLOR[order.status] ?? colors.textSecondary;
  const canCancel   = CANCELLABLE.includes(order.status);
  const canPay      = ['RESERVED_FULL', 'RESERVED_DEPOSIT', 'WAITING_REMAINING_PAYMENT'].includes(order.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Status hero */}
        <View style={[styles.statusHero, { borderLeftColor: statusColor }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <View style={styles.statusTextBox}>
            <Text style={[styles.statusLabel, { color: statusColor }]}>
              {STATUS_LABEL[order.status] ?? order.status}
            </Text>
            <Text style={styles.orderCode}>{order.orderCode}</Text>
          </View>
        </View>

        {/* Bike info */}
        <SectionCard title="Sản phẩm" icon="bicycle-outline">
          <View style={styles.bikeRow}>
            <View style={styles.bikeImageBox}>
              {order.bicycle.primaryImage ? (
                <Image
                  source={{ uri: order.bicycle.primaryImage }}
                  style={styles.bikeImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.bikeImageFallback}>
                  <Icon name="bicycle-outline" size={28} color={colors.gray[400]} />
                </View>
              )}
            </View>
            <View style={styles.bikeInfo}>
              <Text style={styles.bikeTitle} numberOfLines={3}>{order.bicycle.title}</Text>
              <Text style={styles.bikePrice}>{formatPrice(order.bicycle.price)}</Text>
            </View>
          </View>
        </SectionCard>

        {/* Price breakdown */}
        <SectionCard title="Tóm tắt giá" icon="receipt-outline">
          <InfoRow label="Giá xe"           value={formatPrice(order.amounts.pricing.finalPrice)} />
          <InfoRow label="Phí vận chuyển"   value={formatPrice(order.amounts.shippingFee ?? 0)} />
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, styles.bold]}>Tổng cộng</Text>
            <Text style={[styles.infoValue, styles.bold, { color: colors.primaryGreen }]}>
              {formatPrice(order.amounts.total)}
            </Text>
          </View>
          {order.paymentType === 'DEPOSIT_10' && order.amounts.deposit > 0 && (
            <InfoRow
              label="Số tiền đặt cọc (10%)"
              value={formatPrice(order.amounts.deposit)}
            />
          )}
        </SectionCard>

        {/* Seller info */}
        <SectionCard title="Người bán" icon="person-outline">
          <InfoRow label="Tên"       value={order.seller.fullName} />
          <InfoRow label="Email"     value={order.seller.email} />
          {order.seller.phone && (
            <InfoRow label="Điện thoại" value={order.seller.phone} />
          )}
        </SectionCard>

        {/* Timeline */}
        <SectionCard title="Lịch sử đơn" icon="time-outline">
          <InfoRow label="Ngày đặt"        value={formatDateTime(order.createdAt)} />
          {order.reservedAt && (
            <InfoRow label="Đã xác nhận"   value={formatDateTime(order.reservedAt)} />
          )}
          {order.sellerConfirmedAt && (
            <InfoRow label="Người bán xác nhận" value={formatDateTime(order.sellerConfirmedAt)} />
          )}
          {order.completedAt && (
            <InfoRow label="Hoàn thành"    value={formatDateTime(order.completedAt)} />
          )}
          {order.cancelledAt && (
            <InfoRow label="Ngày huỷ"      value={formatDateTime(order.cancelledAt)} />
          )}
          {order.cancelReason && (
            <InfoRow label="Lý do huỷ"    value={order.cancelReason} />
          )}
        </SectionCard>
      </ScrollView>

      {/* Buyer action bar */}
      {(canPay || canCancel) && (
        <View style={styles.bottomBar}>
          {canCancel && (
            <TouchableOpacity
              style={[styles.cancelBtn, cancelling && styles.btnDisabled]}
              onPress={handleCancel}
              disabled={cancelling || paying}
            >
              {cancelling
                ? <ActivityIndicator color={colors.error} />
                : <Text style={styles.cancelBtnText}>Huỷ đơn</Text>
              }
            </TouchableOpacity>
          )}
          {canPay && (
            <TouchableOpacity
              style={[styles.payBtn, paying && styles.btnDisabled]}
              onPress={handlePay}
              disabled={paying || cancelling}
            >
              {paying
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.payBtnText}>Thanh toán từ ví</Text>
              }
            </TouchableOpacity>
          )}
        </View>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.backgroundSecondary },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.primaryGreen,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  headerSpacer: { width: 36 },

  content: { padding: 16, gap: 12, paddingBottom: 100 },

  statusHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderLeftWidth: 4,
    gap: 12,
  },
  statusDot:     { width: 10, height: 10, borderRadius: 5 },
  statusTextBox: { flex: 1 },
  statusLabel:   { fontSize: 16, fontWeight: '700' },
  orderCode:     { fontSize: 12, color: colors.textSecondary, marginTop: 4, letterSpacing: 0.5 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle:  { fontSize: 15, fontWeight: '700', color: colors.textPrimary },

  bikeRow: { flexDirection: 'row', gap: 12 },
  bikeImageBox: {
    width: 88,
    height: 66,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    overflow: 'hidden',
  },
  bikeImage: { width: '100%', height: '100%' },
  bikeImageFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bikeInfo:  { flex: 1 },
  bikeTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, lineHeight: 20 },
  bikePrice: { fontSize: 15, fontWeight: '700', color: colors.primaryGreen, marginTop: 6 },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  infoValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '500', textAlign: 'right', flex: 1 },
  bold:      { fontWeight: '700', fontSize: 14, color: colors.textPrimary },
  divider:   { height: 1, backgroundColor: colors.gray[100], marginVertical: 4 },

  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 28,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: colors.error },
  payBtn: {
    flex: 2,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
  btnDisabled: { opacity: 0.5 },
});

export default OrderDetailScreen;
