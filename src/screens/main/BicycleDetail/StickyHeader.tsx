import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme';
import { showToast } from '../../../utils/toast';
import { formatPrice } from '../../../utils/helper';
import type { MediaItem } from '../../../types/bicycle';

interface Props {
  primaryImg?: MediaItem;
  title: string;
  price: number;
  originalPrice?: number;
  topInset: number;
  onBack: () => void;
}

const StickyHeader = ({ primaryImg, title, price, originalPrice, topInset, onBack }: Props) => (
  <View style={[styles.header, { paddingTop: topInset }]}>
    <TouchableOpacity style={styles.backBtn} onPress={onBack}>
      <Icon name="arrow-back" size={20} color={colors.textPrimary} />
    </TouchableOpacity>

    <View style={styles.content}>
      {primaryImg && (
        <Image
          source={{ uri: primaryImg.url }}
          style={styles.thumb}
          resizeMode="cover"
        />
      )}
      <View style={styles.textBox}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(price)}</Text>
          {originalPrice && originalPrice > price && (
            <Text style={styles.msrp}>{formatPrice(originalPrice)}</Text>
          )}
        </View>
      </View>
    </View>

    <TouchableOpacity
      style={styles.actionBtn}
      onPress={() => showToast('Đang phát triển')}
    >
      <Icon name="heart-outline" size={22} color={colors.textPrimary} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumb: {
    width: 46,
    height: 46,
    borderRadius: 6,
    backgroundColor: colors.gray[100],
  },
  textBox: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  price: { fontSize: 14, fontWeight: '700', color: colors.primaryGreen },
  msrp: {
    fontSize: 11,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  actionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});

export default StickyHeader;
