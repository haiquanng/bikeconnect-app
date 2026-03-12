import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { orderService } from '../../api/orderService';
import type { Order, OrderStatus } from '../../types/order';

const STATUS_LABEL: Record<OrderStatus, string> = {
  WAITING_SELLER_CONFIRMATION: 'Chờ xác nhận',
  CONFIRMED:                   'Đã xác nhận',
  WAITING_FOR_PICKUP:          'Chờ lấy hàng',
  RESERVED_FULL:               'Đã đặt chỗ (100%)',
  RESERVED_DEPOSIT:            'Đã đặt cọc (10%)',
  DEPOSIT_EXPIRED:             'Hết hạn đặt cọc',
  PAYMENT_TIMEOUT:             'Hết giờ thanh toán',
  REJECTED:                    'Đã từ chối',
  IN_TRANSIT:                  'Đang giao hàng',
  DELIVERED:                   'Đã giao hàng',
  DEPOSIT_CONFIRMED:           'Đang giữ xe — Chờ thanh toán phần còn lại',
  WAITING_REMAINING_PAYMENT:   'Chờ thanh toán phần còn lại',
  COMPLETED:                   'Hoàn thành',
  FUNDS_RELEASED:              'Đã hoàn tiền',
  CANCELLED:                   'Đã huỷ',
  CANCELLED_BY_BUYER:          'Người mua huỷ',
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

const formatPrice = (p: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const formatDateTime = (s?: string) => {
  if (!s) { return '—'; }
  const d = new Date(s);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

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

const SellerOrderDetailScreen = ({ navigation, route }: any) => {
  const { orderId } = route.params as { orderId: string };

  const [order, setOrder]     = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming]           = useState(false);
  const [rejecting, setRejecting]             = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason]       = useState('');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          setLoading(true);
          const data = await orderService.getOrderById(orderId);
          setOrder(data);
        } catch {
          Alert.alert('Lỗi', 'Không thể tải đơn hàng', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        } finally {
          setLoading(false);
        }
      })();
    }, [navigation, orderId]),
  );

  const handleConfirm = () => {
    Alert.alert(
      'Xác nhận đơn hàng',
      'Xác nhận bán xe này? Chúng tôi sẽ sắp xếp shipper đến lấy xe tại địa chỉ của bạn.',
      [
        { text: 'Để sau', style: 'cancel' },
        {
          text: 'Xác nhận ngay',
          onPress: async () => {
            try {
              setConfirming(true);
              const updated = await orderService.confirmOrder(orderId);
              setOrder(updated);
            } catch (e: any) {
              Alert.alert('Lỗi', e?.response?.data?.message ?? 'Không thể xác nhận đơn');
            } finally {
              setConfirming(false);
            }
          },
        },
      ],
    );
  };

  const handleReject = () => {
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      setRejecting(true);
      setRejectModalVisible(false);
      const updated = await orderService.rejectOrder(orderId, rejectReason.trim());
      setOrder(updated);
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message ?? 'Không thể từ chối đơn');
    } finally {
      setRejecting(false);
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

  const statusColor  = STATUS_COLOR[order.status] ?? colors.textSecondary;
  const canAct       = order.status === 'WAITING_SELLER_CONFIRMATION';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Status */}
        <View style={[styles.statusHero, { borderLeftColor: statusColor }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <View style={styles.statusTextBox}>
            <Text style={[styles.statusLabel, { color: statusColor }]}>
              {STATUS_LABEL[order.status] ?? order.status}
            </Text>
            <Text style={styles.orderCode}>{order.orderCode}</Text>
          </View>
        </View>

        {/* Action hint */}
        {canAct && (
          <View style={styles.hintBox}>
            <Icon name="information-circle-outline" size={18} color={colors.warning} />
            <Text style={styles.hintText}>
              Xác nhận để sàn sắp xếp shipper đến lấy xe và giao cho người mua.
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

        {/* Buyer info */}
        <SectionCard title="Người mua" icon="person-outline">
          <InfoRow label="Tên"         value={order.buyer.fullName} />
          <InfoRow label="Email"       value={order.buyer.email} />
          {order.buyer.phone && (
            <InfoRow label="Điện thoại" value={order.buyer.phone} />
          )}
        </SectionCard>

        {/* Price */}
        <SectionCard title="Tóm tắt giá" icon="receipt-outline">
          <InfoRow label="Giá xe"          value={formatPrice(order.amounts.pricing.finalPrice)} />
          <InfoRow label="Phí vận chuyển"  value={formatPrice(order.amounts.shippingFee ?? 0)} />
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, styles.bold]}>Tổng cộng</Text>
            <Text style={[styles.infoValue, styles.bold, { color: colors.primaryGreen }]}>
              {formatPrice(order.amounts.total)}
            </Text>
          </View>
        </SectionCard>

        {/* Timeline */}
        <SectionCard title="Lịch sử" icon="time-outline">
          <InfoRow label="Ngày đặt"          value={formatDateTime(order.createdAt)} />
          {order.sellerConfirmedAt && (
            <InfoRow label="Bạn đã xác nhận" value={formatDateTime(order.sellerConfirmedAt)} />
          )}
          {order.cancelledAt && (
            <InfoRow label="Ngày huỷ"        value={formatDateTime(order.cancelledAt)} />
          )}
          {order.cancelReason && (
            <InfoRow label="Lý do"           value={order.cancelReason} />
          )}
        </SectionCard>
      </ScrollView>

      {/* Action bar — only when pending confirmation */}
      {canAct && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.rejectBtn, (rejecting || confirming) && styles.btnDisabled]}
            onPress={handleReject}
            disabled={rejecting || confirming}
          >
            {rejecting
              ? <ActivityIndicator color={colors.error} />
              : <Text style={styles.rejectBtnText}>Từ chối</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, (confirming || rejecting) && styles.btnDisabled]}
            onPress={handleConfirm}
            disabled={confirming || rejecting}
          >
            {confirming
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.confirmBtnText}>Xác nhận đơn</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* Reject reason bottom sheet */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setRejectModalVisible(false)}>
          <Pressable style={styles.rejectSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Lý do từ chối</Text>
            <TextInput
              style={styles.rejectInput}
              placeholder="Nhập lý do từ chối đơn hàng..."
              placeholderTextColor={colors.gray[400]}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              autoFocus
            />
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.sheetCancelBtn}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.sheetCancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetConfirmBtn} onPress={submitReject}>
                <Text style={styles.sheetConfirmText}>Từ chối đơn</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
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
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 18, fontWeight: '700', color: colors.white,
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

  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  hintText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 20 },

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
    width: 88, height: 66,
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
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 28,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  rejectBtn: {
    flex: 1, height: 50, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.error,
    alignItems: 'center', justifyContent: 'center',
  },
  rejectBtnText: { fontSize: 15, fontWeight: '700', color: colors.error },
  confirmBtn: {
    flex: 2, height: 50, borderRadius: 12,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center', justifyContent: 'center',
  },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
  btnDisabled: { opacity: 0.5 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  rejectSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.gray[300],
    alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  rejectInput: {
    borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10,
    padding: 12, fontSize: 14, color: colors.textPrimary,
    minHeight: 80, textAlignVertical: 'top', marginBottom: 16,
  },
  sheetActions: { flexDirection: 'row', gap: 12 },
  sheetCancelBtn: {
    flex: 1, height: 48, borderRadius: 10,
    borderWidth: 1, borderColor: colors.gray[300],
    alignItems: 'center', justifyContent: 'center',
  },
  sheetCancelText: { fontSize: 15, color: colors.textSecondary },
  sheetConfirmBtn: {
    flex: 2, height: 48, borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: 'center', justifyContent: 'center',
  },
  sheetConfirmText: { fontSize: 15, fontWeight: '700', color: colors.white },
});

export default SellerOrderDetailScreen;
