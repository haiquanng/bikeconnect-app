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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { wishlistService, type WishlistItem } from '../../api/wishlistService';
import { showToast } from '../../utils/toast';
import { CONDITION_LABELS } from '../../constant/enums';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// ── Item card ──────────────────────────────────────────────
const WishlistCard = ({
  item,
  onPress,
  onRemove,
}: {
  item: WishlistItem;
  onPress: () => void;
  onRemove: () => void;
}) => {
  const bike = item.bicycle;
  const isSold = bike.status !== 'APPROVED';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrap}>
        {bike.primaryImage ? (
          <Image source={{ uri: bike.primaryImage }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <Icon name="bicycle-outline" size={36} color={colors.gray[300]} />
          </View>
        )}
        {isSold && (
          <View style={styles.soldBadge}>
            <Text style={styles.soldText}>Đã bán</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{bike.title}</Text>
        {bike.condition && (
          <Text style={styles.condition}>
            {CONDITION_LABELS[bike.condition] ?? bike.condition}
          </Text>
        )}
        <Text style={styles.price}>{formatPrice(bike.price)}</Text>
      </View>

      <TouchableOpacity
        style={styles.heartBtn}
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="heart" size={22} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ── Main screen ────────────────────────────────────────────
const WishlistScreen = ({ navigation }: any) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (nextPage: number, reset = false) => {
    if (nextPage === 1) reset ? setRefreshing(true) : setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await wishlistService.getWishlist(nextPage, 20);
      setItems(prev => nextPage === 1 ? res.items : [...prev, ...res.items]);
      setTotalPages(res.totalPages);
      setPage(nextPage);
    } catch {
      showToast('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(1); }, [load]));

  const handleRemove = (item: WishlistItem) => {
    Alert.alert(
      'Xoá khỏi yêu thích',
      `Bỏ lưu "${item.bicycle.title}"?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            try {
              await wishlistService.remove(item.bicycleId);
              setItems(prev => prev.filter(i => i._id !== item._id));
            } catch {
              showToast('Không thể xoá');
            }
          },
        },
      ],
    );
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
        <Text style={styles.headerTitle}>Yêu thích</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primaryGreen} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <WishlistCard
              item={item}
              onPress={() => navigation.navigate('BicycleDetail', { id: item.bicycleId })}
              onRemove={() => handleRemove(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="heart-outline" size={56} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>Chưa có xe yêu thích</Text>
              <Text style={styles.emptySubtitle}>Bấm tim trên trang chi tiết để lưu xe lại</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(1, true)}
              tintColor={colors.primaryGreen}
            />
          }
          contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  imageWrap: { position: 'relative', marginRight: 12 },
  image: { width: 80, height: 80, borderRadius: 10, backgroundColor: colors.gray[100] },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  soldBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 2,
    alignItems: 'center',
  },
  soldText: { color: colors.white, fontSize: 10, fontWeight: '600' },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  condition: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  price: { fontSize: 15, fontWeight: '700', color: colors.primaryGreen },
  heartBtn: { paddingLeft: 12 },
  separator: { height: 1, backgroundColor: colors.gray[100] },
  loadMore: { alignItems: 'center', paddingVertical: 16 },
  loadMoreText: { fontSize: 14, color: colors.primaryGreen, fontWeight: '500' },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
});

export default WishlistScreen;
