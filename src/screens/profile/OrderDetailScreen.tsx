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
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { colors } from '../../theme';
import { orderService } from '../../api/orderService';
import { walletService } from '../../api/walletService';
import {
  violationReportService,
  ViolationType,
  VIOLATION_TYPE_LABELS,
} from '../../api/violationReportService';
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
  DEPOSIT_CONFIRMED:           'Đang giữ xe — Chờ thanh toán phần còn lại',
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
  DEPOSIT_CONFIRMED:           colors.warning,
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
  const [receiving, setReceiving] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportType, setReportType] = useState<ViolationType>('FRAUD');
  const [reportDesc, setReportDesc] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

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
      const needed = order.status === 'RESERVED_DEPOSIT'
        ? order.amounts.deposit
        : order.paymentType === 'DEPOSIT_10' && order.status === 'WAITING_SELLER_CONFIRMATION'
          ? order.amounts.total - order.amounts.deposit
          : order.amounts.total;

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

  const handleReceive = () => {
    Alert.alert(
      'Xác nhận nhận hàng',
      'Bạn đã nhận được hàng và đồng ý hoàn tất giao dịch?',
      [
        { text: 'Chưa', style: 'cancel' },
        {
          text: 'Đã nhận',
          onPress: async () => {
            try {
              setReceiving(true);
              const updated = await orderService.receiveOrder(orderId);
              setOrder(updated);
              Toast.show({ type: 'success', text1: 'Xác nhận thành công!', text2: 'Đơn hàng đã hoàn thành.' });
            } catch (e: any) {
              Alert.alert('Lỗi', e?.response?.data?.message ?? 'Không thể xác nhận');
            } finally {
              setReceiving(false);
            }
          },
        },
      ],
    );
  };

  const handleSubmitReport = async () => {
    if (!order) { return; }
    if (reportDesc.trim().length < 10) {
      Alert.alert('Thiếu thông tin', 'Mô tả tối thiểu 10 ký tự');
      return;
    }
    try {
      setSubmittingReport(true);
      await violationReportService.create({
        reportedUserId: order.seller._id,
        bicycleId:      order.bicycle._id,
        violationType:  reportType,
        description:    reportDesc.trim(),
      });
      setReportVisible(false);
      setReportDesc('');
      Toast.show({ type: 'success', text1: 'Đã gửi báo cáo', text2: 'Chúng tôi sẽ xem xét trong 24h.' });
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message ?? 'Không thể gửi báo cáo');
    } finally {
      setSubmittingReport(false);
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
  const isDepositPendingFull = order.paymentType === 'DEPOSIT_10' && order.status === 'DEPOSIT_CONFIRMED';
  const canPay = ['RESERVED_FULL', 'RESERVED_DEPOSIT', 'WAITING_REMAINING_PAYMENT', 'DEPOSIT_CONFIRMED'].includes(order.status);
  const canDeliver = order.status === 'DELIVERED';

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

        {/* Deposit info banner */}
        {order.paymentType === 'DEPOSIT_10' &&
          order.status === 'WAITING_SELLER_CONFIRMATION' && (
          <View style={styles.depositBanner}>
            <View style={styles.depositRow}>
              <Text style={styles.depositLabel}>Đã đặt cọc</Text>
              <Text style={styles.depositPaid}>{formatPrice(order.amounts.deposit)}</Text>
            </View>
            <View style={styles.depositRow}>
              <Text style={styles.depositLabel}>Còn lại cần thanh toán</Text>
              <Text style={styles.depositRemain}>
                {formatPrice(order.amounts.total - order.amounts.deposit)}
              </Text>
            </View>
            <Text style={styles.depositNote}>
              Thanh toán phần còn lại sau khi nhận hàng.
            </Text>
          </View>
        )}

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
          {/* <InfoRow label="Email"     value={order.seller.email} /> */}
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

      {/* 2-day warning — shown for all deposit cases needing payment */}
      {(isDepositPendingFull || order.status === 'WAITING_REMAINING_PAYMENT') && (
        <View style={styles.warningBanner}>
          <Icon name="warning-outline" size={16} color="#92400e" style={{ marginTop: 1 }} />
          <Text style={styles.warningText}>
            Lưu ý: Nếu trong 2 ngày bạn không thanh toán đủ, tiền cọc sẽ không được hoàn lại và chúng tôi không chịu trách nhiệm.
          </Text>
        </View>
      )}

      {/* Buyer action bar — pay / cancel */}
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
                : <Text style={styles.payBtnText}>
                    {(isDepositPendingFull || order.status === 'WAITING_REMAINING_PAYMENT')
                      ? 'Thanh toán phần còn lại'
                      : 'Thanh toán từ ví'}
                  </Text>
              }
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Buyer action bar — delivered */}
      {canDeliver && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.reportBtn, (receiving || submittingReport) && styles.btnDisabled]}
            onPress={() => setReportVisible(true)}
            disabled={receiving || submittingReport}
          >
            <Icon name="flag-outline" size={16} color={colors.error} />
            <Text style={styles.reportBtnText}>Báo cáo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.payBtn, receiving && styles.btnDisabled]}
            onPress={handleReceive}
            disabled={receiving || submittingReport}
          >
            {receiving
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.payBtnText}>Đã nhận hàng</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* Report Modal */}
      <Modal
        visible={reportVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Báo cáo tin đăng</Text>
              <TouchableOpacity onPress={() => setReportVisible(false)}>
                <Icon name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Lý do báo cáo</Text>
            <View style={styles.typeList}>
              {(Object.keys(VIOLATION_TYPE_LABELS) as ViolationType[]).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, reportType === type && styles.typeChipActive]}
                  onPress={() => setReportType(type)}
                >
                  <Text style={[styles.typeChipText, reportType === type && styles.typeChipTextActive]}>
                    {VIOLATION_TYPE_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Mô tả chi tiết</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập mô tả (tối thiểu 10 ký tự)..."
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={4}
              maxLength={2000}
              value={reportDesc}
              onChangeText={setReportDesc}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, submittingReport && styles.btnDisabled]}
              onPress={handleSubmitReport}
              disabled={submittingReport}
            >
              {submittingReport
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.submitBtnText}>Gửi báo cáo</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

  depositBanner: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 8,
  },
  depositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  depositLabel: { fontSize: 13, color: colors.textSecondary },
  depositPaid:  { fontSize: 13, fontWeight: '700', color: colors.primaryGreen },
  depositRemain:{ fontSize: 13, fontWeight: '700', color: colors.warning },
  depositNote:  { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  depositReminderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fffbeb',
    borderTopWidth: 1,
    borderTopColor: '#fde68a',
  },
  depositReminderText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  cancelBtnSmall: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnSmallText: { fontSize: 13, fontWeight: '600', color: colors.error },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fffbeb',
    borderTopWidth: 1,
    borderTopColor: '#fde68a',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
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

  reportBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reportBtnText: { fontSize: 14, fontWeight: '700', color: colors.error },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  modalLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 10 },
  typeList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
  },
  typeChipActive: { borderColor: colors.error, backgroundColor: '#fee2e2' },
  typeChipText: { fontSize: 13, color: colors.textSecondary },
  typeChipTextActive: { color: colors.error, fontWeight: '600' },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 96,
    marginBottom: 20,
  },
  submitBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
});

export default OrderDetailScreen;
