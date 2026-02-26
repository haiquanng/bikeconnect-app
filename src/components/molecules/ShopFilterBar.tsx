import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import type { BicycleCondition } from '../../types/bicycle';

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Mới', LIKE_NEW: 'Như mới', GOOD: 'Tốt', FAIR: 'Khá', POOR: 'Cũ',
};

const SORT_LABELS: Record<string, string> = {
  '-createdAt': 'Mới nhất',
  'price':      'Giá tăng dần',
  '-price':     'Giá giảm dần',
  '-viewCount': 'Xem nhiều nhất',
};

const formatPriceShort = (price: number) => {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)}tr`;
  if (price >= 1_000)     return `${(price / 1_000).toFixed(0)}k`;
  return `${price}`;
};

interface Props {
  sort: string;
  condition: BicycleCondition | null;
  brandName: string | null;
  categoryName: string | null;
  minPrice: string;
  maxPrice: string;
  onOpenSort: () => void;
  onOpenCondition: () => void;
  onClearCondition: () => void;
  onOpenBrand: () => void;
  onClearBrand: () => void;
  onClearCategory: () => void;
  onOpenPrice: () => void;
  onClearPrice: () => void;
  onClearAll: () => void;
}

const ShopFilterBar: React.FC<Props> = ({
  sort, condition, brandName, categoryName, minPrice, maxPrice,
  onOpenSort, onOpenCondition, onClearCondition,
  onOpenBrand, onClearBrand, onClearCategory, onOpenPrice, onClearPrice, onClearAll,
}) => {
  const sortActive  = sort !== '-createdAt';
  const priceActive = minPrice !== '' || maxPrice !== '';
  const priceLabel  = priceActive
    ? `${minPrice ? formatPriceShort(Number(minPrice)) : '0'} – ${maxPrice ? formatPriceShort(Number(maxPrice)) : '∞'}`
    : null;
  const hasActive = sortActive || condition !== null || brandName !== null || categoryName !== null || priceActive;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.content}
    >
      {/* Category (from Home navigation) */}
      {categoryName !== null && (
        <TouchableOpacity style={[styles.chip, styles.chipActive]}>
          <Icon name="apps-outline" size={15} color={colors.white} />
          <Text style={[styles.chipText, styles.chipTextActive]} numberOfLines={1}>
            {categoryName}
          </Text>
          <TouchableOpacity
            onPress={onClearCategory}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon name="close-circle" size={15} color={colors.white} />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Sort */}
      <TouchableOpacity
        style={[styles.chip, sortActive && styles.chipActive]}
        onPress={onOpenSort}
      >
        <Icon
          name="swap-vertical-outline"
          size={15}
          color={sortActive ? colors.white : colors.textPrimary}
        />
        <Text style={[styles.chipText, sortActive && styles.chipTextActive]}>
          {SORT_LABELS[sort] ?? 'Sắp xếp'}
        </Text>
      </TouchableOpacity>

      {/* Condition */}
      <TouchableOpacity
        style={[styles.chip, condition !== null && styles.chipActive]}
        onPress={onOpenCondition}
      >
        <Icon
          name="shield-checkmark-outline"
          size={15}
          color={condition ? colors.white : colors.textPrimary}
        />
        <Text style={[styles.chipText, condition !== null && styles.chipTextActive]}>
          {condition ? CONDITION_LABELS[condition] : 'Tình trạng'}
        </Text>
        {condition !== null && (
          <TouchableOpacity
            onPress={onClearCondition}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon name="close-circle" size={15} color={colors.white} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Brand */}
      <TouchableOpacity
        style={[styles.chip, brandName !== null && styles.chipActive]}
        onPress={onOpenBrand}
      >
        <Icon
          name="bicycle-outline"
          size={15}
          color={brandName ? colors.white : colors.textPrimary}
        />
        <Text style={[styles.chipText, brandName !== null && styles.chipTextActive]}>
          {brandName ?? 'Thương hiệu'}
        </Text>
        {brandName !== null && (
          <TouchableOpacity
            onPress={onClearBrand}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon name="close-circle" size={15} color={colors.white} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Price */}
      <TouchableOpacity
        style={[styles.chip, priceActive && styles.chipActive]}
        onPress={onOpenPrice}
      >
        <Icon
          name="pricetag-outline"
          size={15}
          color={priceActive ? colors.white : colors.textPrimary}
        />
        <Text style={[styles.chipText, priceActive && styles.chipTextActive]}>
          {priceLabel ?? 'Khoảng giá'}
        </Text>
        {priceActive && (
          <TouchableOpacity
            onPress={onClearPrice}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon name="close-circle" size={15} color={colors.white} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Clear all */}
      {hasActive && (
        <TouchableOpacity style={styles.clearChip} onPress={onClearAll}>
          <Icon name="refresh-outline" size={15} color={colors.error} />
          <Text style={styles.clearChipText}>Xóa lọc</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row:     { marginBottom: 12 },
  content: { gap: 8, paddingRight: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    gap: 5,
  },
  chipActive:     { backgroundColor: colors.primaryGreen, borderColor: colors.primaryGreen },
  chipText:       { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  chipTextActive: { color: colors.white },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: '#FEF2F2',
    gap: 5,
  },
  clearChipText: { fontSize: 13, color: colors.error, fontWeight: '500' },
});

export default ShopFilterBar;
