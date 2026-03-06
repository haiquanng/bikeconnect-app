import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import PagerView from 'react-native-pager-view';
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
  RESERVED_FULL:               'Đã đặt chỗ',
  RESERVED_DEPOSIT:            'Đã đặt cọc',
  DEPOSIT_EXPIRED:             'Hết hạn đặt cọc',
  PAYMENT_TIMEOUT:             'Hết giờ thanh toán',
  REJECTED:                    'Đã từ chối',
  IN_TRANSIT:                  'Đang giao hàng',
  DELIVERED:                   'Đã giao',
  WAITING_REMAINING_PAYMENT:   'Chờ thanh toán tiếp',
  COMPLETED:                   'Hoàn thành',
  FUNDS_RELEASED:              'Đã hoàn tiền',
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
  WAITING_REMAINING_PAYMENT:   colors.warning,
  COMPLETED:                   colors.success,
  FUNDS_RELEASED:              colors.success,
  CANCELLED:                   colors.error,
  CANCELLED_BY_BUYER:          colors.error,
  DISPUTED:                    colors.warning,
};

type TabKey = 'all' | 'pending' | 'processing' | 'completed' | 'cancelled';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',        label: 'Tất cả' },
  { key: 'pending',    label: 'Chờ xác nhận' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'completed',  label: 'Hoàn tất' },
  { key: 'cancelled',  label: 'Đã huỷ' },
];

