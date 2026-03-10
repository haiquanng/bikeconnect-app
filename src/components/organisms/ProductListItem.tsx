import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { Product } from '../../types/product';

interface ProductListItemProps {
  product: Product;
  onPress?: () => void;
  isHighDemand?: boolean;
}

const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  onPress,
  isHighDemand = false,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.media.thumbnails[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favoriteButton}>
          <Icon name="heart-outline" size={18} color={colors.error} />
        </TouchableOpacity>
        <View style={styles.likeCount}>
          <Text style={styles.likeCountText}>36</Text>
        </View>
        {isHighDemand && (
          <View style={styles.highDemandBadge}>
            <Icon name="flame" size={12} color={colors.white} />
            <Text style={styles.highDemandText}>Được xem nhiều</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.brand}>{product.brandId}</Text>
        <Text style={styles.model} numberOfLines={2}>
          {product.modelId}
        </Text>
        <Text style={styles.details}>
          {product.year} · {product.frameSize} · {product.condition}
        </Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 4,
    overflow: 'hidden',
    height: 140,
    marginBottom: 16,
  },
  imageContainer: {
    width: 140,
    height: 140,
    backgroundColor: colors.gray[100],
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  likeCount: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  likeCountText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  highDemandBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  highDemandText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  model: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  details: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
});

export default ProductListItem;
