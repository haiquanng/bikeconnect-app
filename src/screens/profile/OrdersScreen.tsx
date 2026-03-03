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
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { orderService } from '../../api/orderService';
import type { Order, OrderStatus } from '../../types/order';

/* ─── Status helpers ─── */
const STATUS_LABEL: Record<OrderStatus, string> = {
  WAITING_SELLER_CONFIRMATION: 'Chờ xác nhận',
  CONFIRMED:                   'Đã xác nhận',
  WAITING_FOR_PICKUP:          'Chờ lấy hàng',
  RESERVED_FULL:               'Đã đặt chỗ',
  RESERVED_DEPOSIT:            'Đã đặt cọc',
  DEPOSIT_EXPIRED:             'Hết hạn đặt cọc',
  PAYMENT_TIMEOUT:             'Hết giờ thanh toán',
  REJECTED:                    'Bị từ chối',
  IN_TRANSIT:                  'Đang giao hàng',
  DELIVERED:                   'Đã giao',
  WAITING_REMAINING_PAYMENT:   'Chờ thanh toán tiếp',
  COMPLETED:                   'Hoàn thành',
  FUNDS_RELEASED:              'Đã hoàn tiền người bán',
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

/* ─── Tab definitions ─── */
type TabKey = 'all' | 'pending' | 'shipping' | 'completed' | 'cancelled' | 'refund';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',       label: 'Tất cả' },
  { key: 'pending',   label: 'Đang chờ' },
  { key: 'shipping',  label: 'Đang giao' },
  { key: 'completed', label: 'Hoàn tất' },
  { key: 'cancelled', label: 'Đã huỷ' },
  { key: 'refund',    label: 'Hoàn tiền' },
];

const TAB_STATUSES: Record<TabKey, OrderStatus[] | null> = {
  all:       null,
  pending:   ['WAITING_SELLER_CONFIRMATION', 'CONFIRMED', 'WAITING_FOR_PICKUP', 'RESERVED_FULL', 'RESERVED_DEPOSIT', 'WAITING_REMAINING_PAYMENT'],
  shipping:  ['IN_TRANSIT', 'DELIVERED'],
  completed: ['COMPLETED', 'FUNDS_RELEASED'],
  cancelled: ['CANCELLED', 'CANCELLED_BY_BUYER', 'REJECTED', 'DEPOSIT_EXPIRED', 'PAYMENT_TIMEOUT'],
  refund:    ['DISPUTED'],
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

/* ─── Order Card ─── */
const OrderCard = ({ order, onPress }: { order: Order; onPress: () => void }) => {
  const statusLabel = STATUS_LABEL[order.status] ?? order.status;
  const statusColor = STATUS_COLOR[order.status] ?? colors.textSecondary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <Text style={styles.orderCode}>{order.orderCode}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.bikeImageBox}>
          {order.bicycle.primaryImage ? (
            <Image
              source={{ uri: order.bicycle.primaryImage }}
              style={styles.bikeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.bikeImageFallback}>
              <Icon name="bicycle-outline" size={24} color={colors.gray[400]} />
            </View>
          )}
        </View>

        <View style={styles.bikeInfo}>
          <Text style={styles.bikeTitle} numberOfLines={2}>{order.bicycle.title}</Text>
          <Text style={styles.bikePrice}>{formatPrice(order.amounts.total)}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
        <View style={styles.footerRight}>
          <Text style={styles.viewDetail}>Xem chi tiết</Text>
          <Icon name="chevron-forward" size={14} color={colors.primaryGreen} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

/* ─── Main Screen ─── */
const OrdersScreen = ({ navigation }: any) => {
  const [activeIndex, setActiveIndex]   = useState(0);
  const [orders, setOrders]             = useState<Order[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  const pagerRef      = useRef<PagerView>(null);
  const tabsScrollRef = useRef<ScrollView>(null);
  const tabPositions  = useRef<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, []),
  );

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders({ role: 'buyer', limit: 100 });
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
      const res = await orderService.getMyOrders({ role: 'buyer', limit: 100 });
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn mua của tôi</Text>
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
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tab}
                onPress={() => handleTabPress(index)}
                onLayout={e => { tabPositions.current[index] = e.nativeEvent.layout.x; }}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
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
                  keyExtractor={o => o._id}
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
                  renderItem={({ item }) => (
                    <OrderCard
                      order={item}
                      onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
                    />
                  )}
                  ListEmptyComponent={
                    <View style={styles.empty}>
                      <Icon name="document-text-outline" size={64} color={colors.gray[300]} />
                      <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
                      <Text style={styles.emptyDesc}>
                        {tab.key === 'all'
                          ? 'Bắt đầu mua sắm để xem đơn hàng ở đây'
                          : 'Không có đơn hàng nào trong mục này'}
                      </Text>
                      {tab.key === 'all' && (
                        <TouchableOpacity
                          style={styles.shopBtn}
                          onPress={() => navigation.navigate('Main', { screen: 'Shop' })}
                        >
                          <Text style={styles.shopBtnText}>Khám phá xe đạp</Text>
                        </TouchableOpacity>
                      )}
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

  tabsWrapper: { backgroundColor: colors.white },
  tabsContent: { paddingHorizontal: 12 },
  tab: { paddingHorizontal: 12, paddingVertical: 14, alignItems: 'center', position: 'relative' },
  tabText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: colors.primaryGreen, fontWeight: '700' },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.primaryGreen,
  },
  divider: { height: 1, backgroundColor: colors.gray[100] },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pager: { flex: 1 },
  page:  { flex: 1 },
  listContent: { padding: 16, gap: 12, paddingBottom: 80 },

  /* Order Card */
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderCode:   { fontSize: 12, color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  statusText:  { fontSize: 12, fontWeight: '600' },

  cardBody: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  bikeImageBox: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    overflow: 'hidden',
  },
  bikeImage: { width: '100%', height: '100%' },
  bikeImageFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bikeInfo:  { flex: 1, justifyContent: 'space-between' },
  bikeTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, lineHeight: 20 },
  bikePrice: { fontSize: 15, fontWeight: '700', color: colors.primaryGreen },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  dateText:    { fontSize: 12, color: colors.textSecondary },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewDetail:  { fontSize: 13, color: colors.primaryGreen, fontWeight: '600' },

  /* Empty */
  empty: { alignItems: 'center', paddingTop: 80, gap: 8, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  emptyDesc:  { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  shopBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primaryGreen,
  },
  shopBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
});

export default OrdersScreen;
