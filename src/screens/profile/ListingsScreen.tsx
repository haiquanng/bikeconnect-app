import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { bicycleService } from '../../api/bicycleService';
import { colors } from '../../theme';
import type { BicycleListing, BicycleStatus } from '../../types/bicycle';
import { showToast } from '../../utils/toast';
import { STATUS_CONFIG, STATUS_TABS } from '../../constant/enumsStatus';
import { CONDITION_LABELS } from '../../constant/enums';

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
  const [activeIndex, setActiveIndex] = useState(0);

  const pagerRef = useRef<PagerView>(null);
  const tabsScrollRef = useRef<ScrollView>(null);
  const tabPositions = useRef<number[]>([]);

  const loadListings = useCallback(async (refresh = false) => {
    try {
      if (refresh) { setRefreshing(true); }
      else { setLoading(true); }
      const res = await bicycleService.getMyListings({
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

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

  const scrollTabIntoView = (index: number) => {
    const x = tabPositions.current[index] ?? 0;
    tabsScrollRef.current?.scrollTo({ x: Math.max(0, x - 60), animated: true });
  };

  const handleToggleStatus = (item: BicycleListing) => {
    const isHiding = item.status === 'APPROVED';
    Alert.alert(
      isHiding ? 'Ẩn tin đăng' : 'Hiện tin đăng',
      isHiding ? 'Tin đăng sẽ không còn hiển thị với người mua.' : 'Tin đăng sẽ hiển thị trở lại.',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await bicycleService.updateStatus(item._id, isHiding ? 'HIDDEN' : 'APPROVED');
              showToast(isHiding ? 'Đã ẩn tin đăng' : 'Đã hiện tin đăng');
              loadListings(true);
            } catch {
              showToast('Có lỗi khi ẩn tin đăng, hãy liên chúng tôi nếu lỗi vẫn tiếp diễn');
            }
          },
        },
      ],
    );
  };

  const handleDelete = (item: BicycleListing) => {
    Alert.alert(
      'Xóa tin đăng',
      'Bạn có chắc muốn xóa tin này? Hành động này không thể hoàn tác.',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await bicycleService.deleteBicycle(item._id);
              showToast('Đã xóa tin đăng');
              loadListings(true);
            } catch (e: any) {
              showToast(e?.response?.data?.message ?? 'Không thể xóa tin đăng');
            }
          },
        },
      ],
    );
  };

  const renderCard = ({ item }: { item: BicycleListing }) => {
    const status = STATUS_CONFIG[item.status] ?? { label: item.status, color: '#6B7280', bg: '#F3F4F6' };
    const primaryImage = item.images.find(img => img.isPrimary) ?? item.images[0];
    const canEdit = item.status === 'PENDING';
    const canDelete = item.status === 'PENDING';
    const canHide = item.status === 'APPROVED';
    const canShow = item.status === 'HIDDEN';
    const isReserved = item.status === 'RESERVED';
    const isRejected = item.status === 'REJECTED';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BicycleDetail', { id: item._id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardImageBox}>
          {primaryImage ? (
            <Image source={{ uri: primaryImage.url }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Icon name="image-outline" size={32} color={colors.gray[400]} />
            </View>
          )}
        </View>

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

          <View style={styles.cardBottom}>
            <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
            <View style={styles.cardActions}>
              {canEdit && (
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate('EditListing', { id: item._id })}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="create-outline" size={14} color={colors.primaryGreen} />
                  <Text style={styles.editBtnText}>Chỉnh sửa</Text>
                </TouchableOpacity>
              )}
              {canDelete && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="trash-outline" size={14} color="#991B1B" />
                  <Text style={styles.deleteBtnText}>Xóa</Text>
                </TouchableOpacity>
              )}
              {canHide && (
                <TouchableOpacity
                  style={styles.hideBtn}
                  onPress={() => handleToggleStatus(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="eye-off-outline" size={14} color="#6B7280" />
                  <Text style={styles.hideBtnText}>Ẩn</Text>
                </TouchableOpacity>
              )}
              {canShow && (
                <TouchableOpacity
                  style={styles.showBtn}
                  onPress={() => handleToggleStatus(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="eye-outline" size={14} color={colors.primaryGreen} />
                  <Text style={styles.showBtnText}>Hiện</Text>
                </TouchableOpacity>
              )}
              {isReserved && (
                <TouchableOpacity
                  style={styles.orderBtn}
                  onPress={() => navigation.navigate('SellerOrders')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="receipt-outline" size={14} color="#1D4ED8" />
                  <Text style={styles.orderBtnText}>Xem đơn hàng</Text>
                </TouchableOpacity>
              )}
              {isRejected && (
                <TouchableOpacity
                  style={styles.reportBtn}
                  onPress={() => navigation.navigate('InspectionReport', { bicycleId: item._id, bicycleTitle: item.title })}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="document-text-outline" size={14} color="#991B1B" />
                  <Text style={styles.reportBtnText}>Xem báo cáo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = (tabValue: BicycleStatus | undefined) => (
    <View style={styles.emptyContainer}>
      <Icon name="bicycle-outline" size={64} color={colors.gray[300]} />
      <Text style={styles.emptyTitle}>Chưa có tin đăng</Text>
      <Text style={styles.emptySubtitle}>
        {tabValue ? 'Không có tin ở trạng thái này' : 'Bắt đầu đăng xe để bán nhanh hơn'}
      </Text>
      {!tabValue && (
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn1} activeOpacity={0.7}>
          <Icon name="arrow-back" size={22} color={colors.white} />
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

      {/* Tab bar */}
      <ScrollView
        ref={tabsScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsRow}
        contentContainerStyle={styles.tabsContent}
      >
        {STATUS_TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <TouchableOpacity
              key={tab.label}
              style={styles.tab}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.7}
              onLayout={e => { tabPositions.current[index] = e.nativeEvent.layout.x; }}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      ) : (
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageSelected={handlePageSelected}
        >
          {STATUS_TABS.map((tab, index) => {
            const data = tab.value ? listings.filter(l => l.status === tab.value) : listings;
            return (
              <View key={index} style={styles.page}>
                <FlatList
                  data={data}
                  keyExtractor={item => item._id}
                  renderItem={renderCard}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={() => renderEmpty(tab.value)}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={() => loadListings(true)}
                      tintColor={colors.primaryGreen}
                    />
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
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primaryGreen,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
  },
  headerBtn1: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  tabsRow: {
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[200],
    flexGrow: 0,
  },
  tabsContent: {
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primaryGreen,
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primaryGreen,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
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
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  cardDate: {
    fontSize: 11,
    color: colors.gray[400],
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#991B1B',
  },
  deleteBtnText: { fontSize: 11, fontWeight: '600', color: '#991B1B' },
  hideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  hideBtnText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  showBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primaryGreen,
  },
  showBtnText: { fontSize: 11, fontWeight: '600', color: colors.primaryGreen },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1D4ED8',
  },
  orderBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primaryGreen,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryGreen,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#991B1B',
  },
  reportBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#991B1B',
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
