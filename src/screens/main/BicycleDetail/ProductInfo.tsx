import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme';
import { formatPrice } from '../../../utils/helper';

interface SpecChip {
  key: string;
  label: string;
}

interface Props {
  brand?: string;
  title: string;
  price: number;
  originalPrice?: number;
  isInspected: boolean;
  specChips: SpecChip[];
  onViewSpecs: () => void;
}

const ProductInfo = ({
  brand,
  title,
  price,
  originalPrice,
  isInspected,
  specChips,
  onViewSpecs,
}: Props) => (
  <>
    <View style={styles.infoSection}>
      {brand && <Text style={styles.brandLabel}>{brand}</Text>}
      <Text style={styles.titleText}>{title}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.priceText}>{formatPrice(price)}</Text>
        {originalPrice && originalPrice > price && (
          <Text style={styles.msrpText}>{formatPrice(originalPrice)} MSRP</Text>
        )}
      </View>
      {isInspected && (
        <View style={styles.inspectedRow}>
          <Icon name="checkmark-circle" size={15} color={colors.success} />
          <Text style={styles.inspectedLabel}>Đã kiểm tra chất lượng</Text>
        </View>
      )}
    </View>

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

    <TouchableOpacity style={styles.specsBtn} onPress={onViewSpecs}>
      <Text style={styles.specsBtnText}>Xem tất cả thông số</Text>
    </TouchableOpacity>
  </>
);

const styles = StyleSheet.create({
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
});

export default ProductInfo;
