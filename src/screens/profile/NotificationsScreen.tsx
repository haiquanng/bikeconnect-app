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

// ── URL → React Navigation mapping ────────────────────────
const resolveNavigation = (url: string | null): { screen: string; params?: Record<string, any> } | null => {
  if (!url) return null;

  // /orders/:id
  const orderMatch = url.match(/^\/orders\/([^/]+)$/);
  if (orderMatch) return { screen: 'OrderDetail', params: { orderId: orderMatch[1] } };

  // /my-bicycles/:id
  const listingMatch = url.match(/^\/my-bicycles\/([^/]+)$/);
  if (listingMatch) return { screen: 'BicycleDetail', params: { id: listingMatch[1] } };

  // /chat/:id
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
}) => (
  <TouchableOpacity
    style={[styles.item, !item.isRead && styles.itemUnread]}
    onPress={() => onPress(item)}
    activeOpacity={0.7}
  >
    <View style={styles.iconWrap}>
      <Icon name="notifications" size={20} color={item.isRead ? colors.textSecondary : colors.primaryGreen} />
    </View>
    <View style={styles.itemContent}>
      <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
      <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
    </View>
    {!item.isRead && <View style={styles.dot} />}
  </TouchableOpacity>
);

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
      const data = await notificationService.getNotifications(nextPage, 10);
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
      notificationService.markAsRead(item.id);
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    const nav = resolveNavigation(item.url);
    if (nav) {
      navigation.navigate(nav.screen, nav.params);
    }
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Thông báo{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAll}>
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
              <Icon name="notifications-off-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(1, true)}
              tintColor={colors.primaryGreen}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:  { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  readAllBtn:   { fontSize: 13, color: colors.primaryGreen, fontWeight: '500', width: 60, textAlign: 'right' },
  item:         { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.white },
  itemUnread:   { backgroundColor: '#F0FBF4' },
  iconWrap:     { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  itemContent:  { flex: 1 },
  title:        { fontSize: 14, color: colors.textPrimary, marginBottom: 3 },
  titleUnread:  { fontWeight: '600' },
  message:      { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  time:         { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  dot:          { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primaryGreen, marginTop: 6, marginLeft: 8 },
  separator:    { height: 1, backgroundColor: '#F3F4F6', marginLeft: 64 },
  empty:        { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText:    { fontSize: 14, color: colors.textSecondary },
  loadMore:     { alignItems: 'center', paddingVertical: 16 },
  loadMoreText: { fontSize: 14, color: colors.primaryGreen, fontWeight: '500' },
});

export default NotificationsScreen;
