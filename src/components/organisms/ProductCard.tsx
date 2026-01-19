import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  isHighDemand?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
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
            <Text style={styles.highDemandText}>High demand</Text>
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
    backgroundColor: colors.white,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 260,
    backgroundColor: colors.gray[100],
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  highDemandText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
  info: {
    padding: 12,
  },
  brand: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  model: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 4,
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
    marginTop: 8,
  },
});

export default ProductCard;
