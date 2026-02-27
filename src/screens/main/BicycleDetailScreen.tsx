import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
  Pressable,
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
import { formatPrice, formatDate } from '../../utils/helper';

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Mới',
  LIKE_NEW: 'Như mới',
  GOOD: 'Tốt',
  FAIR: 'Khá',
  POOR: 'Cũ',
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const BicycleDetailScreen = ({ navigation, route }: any) => {
  const { id } = route.params as { id: string };
  const { width: W } = useWindowDimensions();
  const GALLERY_H = W * 0.75; // 4:3 ratio — đổi tỉ lệ ở đây
  const insets = useSafeAreaInsets();
  const currentUser = useAppSelector(state => state.auth.user);

  const [item, setItem] = useState<BicycleListing | null>(null);
  const [loadingRelateItems, setLoadingRelateItems] = useState(true);
  const [relatedItems, setRelatedItems] = useState<BicycleListing[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);

  // Only trigger re-render when threshold is crossed, not on every pixel
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
          if (!cancelled) {
            setLoading(false);
          }
        }
      })();
      return () => {
        cancelled = true;
      };
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

  const specChips = [
    {
      key: 'condition',
      label: CONDITION_LABELS[item.condition] ?? item.condition,
    },
    specs?.yearManufactured
      ? { key: 'year', label: `${specs.yearManufactured}` }
      : null,
    specs?.frameSize ? { key: 'size', label: specs.frameSize } : null,
    specs?.frameMaterial
      ? { key: 'material', label: specs.frameMaterial }
      : null,
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
        {/* ── Image Gallery ── */}
        <View style={{ width: W, height: GALLERY_H }}>
          {images ? (
            <FlatList
              data={images}
              keyExtractor={(_, i) => String(i)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => {
                setImageIndex(Math.round(e.nativeEvent.contentOffset.x / W));
              }}
              renderItem={({ item: img }) => (
                <Image
                  source={{ uri: img.url }}
                  style={{ width: W, height: GALLERY_H }}
                  resizeMode="cover"
                />
              )}
              getItemLayout={(_, index) => ({
                length: W,
                offset: W * index,
                index,
              })}
            />
          ) : (
            <View style={styles.galleryFallback}>
              <Icon name="bicycle-outline" size={80} color={colors.gray[300]} />
            </View>
          )}

          {/* Back button (trong gallery, cuộn cùng content) */}
          <TouchableOpacity
            style={[styles.galleryBackBtn, { top: insets.top + 10 }]}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={20} color={colors.white} />
          </TouchableOpacity>

          {/* Counter bottom-left */}
          {images && images.length > 1 && (
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {imageIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* Share bottom-right */}
          <TouchableOpacity
            style={styles.galleryShareBtn}
            onPress={() => showToast('Đang phát triển')}
          >
            <Icon name="share-social-outline" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* ── Seller ── */}
        <View style={styles.sellerRow}>
          <View style={styles.sellerLeft}>
            <View style={styles.avatar}>
              {item.seller?.avatarUrl ? (
                <Image
                  source={{ uri: item.seller.avatarUrl }}
                  style={styles.avatarImg}
                />
              ) : (
                <Icon name="person" size={24} color={colors.gray[400]} />
              )}
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerBy}>Người bán</Text>
              <Text style={styles.sellerName} numberOfLines={1}>
                {item.seller?.fullName ?? 'Ẩn danh'}
              </Text>
              {item.location?.city && (
                <Text style={styles.sellerLocation}>{item.location.city}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.askBtn}
            onPress={() => showToast('Đang phát triển')}
          >
            <Text style={styles.askBtnText}>Nhắn tin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ── Product Info ── */}
        <View style={styles.infoSection}>
          {item.brand && (
            <Text style={styles.brandLabel}>{item.brand.name}</Text>
          )}
          <Text style={styles.titleText}>{item.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
            {item.originalPrice && item.originalPrice > item.price && (
              <Text style={styles.msrpText}>
                {formatPrice(item.originalPrice)} MSRP
              </Text>
            )}
          </View>
          {item.isInspected && (
            <View style={styles.inspectedRow}>
              <Icon name="checkmark-circle" size={15} color={colors.success} />
              <Text style={styles.inspectedLabel}>Đã kiểm tra chất lượng</Text>
            </View>
          )}
        </View>

        {/* ── Spec chips (xuống dòng nếu nhiều) ── */}
        {specChips.length > 0 && (
          <View style={styles.chipsWrap}>
            {specChips.map(chip => (
              <View key={chip.key} style={styles.specChip}>
                <Icon
                  name="information-circle-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.specChipText}>{chip.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Xem tất cả thông số ── */}
        <TouchableOpacity
          style={styles.specsBtn}
          onPress={() => setShowSpecs(true)}
        >
          <Text style={styles.specsBtnText}>Xem tất cả thông số</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* ── Mô tả ── */}
        {item.description ? (
          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.descText}>{item.description}</Text>
          </View>
        ) : null}

        {/* ── Meta ── */}
        <View style={styles.metaSection}>
          <Text style={styles.metaLine}>
            Cập nhật lần cuối: {formatDate(item.updatedAt)}
          </Text>
          <TouchableOpacity style={styles.reportRow}>
            <Icon
              name="information-circle-outline"
              size={15}
              color={colors.textSecondary}
            />
            <Text style={styles.reportText}>Báo cáo sản phẩm</Text>
          </TouchableOpacity>
        </View>

        {/* ── Sản phẩm liên quan ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Sản phẩm tương tự"
            onSeeAll={() => navigation.navigate('Main', { screen: 'Shop', params: { categoryId: item.category?._id, categoryName: item.category?.name } })}
          />
          {loadingRelateItems ? (
            <ActivityIndicator
              color={colors.primaryGreen}
              style={styles.loader}
            />
          ) : !relatedItems || relatedItems.length === 0 ? (
            <Text style={styles.emptyText}>Không có sản phẩm tương tự</Text>
          ) : (
            relatedItems.map(related => (
              <BicycleListCard
                key={related._id}
                item={related}
                onPress={() =>
                  navigation.push('BicycleDetail', { id: related._id })
                }
              />
            ))
          )}
        </View>

        <View style={styles.scrollPadding} />
      </ScrollView>

      {/* ── Sticky header (hiện khi cuộn > 50% ảnh) ── */}
      {stickyVisible && (
        <View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.stickyBackBtn}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.stickyContent}>
            {primaryImg && (
              <Image
                source={{ uri: primaryImg.url }}
                style={styles.stickyThumb}
                resizeMode="cover"
              />
            )}
            <View style={styles.stickyTextBox}>
              <Text style={styles.stickyTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.stickyPriceRow}>
                <Text style={styles.stickyPrice}>
                  {formatPrice(item.price)}
                </Text>
                {item.originalPrice && item.originalPrice > item.price && (
                  <Text style={styles.stickyMsrp}>
                    {formatPrice(item.originalPrice)}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.stickyAction}
            onPress={() => showToast('Đang phát triển')}
          >
            <Icon name="heart-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Bottom Bar ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        {currentUser?.id === item.seller?._id ? (
          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() => navigation.navigate('EditListing', { id: item._id })}
          >
            <Text style={styles.buyBtnText}>Chỉnh sửa tin đăng</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.depositBtn}
              onPress={() => showToast('Đang phát triển')}
            >
              <Text style={styles.depositBtnText}>Đặt cọc</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={() =>
                navigation.navigate('Checkout', {
                  bicycleId: item._id,
                  bicycleTitle: item.title,
                  bicyclePrice: item.price,
                  primaryImage: primaryImg?.url,
                  condition: item.condition,
                  paymentType: 'FULL_100',
                })
              }
            >
              <Text style={styles.buyBtnText}>Mua ngay</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ── Modal: Tất cả thông số ── */}
      <Modal
        visible={showSpecs}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSpecs(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowSpecs(false)}>
          <Pressable style={styles.specsSheet}>
            <View style={styles.handle} />

            <View style={styles.specsHeader}>
              <View style={styles.specsHeaderLeft}>
                {item.brand && (
                  <Text style={styles.specsHeaderBrand}>{item.brand.name}</Text>
                )}
                <Text style={styles.specsHeaderTitle}>{item.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSpecs(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.specsSectionTitle}>Thông tin chung</Text>
              <DetailRow
                label="Tình trạng"
                value={CONDITION_LABELS[item.condition] ?? item.condition}
              />
              {specs?.yearManufactured ? (
                <DetailRow
                  label="Năm sản xuất"
                  value={`${specs.yearManufactured}`}
                />
              ) : null}
              {specs?.frameSize ? (
                <DetailRow label="Kích cỡ khung" value={specs.frameSize} />
              ) : null}
              {specs?.frameMaterial ? (
                <DetailRow
                  label="Chất liệu khung"
                  value={specs.frameMaterial}
                />
              ) : null}
              {specs?.color ? (
                <DetailRow label="Màu sắc" value={specs.color} />
              ) : null}
              {item.usageMonths ? (
                <DetailRow
                  label="Thời gian sử dụng"
                  value={`${item.usageMonths} tháng`}
                />
              ) : null}
              {item.location?.city ? (
                <DetailRow label="Khu vực" value={item.location.city} />
              ) : null}
              {item.category ? (
                <DetailRow label="Danh mục" value={item.category.name} />
              ) : null}
              <View style={styles.specsModalPadding} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

/* ─── Styles ─── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },

  galleryFallback: {
    flex: 1,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryBackBtn: {
    position: 'absolute',
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  galleryActionBtn: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryShareBtn: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* sticky header */
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  stickyBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stickyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stickyThumb: {
    width: 46,
    height: 46,
    borderRadius: 6,
    backgroundColor: colors.gray[100],
  },
  stickyTextBox: { flex: 1 },
  stickyTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  stickyPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  stickyPrice: { fontSize: 14, fontWeight: '700', color: colors.primaryGreen },
  stickyMsrp: {
    fontSize: 11,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  stickyAction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },

  /* seller */
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sellerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 48, height: 48 },
  sellerInfo: { flex: 1 },
  sellerBy: { fontSize: 11, color: colors.textSecondary },
  sellerName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  sellerLocation: { fontSize: 12, color: colors.textSecondary },
  askBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
  },
  askBtnText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },

  divider: { height: 1, backgroundColor: colors.gray[100] },

  /* product info */
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 6,
  },
  brandLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: 4,
  },
  priceText: { fontSize: 26, fontWeight: '800', color: colors.primaryGreen },
  msrpText: {
    fontSize: 14,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  inspectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  inspectedLabel: { fontSize: 13, color: colors.success, fontWeight: '500' },

  /* spec chips — wrap xuống dòng */
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  specChipText: { fontSize: 13, color: colors.textPrimary },

  /* xem tất cả thông số */
  specsBtn: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
  },
  specsBtnText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },

  /* mô tả */
  descSection: { paddingHorizontal: 16, paddingVertical: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  descText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },

  /* meta */
  metaSection: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  metaLine: { fontSize: 12, color: colors.textTertiary },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  reportText: { fontSize: 13, color: colors.textSecondary },

  /* bottom bar */
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  depositBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.gray[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  buyBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },

  /* specs modal */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  specsSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[300],
    alignSelf: 'center',
    marginBottom: 16,
  },
  specsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  specsHeaderLeft: { flex: 1, marginRight: 12 },
  specsHeaderBrand: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  specsHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  specsSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  detailLabel: { fontSize: 14, color: colors.textSecondary },
  detailValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  specsModalPadding: { height: 24 },
  scrollPadding: { height: 100 },

  /* related items */
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  loader: { marginVertical: 16 },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  relatedSection: { paddingTop: 16, paddingBottom: 8 },
  relatedCard: {
    width: 140,
    marginLeft: 16,
    borderRadius: 10,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  relatedImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: colors.gray[100],
  },
  relatedTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    padding: 8,
  },
});

export default BicycleDetailScreen;
