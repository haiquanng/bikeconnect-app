import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import type { BicycleListing } from '../../types/bicycle';

const CARD_W = 180;
const CARD_H = 120;

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

interface Props {
  item: BicycleListing;
  onPress?: () => void;
}

const BicycleFeaturedCard: React.FC<Props> = ({ item, onPress }) => {
  const img = item.images.find(i => i.isPrimary) ?? item.images[0];

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.imageBox}>
        {img ? (
          <Image source={{ uri: img.url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback}>
            <Icon name="bicycle-outline" size={32} color={colors.gray[400]} />
          </View>
        )}
        {item.isInspected && (
          <View style={styles.badge}>
            <Icon name="checkmark-circle" size={12} color={colors.white} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        {item.brand && (
          <Text style={styles.brand} numberOfLines={1}>{item.brand.name}</Text>
        )}
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginRight: 12,
  },
  imageBox: {
    width: CARD_W,
    height: CARD_H,
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
  badge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info:  { padding: 10, gap: 3 },
  brand: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, lineHeight: 18 },
  price: { fontSize: 14, fontWeight: '700', color: colors.primaryGreen, marginTop: 2 },
});

export default BicycleFeaturedCard;
