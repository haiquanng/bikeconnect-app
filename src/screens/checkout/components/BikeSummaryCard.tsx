import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme';

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Mới', LIKE_NEW: 'Như mới', GOOD: 'Tốt', FAIR: 'Khá', POOR: 'Cũ',
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

interface Props {
  title: string;
  price: number;
  primaryImage?: string;
  condition?: string;
}

const BikeSummaryCard: React.FC<Props> = ({ title, price, primaryImage, condition }) => (
  <View style={styles.card}>
    <View style={styles.imageBox}>
      {primaryImage ? (
        <Image source={{ uri: primaryImage }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imageFallback}>
          <Icon name="bicycle-outline" size={32} color={colors.gray[400]} />
        </View>
      )}
    </View>

    <View style={styles.info}>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      {condition && (
        <View style={styles.chip}>
          <Text style={styles.chipText}>{CONDITION_LABELS[condition] ?? condition}</Text>
        </View>
      )}
      <Text style={styles.price}>{formatPrice(price)}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    gap: 12,
  },
  imageBox: {
    width: 88,
    height: 66, // 4:3
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imageFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, justifyContent: 'space-between' },
  title: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, lineHeight: 20 },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  chipText: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  price: { fontSize: 16, fontWeight: '700', color: colors.primaryGreen, marginTop: 4 },
});

export default BikeSummaryCard;
