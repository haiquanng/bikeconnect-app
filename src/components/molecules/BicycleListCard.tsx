import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import type { BicycleListing } from '../../types/bicycle';
import { formatPrice } from '../../utils/helper';

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Mới', LIKE_NEW: 'Như mới', GOOD: 'Tốt', FAIR: 'Khá', POOR: 'Cũ',
};

interface Props {
  item: BicycleListing;
  onPress?: () => void;
}

const BicycleListCard: React.FC<Props> = ({ item, onPress }) => {
  const img = item.images.find(i => i.isPrimary) ?? item.images[0];
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.imageBox}>
        {img ? (
          <Image source={{ uri: img.url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback}>
            <Icon name="bicycle-outline" size={28} color={colors.gray[400]} />
          </View>
        )}
        {item.isInspected && (
          <View style={styles.inspectedBadge}>
            <Icon name="checkmark-circle" size={12} color={colors.white} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        {item.brand && (
          <Text style={styles.brandText} numberOfLines={1}>{item.brand.name}</Text>
        )}
        <Text style={styles.titleText} numberOfLines={2}>{item.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{CONDITION_LABELS[item.condition] ?? item.condition}</Text>
          {item.location?.city && (
            <>
              <Text style={styles.metaDot}> · </Text>
              <Text style={styles.metaText} numberOfLines={1}>{item.location.city}</Text>
            </>
          )}
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
          {item.originalPrice && item.originalPrice > item.price && (
            <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  imageBox: {
    width: 160,
    height: 120,
    backgroundColor: colors.gray[100],
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspectedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info:      { flex: 1, padding: 12, justifyContent: 'center', gap: 4 },
  brandText: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  titleText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, lineHeight: 20 },
  metaRow:   { flexDirection: 'row', alignItems: 'center' },
  metaText:  { fontSize: 12, color: colors.textSecondary },
  metaDot:   { fontSize: 12, color: colors.textTertiary },
  priceRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  priceText: { fontSize: 15, fontWeight: '700', color: colors.primaryGreen },
  originalPrice: { fontSize: 12, color: colors.textTertiary, textDecorationLine: 'line-through' },
});

export default BicycleListCard;
