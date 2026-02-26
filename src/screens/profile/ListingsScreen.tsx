import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { bicycleService } from '../../api/bicycleService';
import { colors } from '../../theme';
import type { BicycleListing, BicycleStatus } from '../../types/bicycle';

const STATUS_TABS: { label: string; value: BicycleStatus | undefined }[] = [
  { label: 'Tất cả', value: undefined },
  { label: 'Chờ duyệt', value: 'PENDING' },
  { label: 'Đang bán', value: 'APPROVED' },
  { label: 'Đã bán', value: 'SOLD' },
  { label: 'Bị ẩn', value: 'HIDDEN' },
  { label: 'Từ chối', value: 'REJECTED' },
];

const STATUS_CONFIG: Record<BicycleStatus, { label: string; color: string; bg: string }> = {
  PENDING:  { label: 'Chờ duyệt',  color: '#92400E', bg: '#FEF3C7' },
  APPROVED: { label: 'Đang bán',   color: '#065F46', bg: '#D1FAE5' },
  SOLD:     { label: 'Đã bán',     color: '#374151', bg: '#F3F4F6' },
  HIDDEN:   { label: 'Bị ẩn',      color: '#6B7280', bg: '#F9FAFB' },
  REJECTED: { label: 'Từ chối',    color: '#991B1B', bg: '#FEE2E2' },
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Mới', LIKE_NEW: 'Như mới', GOOD: 'Tốt', FAIR: 'Khá', POOR: 'Cũ',
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const ListingsScreen = ({ navigation }: any) => {
  const [listings, setListings] = useState<BicycleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeStatus, setActiveStatus] = useState<BicycleStatus | undefined>(undefined);

  const loadListings = useCallback(async (refresh = false) => {
    try {
      if (refresh) {setRefreshing(true);}
      else {setLoading(true);}
      const res = await bicycleService.getMyListings({
        status: activeStatus,
        sort: '-createdAt',
        limit: 50,
      });
      setListings(res.data);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeStatus]);

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [loadListings]),
  );

  const renderCard = ({ item }: { item: BicycleListing }) => {
    const status = STATUS_CONFIG[item.status];
    const primaryImage = item.images.find(img => img.isPrimary) ?? item.images[0];

    return (
      <View style={styles.card}>
        {/* Image */}
        <View style={styles.cardImageBox}>
          {primaryImage ? (
            <Image source={{ uri: primaryImage.url }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Icon name="image-outline" size={32} color={colors.gray[400]} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>

          <View style={styles.cardMeta}>
            <Text style={styles.cardMetaText}>{CONDITION_LABELS[item.condition] ?? item.condition}</Text>
            {item.location?.city && (
              <>
                <Text style={styles.cardMetaDot}>·</Text>
                <Text style={styles.cardMetaText}>{item.location.city}</Text>
              </>
            )}
            <Text style={styles.cardMetaDot}>·</Text>
            <Icon name="eye-outline" size={12} color={colors.textTertiary} />
            <Text style={styles.cardMetaText}> {item.viewCount}</Text>
          </View>

          <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bicycle-outline" size={64} color={colors.gray[300]} />
      <Text style={styles.emptyTitle}>Chưa có tin đăng</Text>
      <Text style={styles.emptySubtitle}>
        {activeStatus ? 'Không có tin ở trạng thái này' : 'Bắt đầu đăng xe để bán nhanh hơn'}
      </Text>
      {!activeStatus && (
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => navigation.navigate('CreateListing')}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyBtnText}>Đăng tin ngay</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} activeOpacity={0.7}>
          <Icon name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sản phẩm đang bán</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('CreateListing')}
          activeOpacity={0.7}
        >
          <Icon name="add" size={24} color={colors.primaryGreen} />
        </TouchableOpacity>
      </View>

      {/* Status filter tabs */}
      <FlatList
        horizontal
        data={STATUS_TABS}
        keyExtractor={item => item.label}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
        style={styles.tabsRow}
        renderItem={({ item: tab }) => {
          const isActive = tab.value === activeStatus;
          return (
            <TouchableOpacity
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveStatus(tab.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={item => item._id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadListings(true)}
              tintColor={colors.primaryGreen}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tabsRow: {
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
    flexGrow: 0,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  tabActive: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardImageBox: {
    width: 110,
    height: 110,
    backgroundColor: colors.gray[100],
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryGreen,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 3,
  },
  cardMetaDot: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  cardMetaText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  cardDate: {
    fontSize: 11,
    color: colors.gray[400],
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});

export default ListingsScreen;