const TAB_STATUSES: Record<TabKey, OrderStatus[] | null> = {
  all:        null,
  pending:    ['WAITING_SELLER_CONFIRMATION'],
  processing: ['CONFIRMED', 'WAITING_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'WAITING_REMAINING_PAYMENT'],
  completed:  ['COMPLETED', 'FUNDS_RELEASED'],
  cancelled:  ['CANCELLED', 'CANCELLED_BY_BUYER', 'REJECTED', 'DEPOSIT_EXPIRED', 'PAYMENT_TIMEOUT'],
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const OrderCard = ({ order, onPress }: { order: Order; onPress: () => void }) => {
  const statusLabel = STATUS_LABEL[order.status] ?? order.status;
  const statusColor = STATUS_COLOR[order.status] ?? colors.textSecondary;
  const needsAction = order.status === 'WAITING_SELLER_CONFIRMATION';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {needsAction && (
        <View style={styles.actionBanner}>
          <Icon name="alert-circle-outline" size={14} color={colors.white} />
          <Text style={styles.actionBannerText}>Cần xác nhận</Text>
        </View>
      )}

      <View style={styles.cardTop}>
        <Text style={styles.orderCode}>{order.orderCode}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.bikeImageBox}>
          {order.bicycle.primaryImage ? (
            <Image source={{ uri: order.bicycle.primaryImage }} style={styles.bikeImage} resizeMode="cover" />
          ) : (
            <View style={styles.bikeImageFallback}>
              <Icon name="bicycle-outline" size={24} color={colors.gray[400]} />
            </View>
          )}
        </View>
        <View style={styles.bikeInfo}>
          <Text style={styles.bikeTitle} numberOfLines={2}>{order.bicycle.title}</Text>
          <Text style={styles.buyerLabel}>
            Người mua: <Text style={styles.buyerName}>{order.buyer.fullName}</Text>
          </Text>
          <Text style={styles.bikePrice}>{formatPrice(order.amounts.total)}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
        <View style={styles.footerRight}>
          <Text style={styles.viewDetail}>{needsAction ? 'Xác nhận ngay' : 'Xem chi tiết'}</Text>
          <Icon name="chevron-forward" size={14} color={colors.primaryGreen} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SellerOrdersScreen = ({ navigation }: any) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  const pagerRef      = useRef<PagerView>(null);
  const tabsScrollRef = useRef<ScrollView>(null);
  const tabPositions  = useRef<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders({ role: 'seller', limit: 100 });
      setOrders(res.data.orders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await orderService.getMyOrders({ role: 'seller', limit: 100 });
      setOrders(res.data.orders);
    } catch { /* ignore */ }
    finally { setRefreshing(false); }
  };

  const scrollTabIntoView = (index: number) => {
    const x = tabPositions.current[index] ?? 0;
    tabsScrollRef.current?.scrollTo({ x: Math.max(0, x - 60), animated: true });
  };

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
    scrollTabIntoView(index);
  };

  const handlePageSelected = (e: any) => {
    const index = e.nativeEvent.position;
    setActiveIndex(index);
    scrollTabIntoView(index);
  };

  const pendingCount = orders.filter(o => o.status === 'WAITING_SELLER_CONFIRMATION').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Đơn bán hàng</Text>
          {pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          ref={tabsScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {TABS.map((tab, index) => {
            const isActive = index === activeIndex;
            const isPending = tab.key === 'pending' && pendingCount > 0;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tab}
                onPress={() => handleTabPress(index)}
                onLayout={e => { tabPositions.current[index] = e.nativeEvent.layout.x; }}
                activeOpacity={0.75}
              >
                <View style={styles.tabLabelRow}>
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                  {isPending && !isActive && <View style={styles.tabDot} />}
                </View>
                {isActive && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.divider} />

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      ) : (
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={handlePageSelected}
        >
          {TABS.map((tab, index) => {
            const data = tab.key === 'all'
              ? orders
              : orders.filter(o => (TAB_STATUSES[tab.key] ?? []).includes(o.status));
            return (
              <View key={index} style={styles.page}>
                <FlatList
                  data={data}
                  keyExtractor={item => item._id}
                  renderItem={({ item }) => (
                    <OrderCard
                      order={item}
                      onPress={() => navigation.navigate('SellerOrderDetail', { orderId: item._id })}
                    />
                  )}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={[colors.primaryGreen]}
                      tintColor={colors.primaryGreen}
                    />
                  }
                  ListEmptyComponent={
                    <View style={styles.emptyBox}>
                      <Icon name="receipt-outline" size={60} color={colors.gray[300]} />
                      <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
                    </View>
                  }
                />
              </View>
            );
          })}
        </PagerView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.primaryGreen,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitleBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.white, textAlign: 'center' },
  headerSpacer: { width: 36 },
  badge: {
    backgroundColor: colors.error, borderRadius: 10,
    minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.white },

  tabsWrapper: { backgroundColor: colors.white },
  tabsContent: { paddingHorizontal: 12 },
  tab: { paddingHorizontal: 12, paddingVertical: 14, alignItems: 'center', position: 'relative' },
  tabLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabText: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
  tabTextActive: { color: colors.primaryGreen, fontWeight: '700' },
  tabDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.warning },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: 12, right: 12,
    height: 2.5, borderRadius: 2, backgroundColor: colors.primaryGreen,
  },
  divider: { height: 1, backgroundColor: colors.gray[100] },

  pager: { flex: 1 },
  page:  { flex: 1 },
  listContent: { padding: 16, gap: 12, paddingBottom: 40 },

  card: {
    backgroundColor: colors.white, borderRadius: 12,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.gray[200],
  },
  actionBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.warning, paddingHorizontal: 14, paddingVertical: 6,
  },
  actionBannerText: { fontSize: 12, fontWeight: '600', color: colors.white },

  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8,
  },
  orderCode: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, letterSpacing: 0.5 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },

  cardBody: { flexDirection: 'row', gap: 12, paddingHorizontal: 14, paddingBottom: 10 },
  bikeImageBox: { width: 72, height: 56, borderRadius: 8, backgroundColor: colors.gray[100], overflow: 'hidden' },
  bikeImage: { width: '100%', height: '100%' },
  bikeImageFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bikeInfo: { flex: 1 },
  bikeTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, lineHeight: 18 },
  buyerLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  buyerName: { fontWeight: '600', color: colors.textPrimary },
  bikePrice: { fontSize: 14, fontWeight: '700', color: colors.primaryGreen, marginTop: 4 },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.gray[100],
  },
  dateText: { fontSize: 12, color: colors.textTertiary },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  viewDetail: { fontSize: 13, fontWeight: '600', color: colors.primaryGreen },

  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16, color: colors.textSecondary },
});

export default SellerOrdersScreen;
