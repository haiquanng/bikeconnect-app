import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { bicycleService } from '../../api/bicycleService';
import type { BicycleListing, Brand, BicycleCondition } from '../../types/bicycle';
import ViewToggle from '../../components/molecules/ViewToggle';
import BicycleListCard from '../../components/molecules/BicycleListCard';
import BicycleGridCard from '../../components/molecules/BicycleGridCard';
import ShopFilterBar from '../../components/molecules/ShopFilterBar';

type ViewMode = 'list' | 'grid';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Mới nhất' },
  { value: 'price',      label: 'Giá tăng dần' },
  { value: '-price',     label: 'Giá giảm dần' },
  { value: '-viewCount', label: 'Xem nhiều nhất' },
];

const CONDITION_OPTIONS: { value: BicycleCondition; label: string }[] = [
  { value: 'NEW',      label: 'Mới' },
  { value: 'LIKE_NEW', label: 'Như mới' },
  { value: 'GOOD',     label: 'Tốt' },
  { value: 'FAIR',     label: 'Khá' },
  { value: 'POOR',     label: 'Cũ' },
];

type ActiveModal = null | 'sort' | 'condition' | 'brand' | 'price';

const ShopScreen = ({ navigation, route }: any) => {
  const [listings, setListings]   = useState<BicycleListing[]>([]);
  const [loading, setLoading]     = useState(true);
  const [viewMode, setViewMode]   = useState<ViewMode>('list');

  // Filter state
  const [sort, setSort]           = useState('-createdAt');
  const [condition, setCondition] = useState<BicycleCondition | null>(null);
  const [brand, setBrand]         = useState<Brand | null>(null);
  const [category, setCategory]   = useState<{ _id: string; name: string } | null>(
    route.params?.categoryId
      ? { _id: route.params.categoryId, name: route.params.categoryName ?? '' }
      : null,
  );
  const [minPrice, setMinPrice]   = useState('');
  const [maxPrice, setMaxPrice]   = useState('');

  // Modal state
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [brands, setBrands]           = useState<Brand[]>([]);
  const [tempMin, setTempMin]         = useState('');
  const [tempMax, setTempMax]         = useState('');

  const filterMounted = useRef(false);

  useFocusEffect(
    useCallback(() => {
      loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // Watch route params for category updates from Home navigation
  useEffect(() => {
    if (route.params?.categoryId) {
      setCategory({ _id: route.params.categoryId, name: route.params.categoryName ?? '' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.categoryId]);

  useEffect(() => {
    if (!filterMounted.current) { filterMounted.current = true; return; }
    loadListings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, condition, brand, category, minPrice, maxPrice]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { sort, limit: 50 };
      if (condition) { params.condition = condition; }
      if (brand)     { params.brand     = brand._id; }
      if (category)  { params.category  = category._id; }
      if (minPrice)  { params.minPrice  = Number(minPrice); }
      if (maxPrice)  { params.maxPrice  = Number(maxPrice); }
      params.status = 'APPROVED'
      const res = await bicycleService.getBicycles(params);
      setListings(res.data);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Modal helpers ─── */
  const openBrandModal = async () => {
    setActiveModal('brand');
    if (brands.length === 0) {
      try {
        const b = await bicycleService.getBrands();
        setBrands(b);
      } catch { /* ignore */ }
    }
  };

  const openPriceModal = () => {
    setTempMin(minPrice);
    setTempMax(maxPrice);
    setActiveModal('price');
  };

  const applyPrice = () => {
    setMinPrice(tempMin);
    setMaxPrice(tempMax);
    setActiveModal(null);
  };

  const clearAllFilters = () => {
    setSort('-createdAt');
    setCondition(null);
    setBrand(null);
    setCategory(null);
    setMinPrice('');
    setMaxPrice('');
  };

  const hasActiveFilters =
    condition !== null || brand !== null || category !== null || minPrice !== '' || maxPrice !== '' || sort !== '-createdAt';

  /* ─── Header ─── */
  const renderHeader = () => (
    <>
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.8}
      >
        <Icon name="search-outline" size={20} color={colors.gray[400]} />
        <Text style={styles.searchPlaceholder}>Tìm kiếm xe đạp...</Text>
      </TouchableOpacity>

      <ShopFilterBar
        sort={sort}
        condition={condition}
        brandName={brand?.name ?? null}
        categoryName={category?.name ?? null}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onOpenSort={() => setActiveModal('sort')}
        onOpenCondition={() => setActiveModal('condition')}
        onClearCondition={() => setCondition(null)}
        onOpenBrand={openBrandModal}
        onClearBrand={() => setBrand(null)}
        onClearCategory={() => setCategory(null)}
        onOpenPrice={openPriceModal}
        onClearPrice={() => { setMinPrice(''); setMaxPrice(''); }}
        onClearAll={clearAllFilters}
      />

      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>{listings.length} kết quả</Text>
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </View>
    </>
  );

  /* ─── Modal: Sort ─── */
  const renderSortModal = () => (
    <Modal
      visible={activeModal === 'sort'}
      transparent
      animationType="slide"
      onRequestClose={() => setActiveModal(null)}
    >
      <Pressable style={styles.overlay} onPress={() => setActiveModal(null)}>
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Sắp xếp theo</Text>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={styles.sheetRow}
              onPress={() => { setSort(opt.value); setActiveModal(null); }}
            >
              <Text style={[styles.sheetRowText, sort === opt.value && styles.sheetRowTextActive]}>
                {opt.label}
              </Text>
              {sort === opt.value && (
                <Icon name="checkmark" size={18} color={colors.primaryGreen} />
              )}
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );

  /* ─── Modal: Condition ─── */
  const renderConditionModal = () => (
    <Modal
      visible={activeModal === 'condition'}
      transparent
      animationType="slide"
      onRequestClose={() => setActiveModal(null)}
    >
      <Pressable style={styles.overlay} onPress={() => setActiveModal(null)}>
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Tình trạng xe</Text>
          <TouchableOpacity
            style={styles.sheetRow}
            onPress={() => { setCondition(null); setActiveModal(null); }}
          >
            <Text style={[styles.sheetRowText, condition === null && styles.sheetRowTextActive]}>
              Tất cả
            </Text>
            {condition === null && <Icon name="checkmark" size={18} color={colors.primaryGreen} />}
          </TouchableOpacity>
          {CONDITION_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={styles.sheetRow}
              onPress={() => { setCondition(opt.value); setActiveModal(null); }}
            >
              <Text style={[styles.sheetRowText, condition === opt.value && styles.sheetRowTextActive]}>
                {opt.label}
              </Text>
              {condition === opt.value && (
                <Icon name="checkmark" size={18} color={colors.primaryGreen} />
              )}
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );

  /* ─── Modal: Brand ─── */
  const renderBrandModal = () => (
    <Modal
      visible={activeModal === 'brand'}
      transparent
      animationType="slide"
      onRequestClose={() => setActiveModal(null)}
    >
      <Pressable style={styles.overlay} onPress={() => setActiveModal(null)}>
        <Pressable style={[styles.sheet, styles.sheetTall]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Thương hiệu</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.sheetRow}
              onPress={() => { setBrand(null); setActiveModal(null); }}
            >
              <Text style={[styles.sheetRowText, brand === null && styles.sheetRowTextActive]}>
                Tất cả thương hiệu
              </Text>
              {brand === null && <Icon name="checkmark" size={18} color={colors.primaryGreen} />}
            </TouchableOpacity>
            {brands.map(b => (
              <TouchableOpacity
                key={b._id}
                style={styles.sheetRow}
                onPress={() => { setBrand(b); setActiveModal(null); }}
              >
                <Text style={[styles.sheetRowText, brand?._id === b._id && styles.sheetRowTextActive]}>
                  {b.name}
                </Text>
                {brand?._id === b._id && (
                  <Icon name="checkmark" size={18} color={colors.primaryGreen} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );

  /* ─── Modal: Price ─── */
  const renderPriceModal = () => (
    <Modal
      visible={activeModal === 'price'}
      transparent
      animationType="slide"
      onRequestClose={() => setActiveModal(null)}
    >
      <Pressable style={styles.overlay} onPress={() => setActiveModal(null)}>
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Khoảng giá</Text>
          <View style={styles.priceInputsRow}>
            <View style={styles.priceInputBox}>
              <Text style={styles.priceInputLabel}>Từ (VND)</Text>
              <TextInput
                style={styles.priceInput}
                value={tempMin}
                onChangeText={setTempMin}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.gray[400]}
              />
            </View>
            <Text style={styles.priceSeparator}>–</Text>
            <View style={styles.priceInputBox}>
              <Text style={styles.priceInputLabel}>Đến (VND)</Text>
              <TextInput
                style={styles.priceInput}
                value={tempMax}
                onChangeText={setTempMax}
                keyboardType="numeric"
                placeholder="Không giới hạn"
                placeholderTextColor={colors.gray[400]}
              />
            </View>
          </View>
          <View style={styles.priceQuickRow}>
            {[
              { label: '< 5tr',     min: '',         max: '5000000' },
              { label: '5 – 15tr',  min: '5000000',  max: '15000000' },
              { label: '15 – 30tr', min: '15000000', max: '30000000' },
              { label: '> 30tr',    min: '30000000', max: '' },
            ].map(q => (
              <TouchableOpacity
                key={q.label}
                style={styles.quickPriceChip}
                onPress={() => { setTempMin(q.min); setTempMax(q.max); }}
              >
                <Text style={styles.quickPriceText}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.priceActions}>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => { setTempMin(''); setTempMax(''); }}
            >
              <Text style={styles.clearBtnText}>Xóa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={applyPrice}>
              <Text style={styles.applyBtnText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          data={listings}
          keyExtractor={item => item._id}
          renderItem={({ item }) =>
            viewMode === 'list'
              ? <BicycleListCard item={item} onPress={() => navigation.navigate('BicycleDetail', { id: item._id })} />
              : <BicycleGridCard item={item} onPress={() => navigation.navigate('BicycleDetail', { id: item._id })} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={loadListings}
          refreshing={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon name="bicycle-outline" size={60} color={colors.gray[300]} />
              <Text style={styles.emptyText}>Không tìm thấy xe đạp nào</Text>
              {hasActiveFilters && (
                <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearAllFilters}>
                  <Text style={styles.clearFiltersBtnText}>Xóa bộ lọc</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {renderSortModal()}
      {renderConditionModal()}
      {renderBrandModal()}
      {renderPriceModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: colors.backgroundSecondary },
  loadingBox:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: colors.textSecondary },
  listContent: { padding: 16, paddingBottom: 100 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  searchPlaceholder: { flex: 1, marginLeft: 8, fontSize: 15, color: colors.gray[400] },

  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsCount: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },

  /* empty */
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16, color: colors.textSecondary },
  clearFiltersBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primaryGreen,
  },
  clearFiltersBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },

  /* bottom sheets */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  sheetTall: { maxHeight: '70%' },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[300],
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle:       { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  sheetRowText:       { fontSize: 15, color: colors.textPrimary },
  sheetRowTextActive: { color: colors.primaryGreen, fontWeight: '600' },

  /* price modal */
  priceInputsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  priceInputBox:  { flex: 1 },
  priceInputLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  priceSeparator: { fontSize: 18, color: colors.textTertiary, marginTop: 18 },
  priceQuickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    marginBottom: 20,
  },
  quickPriceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  quickPriceText: { fontSize: 13, color: colors.textPrimary },
  priceActions:  { flexDirection: 'row', gap: 12 },
  clearBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
  },
  clearBtnText: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  applyBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
  },
  applyBtnText: { fontSize: 15, color: colors.white, fontWeight: '700' },
});

export default ShopScreen;
