import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '../../redux/hooks';
import { colors } from '../../theme';
import { bicycleService } from '../../api/bicycleService';
import { categoryService } from '../../api/categoryService';
import type { BicycleListing } from '../../types/bicycle';
import type { Category } from '../../types/category';
import BicycleFeaturedCard from '../../components/molecules/BicycleFeaturedCard';
import BicycleListCard from '../../components/molecules/BicycleListCard';
import { SCROLL_TO_TOP_EVENT } from '../../components/organisms/CustomTabBar';

const HomeHeader = ({
  user,
  onNotification,
}: {
  user: any;
  onNotification: () => void;
}) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <Image
        source={{
          uri:
            user?.avatarUrl ||
            'https://api.dicebear.com/9.x/adventurer/svg?seed=Easton',
        }}
        style={styles.avatar}
      />
      <View>
        <Text style={styles.greeting}>Xin chào 👋</Text>
        <Text style={styles.userName}>{user?.fullName || 'Người dùng'}</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.iconButton} onPress={onNotification}>
      <Icon name="notifications-outline" size={24} color={colors.textPrimary} />
      <View style={styles.badge} />
    </TouchableOpacity>
  </View>
);

const HomeSearchBar = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    style={styles.searchBar}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Icon name="search-outline" size={20} color={colors.gray[400]} />
    <Text style={styles.searchPlaceholder}>Tìm kiếm xe đạp...</Text>
  </TouchableOpacity>
);

/* ─── Hot banner ─── */
const HomeBanner = ({ width }: { width: number }) => (
  <View style={styles.section}>
    <View style={[styles.bannerCard, { width: width - 32 }]}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerBadge}>Chọn xe cho bạn</Text>
        <Text style={styles.bannerTitle}>Xe đạp giá tốt</Text>
        <Text style={styles.bannerSub}>Mua bán xe đạp uy tín</Text>
      </View>
      <Image
        source={{
          uri: 'https://cdn.chotot.com/hu4kInagzHTL4VwtoIVHCdn2OwEm2gCJCNmwMNhISP0/preset:view/plain/a1a0fc6376515d7dff954516fba9dd06-2964946847987595881.jpg',
        }}
        style={styles.bannerImage}
        resizeMode="contain"
      />
    </View>
  </View>
);

const HomeCategoryItem = ({
  category,
  onPress,
}: {
  category: Category;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.categoryItem}
    onPress={onPress}
    activeOpacity={0.75}
  >
    {category.imageUrl ? (
      <Image
        source={{ uri: category.imageUrl }}
        style={styles.categoryImage}
        resizeMode="cover"
      />
    ) : (
      <View style={styles.categoryIconBox}>
        <Icon name="bicycle-outline" size={26} color={colors.primaryGreen} />
      </View>
    )}
    <Text style={styles.categoryName} numberOfLines={2}>
      {category.name}
    </Text>
  </TouchableOpacity>
);

const SectionHeader = ({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAll}>Xem tất cả</Text>
      </TouchableOpacity>
    )}
  </View>
);

const HomeScreen = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  const user = useAppSelector(state => state.auth.user);

  const scrollRef = useRef<ScrollView>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredBikes, setFeaturedBikes] = useState<BicycleListing[]>([]);
  const [recentBikes, setRecentBikes] = useState<BicycleListing[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      loadCategories();
      loadFeatured();
      loadRecent();
    }, []),
  );

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      SCROLL_TO_TOP_EVENT,
      ({ routeName }) => {
        if (routeName === 'Home') {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        }
      },
    );
    return () => sub.remove();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getActiveCategories();
      setCategories(data);
    } catch {
      /* ignore */
    }
  };

  const loadFeatured = async () => {
    try {
      setLoadingFeatured(true);
      const res = await bicycleService.getBicycles({
        sort: '-viewCount',
        limit: 8,
        status: 'APPROVED',
      });
      setFeaturedBikes(res.data);
    } catch {
      setFeaturedBikes([]);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const loadRecent = async () => {
    try {
      setLoadingRecent(true);
      const res = await bicycleService.getBicycles({
        sort: '-createdAt',
        limit: 10,
        status: 'APPROVED',
      });
      setRecentBikes(res.data);
    } catch {
      setRecentBikes([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadCategories(), loadFeatured(), loadRecent()]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const goToShopWithCategory = (cat: Category) => {
    navigation.navigate('Shop', {
      categoryId: cat._id,
      categoryName: cat.name,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primaryGreen]}
            tintColor={colors.primaryGreen}
          />
        }
      >
        <HomeHeader
          user={user}
          onNotification={() => navigation.navigate('Notifications')}
        />

        <View style={styles.searchWrapper}>
          <HomeSearchBar onPress={() => navigation.navigate('Search')} />
        </View>

        <HomeBanner width={width} />

        {/* ── Loại xe ── */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Loại xe" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {categories.map(cat => (
                <HomeCategoryItem
                  key={cat._id}
                  category={cat}
                  onPress={() => goToShopWithCategory(cat)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Xe đạp nổi bật ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Xe đạp nổi bật"
            onSeeAll={() => navigation.navigate('Shop')}
          />
          {loadingFeatured ? (
            <ActivityIndicator
              color={colors.primaryGreen}
              style={styles.loader}
            />
          ) : featuredBikes.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có xe nào</Text>
          ) : (
            <FlatList
              data={featuredBikes}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredRow}
              scrollEnabled
              renderItem={({ item }) => (
                <BicycleFeaturedCard
                  item={item}
                  onPress={() =>
                    navigation.navigate('BicycleDetail', { id: item._id })
                  }
                />
              )}
            />
          )}
        </View>

        {/* ── Xe mới thêm ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Mới đăng"
            onSeeAll={() => navigation.navigate('Shop')}
          />
          {loadingRecent ? (
            <ActivityIndicator
              color={colors.primaryGreen}
              style={styles.loader}
            />
          ) : recentBikes.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có xe nào</Text>
          ) : (
            recentBikes.map(item => (
              <BicycleListCard
                key={item._id}
                item={item}
                onPress={() =>
                  navigation.navigate('BicycleDetail', { id: item._id })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray[200],
  },
  greeting: { fontSize: 13, color: colors.textSecondary },
  userName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },

  /* Search */
  searchWrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: colors.gray[400],
  },

  /* Section */
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    color: colors.primaryGreen,
    fontWeight: '600',
  },

  /* Banner */
  bannerCard: {
    height: 150,
    borderRadius: 16,
    backgroundColor: colors.primaryGreen + '18',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  bannerContent: { flex: 1 },
  bannerBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryGreen,
    letterSpacing: 1,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  bannerSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bannerImage: {
    width: 130,
    height: 130,
    position: 'absolute',
    right: 10,
    bottom: 10,
  },

  /* Categories */
  categoriesRow: { gap: 12, paddingRight: 4 },
  categoryItem: {
    alignItems: 'center',
    width: 80,
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.gray[100],
    marginBottom: 8,
  },
  categoryIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryGreen + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },

  /* Featured */
  featuredRow: { paddingRight: 4 },

  /* Misc */
  loader: { paddingVertical: 24 },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default HomeScreen;
