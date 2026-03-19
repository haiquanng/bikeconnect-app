import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { notificationService, type AppNotification } from '../../api/notificationService';

// ── URL → screen ───────────────────────────────────────────
const resolveNavigation = (url: string | null): { screen: string; params?: Record<string, any> } | null => {
  if (!url) return null;
  const orderMatch = url.match(/^\/orders\/([^/]+)$/);
  if (orderMatch) return { screen: 'OrderDetail', params: { orderId: orderMatch[1] } };
  const listingMatch = url.match(/^\/my-bicycles\/([^/]+)$/);
  if (listingMatch) return { screen: 'BicycleDetail', params: { id: listingMatch[1] } };
  const chatMatch = url.match(/^\/chat\/([^/]+)$/);
  if (chatMatch) return { screen: 'ChatDetail', params: { conversationId: chatMatch[1] } };
  const map: Record<string, { screen: string; params?: Record<string, any> }> = {
    '/my-bicycles':  { screen: 'Listings' },
    '/wallet':       { screen: 'Wallet' },
    '/orders':       { screen: 'Orders' },
    '/profile':      { screen: 'Main', params: { screen: 'Profile' } },
    '/packages':     { screen: 'Package' },
    '/subscription': { screen: 'Package' },
  };
  return map[url] ?? null;
};

// ── Type → icon + color ────────────────────────────────────
const TYPE_ICON: Record<string, { icon: string; bg: string; color: string }> = {
  ORDER:                  { icon: 'receipt-outline',          bg: '#EFF6FF', color: '#3B82F6' },
  WALLET:                 { icon: 'wallet-outline',           bg: '#F0FDF4', color: '#22C55E' },
  LISTING:                { icon: 'bicycle-outline',          bg: '#FFF7ED', color: '#F97316' },
  CHAT:                   { icon: 'chatbubble-ellipses-outline', bg: '#FAF5FF', color: '#A855F7' },
  ACCOUNT:                { icon: 'person-outline',           bg: '#F0FDF4', color: '#10B981' },
  PROFILE:                { icon: 'person-circle-outline',    bg: '#F0FDF4', color: '#10B981' },
  INSPECTION_ASSIGNED:    { icon: 'shield-checkmark-outline', bg: '#FFF1F2', color: '#F43F5E' },
  INSPECTION_REQUESTED:   { icon: 'shield-outline',           bg: '#FFF1F2', color: '#F43F5E' },
  INSPECTION_COMPLETED:   { icon: 'shield-checkmark-outline', bg: '#FFF1F2', color: '#F43F5E' },
  SUBSCRIPTION:           { icon: 'star-outline',             bg: '#FEFCE8', color: '#EAB308' },
  NEW_BICYCLE_POSTED:     { icon: 'bicycle-outline',          bg: '#FFF7ED', color: '#F97316' },
  GENERAL:                { icon: 'information-circle-outline', bg: '#F1F5F9', color: '#64748B' },
};

const getTypeConfig = (type: string) =>
  TYPE_ICON[type] ?? TYPE_ICON.GENERAL;

// ── Time helper ────────────────────────────────────────────
const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days} ngày trước`;
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

// ── Notification item ──────────────────────────────────────
const NotificationItem = ({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: (item: AppNotification) => void;
}) => {
  const cfg = getTypeConfig(item.type);
  return (
    <TouchableOpacity
      style={[styles.item, !item.isRead && styles.itemUnread]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
        <Icon name={cfg.icon} size={20} color={cfg.color} />
      </View>

      <View style={styles.itemContent}>
        <View style={styles.itemRow}>
          <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
      </View>

      {!item.isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  );
};

// ── Main screen ────────────────────────────────────────────
const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (nextPage: number, reset = false) => {
    if (nextPage === 1) reset ? setRefreshing(true) : setLoading(true);
    else setLoadingMore(true);
    try {
      const data = await notificationService.getNotifications(nextPage, 20);
      setNotifications(prev => nextPage === 1 ? data.notifications : [...prev, ...data.notifications]);
      setUnreadCount(data.unreadCount);
      setTotalPages(data.pagination.totalPages);
      setPage(nextPage);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(1); }, [load]));

  const handlePress = async (item: AppNotification) => {
    if (!item.isRead) {
      notificationService.markAsRead(item.id).catch(() => {});
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    const nav = resolveNavigation(item.url);
    if (nav) navigation.navigate(nav.screen, nav.params);
  };

  const handleMarkAll = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const renderFooter = () => {
    if (loadingMore) return <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primaryGreen} />;
    if (page < totalPages) {
      return (
        <TouchableOpacity style={styles.loadMore} onPress={() => load(page + 1)}>
          <Text style={styles.loadMoreText}>Xem thêm</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Thông báo{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.readAllBtn}>Đọc tất cả</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primaryGreen} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <NotificationItem item={item} onPress={handlePress} />}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="notifications-off-outline" size={52} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
              <Text style={styles.emptySubtitle}>Các hoạt động về đơn hàng, ví và tin nhắn sẽ hiện ở đây</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(1, true)} tintColor={colors.primaryGreen} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={notifications.length === 0 ? { flex: 1 } : undefined}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F8F9FA' },
  header:       {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle:  { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  readAllBtn:   { fontSize: 13, color: colors.primaryGreen, fontWeight: '600', width: 60, textAlign: 'right' },
  item:         {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.white,
  },
  itemUnread:   { backgroundColor: '#F0FBF6' },
  iconWrap:     {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, flexShrink: 0,
  },
  itemContent:  { flex: 1 },
  itemRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  title:        { fontSize: 14, color: colors.textPrimary, flex: 1, marginRight: 8 },
  titleUnread:  { fontWeight: '600' },
  message:      { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  time:         { fontSize: 11, color: colors.textSecondary, flexShrink: 0, marginTop: 1 },
  dot:          { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primaryGreen, marginTop: 8, marginLeft: 6, flexShrink: 0 },
  separator:    { height: 1, backgroundColor: '#F3F4F6' },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 8 },
  emptyTitle:   { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  loadMore:     { alignItems: 'center', paddingVertical: 16 },
  loadMoreText: { fontSize: 14, color: colors.primaryGreen, fontWeight: '500' },
});

export default NotificationsScreen;
