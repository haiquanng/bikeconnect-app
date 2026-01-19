import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { Product } from '../../types/product';
import { productService } from '../../api/productService';
import ProductCard from '../../components/organisms/ProductCard';
import ProductListItem from '../../components/organisms/ProductListItem';
import FilterChips from '../../components/molecules/FilterChips';
import ViewToggle from '../../components/molecules/ViewToggle';

type ViewMode = 'grid' | 'list';

const ShopScreen = ({ navigation, route }: any) => {
  const searchQueryParam = route?.params?.searchQuery || '';
  const [_searchQuery, _setSearchQuery] = useState(searchQueryParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [_loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filterOptions = [
    { id: 'filter', label: 'Lọc', icon: 'options-outline' },
    { id: 'category', label: 'Danh mục', icon: 'apps-outline' },
    { id: 'size', label: 'Kích cỡ', icon: 'resize-outline' },
    { id: 'price', label: 'Giá', icon: 'pricetag-outline' },
    { id: 'brand', label: 'Thương hiệu', icon: 'business-outline' },
  ];

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, []),
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await productService.getProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Load products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isHighDemand = (product: Product) => {
    // Mock logic - in real app, this would come from backend
    return product.id === 'p001' || product.id === 'p002';
  };

  const handleFilterToggle = (filterId: string) => {
    if (selectedFilters.includes(filterId)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filterId));
    } else {
      setSelectedFilters([...selectedFilters, filterId]);
    }
  };

  const renderHeader = () => (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
        >
          <Icon name="search-outline" size={20} color={colors.gray[400]} />
          <Text style={styles.searchPlaceholder}>Tìm kiếm</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <FilterChips
          options={filterOptions}
          selectedFilters={selectedFilters}
          onFilterToggle={handleFilterToggle}
        />
      </View>

      {/* Results Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.resultsCount}>
          {products.length.toLocaleString()} kết quả
        </Text>
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </View>
    </>
  );

  const renderGridItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      isHighDemand={isHighDemand(item)}
      onPress={() => {
        // Navigate to product detail
        console.log('Product pressed:', item.id);
      }}
    />
  );

  const renderListItem = ({ item }: { item: Product }) => (
    <ProductListItem
      product={item}
      isHighDemand={isHighDemand(item)}
      onPress={() => {
        // Navigate to product detail
        console.log('Product pressed:', item.id);
      }}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ListHeaderComponent={renderHeader()}
        data={products}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bicycle-outline" size={60} color={colors.gray[300]} />
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  searchContainer: {
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 0,
    paddingHorizontal: 16,
    height: 48,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.gray[400],
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
});

export default ShopScreen;
