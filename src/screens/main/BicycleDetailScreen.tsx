import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { bicycleService } from '../../api/bicycleService';
import type { BicycleListing } from '../../types/bicycle';
import { showToast } from '../../utils/toast';
import { useAppSelector } from '../../redux/hooks';
import SectionHeader from '../../components/molecules/SectionHeader';
import BicycleListCard from '../../components/molecules/BicycleListCard';
import { formatDate } from '../../utils/helper';

import Gallery from './BicycleDetail/Gallery';
import SellerRow from './BicycleDetail/SellerRow';
import ProductInfo from './BicycleDetail/ProductInfo';
import SpecsModal from './BicycleDetail/SpecsModal';
import StickyHeader from './BicycleDetail/StickyHeader';
import BottomBar from './BicycleDetail/BottomBar';

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Mới',
  LIKE_NEW: 'Như mới',
  GOOD: 'Tốt',
  FAIR: 'Khá',
  POOR: 'Cũ',
};

const BicycleDetailScreen = ({ navigation, route }: any) => {
  const { id } = route.params as { id: string };
  const { width: W } = useWindowDimensions();
  const GALLERY_H = W * 0.75;
  const insets = useSafeAreaInsets();
  const currentUser = useAppSelector(state => state.auth.user);

  const [item, setItem] = useState<BicycleListing | null>(null);
  const [loadingRelateItems, setLoadingRelateItems] = useState(true);
  const [relatedItems, setRelatedItems] = useState<BicycleListing[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);

  const stickyRef = useRef(false);
  const THRESHOLD = GALLERY_H * 0.5;

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const next = y > THRESHOLD;
    if (next !== stickyRef.current) {
      stickyRef.current = next;
      setStickyVisible(next);
    }
  };

  const loadRelatedItems = async (categoryId: string, currentId: string) => {
    if (!categoryId) {
      setRelatedItems([]);
      setLoadingRelateItems(false);
      return;
    }
    try {
      setLoadingRelateItems(true);
      const res = await bicycleService.getBicycles({ category: categoryId, limit: 10 });
      setRelatedItems(res.data.filter(b => b._id !== currentId));
    } catch {
      setRelatedItems([]);
    } finally {
      setLoadingRelateItems(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const data = await bicycleService.getBicycleById(id);
          if (!cancelled) {
            setItem(data);
            loadRelatedItems(data.category?._id ?? '', id);
          }
        } catch (error: any) {
          if (!cancelled) {
            showToast(error.message || 'Lỗi khi tải thông tin xe');
            navigation.goBack();
          }
        } finally {
          if (!cancelled) { setLoading(false); }
        }
      })();
      return () => { cancelled = true; };
    }, [id, navigation]),
  );

  if (loading || !item) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
      </View>
    );
  }

  const images = item.images.length > 0 ? item.images : null;
  const primaryImg = item.images.find(i => i.isPrimary) ?? item.images[0];
  const specs = item.specifications;
  const isSeller = currentUser?.id === item.seller?._id;

  const specChips = [
    { key: 'condition', label: CONDITION_LABELS[item.condition] ?? item.condition },
    specs?.yearManufactured ? { key: 'year', label: `${specs.yearManufactured}` } : null,
    specs?.frameSize ? { key: 'size', label: specs.frameSize } : null,
    specs?.frameMaterial ? { key: 'material', label: specs.frameMaterial } : null,
    specs?.color ? { key: 'color', label: specs.color } : null,
    item.category ? { key: 'category', label: item.category.name } : null,
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={8}
      >
        <Gallery
          images={images}
          W={W}
          GALLERY_H={GALLERY_H}
          topInset={insets.top}
          imageIndex={imageIndex}
          onIndexChange={setImageIndex}
          onBack={() => navigation.goBack()}
        />

        <SellerRow seller={item.seller} location={item.location} />

        <View style={styles.divider} />

        <ProductInfo
          brand={item.brand?.name}
          title={item.title}
          price={item.price}
          originalPrice={item.originalPrice}
          isInspected={item.isInspected}
          specChips={specChips}
          onViewSpecs={() => setShowSpecs(true)}
        />

        <View style={styles.divider} />

        {item.description ? (
          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.descText}>{item.description}</Text>
          </View>
        ) : null}

        <View style={styles.metaSection}>
          <Text style={styles.metaLine}>
            Cập nhật lần cuối: {formatDate(item.updatedAt)}
          </Text>
          <TouchableOpacity style={styles.reportRow}>
            <Icon name="information-circle-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.reportText}>Báo cáo sản phẩm</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Sản phẩm tương tự"
            onSeeAll={() =>
              navigation.navigate('Main', {
                screen: 'Shop',
                params: { categoryId: item.category?._id, categoryName: item.category?.name },
              })
            }
          />
          {loadingRelateItems ? (
            <ActivityIndicator color={colors.primaryGreen} style={styles.loader} />
          ) : !relatedItems || relatedItems.length === 0 ? (
            <Text style={styles.emptyText}>Không có sản phẩm tương tự</Text>
          ) : (
            relatedItems.map(related => (
              <BicycleListCard
                key={related._id}
                item={related}
                onPress={() => navigation.push('BicycleDetail', { id: related._id })}
              />
            ))
          )}
        </View>

        <View style={styles.scrollPadding} />
      </ScrollView>

      {stickyVisible && (
        <StickyHeader
          primaryImg={primaryImg}
          title={item.title}
          price={item.price}
          originalPrice={item.originalPrice}
          topInset={insets.top}
          onBack={() => navigation.goBack()}
        />
      )}

      <BottomBar
        isSeller={isSeller}
        bottomInset={insets.bottom}
        onViewListings={() => navigation.navigate('Listings')}
        onDeposit={() =>
          navigation.navigate('Checkout', {
            bicycleId:          item._id,
            bicycleTitle:       item.title,
            bicyclePrice:       item.price,
            primaryImage:       primaryImg?.url,
            condition:          item.condition,
            fromDistrictId:     item.location?.districtId,
            fromWardCode:       item.location?.wardCode,
            initialPaymentType: 'DEPOSIT_10',
          })
        }
        onBuy={() =>
          navigation.navigate('Checkout', {
            bicycleId:      item._id,
            bicycleTitle:   item.title,
            bicyclePrice:   item.price,
            primaryImage:   primaryImg?.url,
            condition:      item.condition,
            fromDistrictId: item.location?.districtId,
            fromWardCode:   item.location?.wardCode,
          })
        }
      />

      <SpecsModal
        visible={showSpecs}
        onClose={() => setShowSpecs(false)}
        item={item}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  divider: { height: 1, backgroundColor: colors.gray[100] },
  descSection: { paddingHorizontal: 16, paddingVertical: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  descText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  metaSection: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  metaLine: { fontSize: 12, color: colors.textTertiary },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  reportText: { fontSize: 13, color: colors.textSecondary },
  section: { marginTop: 20, paddingHorizontal: 16 },
  loader: { marginVertical: 16 },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  scrollPadding: { height: 100 },
});

export default BicycleDetailScreen;
