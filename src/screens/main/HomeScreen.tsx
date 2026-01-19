import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../../redux/hooks';
import { colors } from '../../theme';
import { Product, BikeCategory } from '../../types/product';
import { productService } from '../../api/productService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const HomeScreen = ({ navigation }: any) => {
  const user = useAppSelector(state => state.auth.user);
  const [_searchQuery, _setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [_featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [_loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Bike categories
  const categories: BikeCategory[] = [
    { id: 'all', name: 'Tất cả', icon: 'apps-outline', color: colors.primary },
    {
      id: 'mountain',
      name: 'Leo núi',
      icon: 'trail-sign-outline',
      color: '#8B4513',
    },
    {
      id: 'road',
      name: 'Đường trường',
      icon: 'speedometer-outline',
      color: '#FF6B6B',
    },
    {
      id: 'electric',
      name: 'Xe điện',
      icon: 'flash-outline',
      color: '#4ECDC4',
    },
    {
      id: 'city',
      name: 'Địa hình',
      icon: 'business-outline',
      color: '#95E1D3',
    },
    {
      id: 'kids',
      name: 'Trẻ em',
      icon: 'happy-outline',
      color: '#FFB6C1',
    },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [allProducts, featured] = await Promise.all([
        productService.getProducts(),
        productService.getFeaturedProducts(),
      ]);
      setProducts(allProducts);
      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Load products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image
          source={{
            uri: user?.avatar || 'https://ui-avatars.com/api/?name=User',
          }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.greeting}>Xin chào 👋</Text>
          <Text style={styles.userName}>{user?.fullName || 'Người dùng'}</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon
            name="notifications-outline"
            size={24}
            color={colors.textPrimary}
          />
          <View style={styles.badge} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="heart-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search')}
      >
        <Icon name="search-outline" size={20} color={colors.gray[400]} />
        <Text style={styles.searchPlaceholder}>Tìm kiếm xe đạp...</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHotDeals = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Xe đang ưu đãi</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hotDealsContainer}
      >
        <View style={styles.hotDealCard}>
          <View style={styles.hotDealContent}>
            <Text style={styles.hotDealBadge}>20%</Text>
            <Text style={styles.hotDealTitle}>Giá tốt!</Text>
            <Text style={styles.hotDealSubtitle}>
              Mua xe đạp với giá ưu đãi
            </Text>
          </View>
          <Image
            source={{
              uri: 'https://cdn.chotot.com/hu4kInagzHTL4VwtoIVHCdn2OwEm2gCJCNmwMNhISP0/preset:view/plain/a1a0fc6376515d7dff954516fba9dd06-2964946847987595881.jpg',
            }}
            style={styles.hotDealImage}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Danh mục</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory === category.id && styles.categoryCardActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: category.color + '20' },
              ]}
            >
              <Icon name={category.icon} size={24} color={category.color} />
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: item.media.thumbnails[0] }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favoriteButton}>
          <Icon name="heart-outline" size={20} color={colors.error} />
        </TouchableOpacity>
        {item.inspectionStatus === 'passed' && (
          <View style={styles.verifiedBadge}>
            <Icon name="checkmark-circle" size={16} color={colors.white} />
            <Text style={styles.verifiedText}>Đã kiểm tra</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{item.brandId}</Text>
        <Text style={styles.productModel} numberOfLines={2}>
          {item.modelId}
        </Text>
        <View style={styles.productDetails}>
          <Text style={styles.productYear}>{item.year}</Text>
          <Text style={styles.productCondition}>• {item.condition}</Text>
        </View>
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderProducts = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Xe đạp nổi bật</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bicycle-outline" size={60} color={colors.gray[300]} />
            <Text style={styles.emptyText}>Chưa có sản phẩm</Text>
          </View>
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderSearchBar()}
        {renderHotDeals()}
        {renderCategories()}
        {renderProducts()}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: colors.gray[200],
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: colors.white,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.gray[400],
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  hotDealsContainer: {
    paddingRight: 20,
  },
  hotDealCard: {
    width: width - 40,
    height: 160,
    borderRadius: 16,
    backgroundColor: colors.primary + '15',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  hotDealContent: {
    flex: 1,
    justifyContent: 'center',
  },
  hotDealBadge: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    lineHeight: 56,
  },
  hotDealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 4,
  },
  hotDealSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  hotDealImage: {
    width: 140,
    height: 140,
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.white,
    minWidth: 100,
  },
  categoryCardActive: {
    backgroundColor: colors.primary + '15',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: colors.gray[100],
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  productModel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 4,
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  productYear: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  productCondition: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
});

export default HomeScreen;
