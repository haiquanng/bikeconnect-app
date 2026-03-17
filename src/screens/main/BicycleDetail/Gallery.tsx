import React from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme';
import { showToast } from '../../../utils/toast';
import type { MediaItem } from '../../../types/bicycle';

interface Props {
  images: MediaItem[] | null;
  W: number;
  GALLERY_H: number;
  topInset: number;
  imageIndex: number;
  onIndexChange: (i: number) => void;
  onBack: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  showWishlist?: boolean;
}

const Gallery = ({ images, W, GALLERY_H, topInset, imageIndex, onIndexChange, onBack, isWishlisted, onToggleWishlist, showWishlist }: Props) => (
  <View style={{ width: W, height: GALLERY_H }}>
    {images ? (
      <FlatList
        data={images}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          onIndexChange(Math.round(e.nativeEvent.contentOffset.x / W));
        }}
        renderItem={({ item: img }) => (
          <Image
            source={{ uri: img.url }}
            style={{ width: W, height: GALLERY_H }}
            resizeMode="cover"
          />
        )}
        getItemLayout={(_, index) => ({ length: W, offset: W * index, index })}
      />
    ) : (
      <View style={styles.fallback}>
        <Icon name="bicycle-outline" size={80} color={colors.gray[300]} />
      </View>
    )}

    <TouchableOpacity
      style={[styles.backBtn, { top: topInset + 10 }]}
      onPress={onBack}
    >
      <Icon name="arrow-back" size={20} color={colors.white} />
    </TouchableOpacity>

    {images && images.length > 1 && (
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {imageIndex + 1} / {images.length}
        </Text>
      </View>
    )}

    {showWishlist && onToggleWishlist && (
      <TouchableOpacity
        style={[styles.topRightBtn, { top: topInset + 10 }]}
        onPress={onToggleWishlist}
      >
        <Icon
          name={isWishlisted ? 'heart' : 'heart-outline'}
          size={20}
          color={isWishlisted ? '#EF4444' : colors.white}
        />
      </TouchableOpacity>
    )}

    <TouchableOpacity
      style={styles.shareBtn}
      onPress={() => showToast('Đang phát triển')}
    >
      <Icon name="share-social-outline" size={20} color={colors.white} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
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
  topRightBtn: {
    position: 'absolute',
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
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
});

export default Gallery;
