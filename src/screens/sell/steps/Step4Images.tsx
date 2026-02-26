import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { uploadImageToCloudinary } from '../../../api/uploadService';
import { colors } from '../../../theme';
import type { MediaItem, CreateListingFormData } from '../../../types/bicycle';

interface Props {
  formData: CreateListingFormData;
  onChange: (updates: Partial<CreateListingFormData>) => void;
}

const MAX_IMAGES = 12;
const MIN_IMAGES = 3;

const Step4Images: React.FC<Props> = ({ formData, onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handlePickImages = async () => {
    const remaining = MAX_IMAGES - formData.images.length;
    if (remaining <= 0) {
      Toast.show({ type: 'info', text1: `Tối đa ${MAX_IMAGES} ảnh` });
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: remaining,
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
      });

      if (result.didCancel || !result.assets?.length) return;

      setUploading(true);
      const uploaded: MediaItem[] = [];

      for (const asset of result.assets) {
        if (!asset.uri) continue;
        try {
          const res = await uploadImageToCloudinary(asset.uri);
          uploaded.push({
            url: res.url,
            mediaType: 'image',
            isPrimary: formData.images.length === 0 && uploaded.length === 0,
            displayOrder: formData.images.length + uploaded.length,
          });
        } catch {
          // Skip failed images silently
        }
      }

      if (uploaded.length > 0) {
        onChange({ images: [...formData.images, ...uploaded] });
        Toast.show({ type: 'success', text1: `Đã tải lên ${uploaded.length} ảnh` });
      } else {
        Toast.show({ type: 'error', text1: 'Tải ảnh thất bại, vui lòng thử lại' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Không thể mở thư viện ảnh' });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    Alert.alert('Xóa ảnh', 'Bạn có chắc muốn xóa ảnh này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          const updated = formData.images.filter((_, i) => i !== index);
          if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
            updated[0] = { ...updated[0], isPrimary: true };
          }
          onChange({ images: updated });
        },
      },
    ]);
  };

  const hasImages = formData.images.length > 0;
  const imageCount = formData.images.length;

  return (
    <View>
      {/* Empty state — upload prompt */}
      {!hasImages && (
        <TouchableOpacity
          style={styles.emptyUpload}
          onPress={handlePickImages}
          disabled={uploading}
          activeOpacity={0.7}
        >
          <Icon name="image-outline" size={48} color={colors.gray[400]} />
          <Text style={styles.emptyUploadHint}>PNG, JPG, JPEG, WEBP</Text>
          <View style={styles.tipBadge}>
            <Text style={styles.tipBadgeText}>
              5+ ảnh giúp bán nhanh hơn <Text style={styles.tipBadgeEmphasis}>2 lần</Text>
            </Text>
          </View>
          {uploading ? (
            <ActivityIndicator color={colors.white} style={styles.uploadBtn} />
          ) : (
            <View style={styles.uploadBtn}>
              <Text style={styles.uploadBtnText}>Chọn ảnh từ thư viện</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Image grid */}
      {hasImages && (
        <View style={styles.imageGrid}>
          {/* Cover image */}
          <View style={styles.coverWrapper}>
            <Image source={{ uri: formData.images[0].url }} style={styles.coverImage} />
            <View style={styles.coverBadge}>
              <Text style={styles.coverBadgeText}>Ảnh bìa</Text>
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeImage(0)}
              activeOpacity={0.8}
            >
              <Icon name="close" size={14} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Remaining images */}
          {formData.images.slice(1).map((img, i) => (
            <View key={i + 1} style={styles.thumbWrapper}>
              <Image source={{ uri: img.url }} style={styles.thumbImage} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeImage(i + 1)}
                activeOpacity={0.8}
              >
                <Icon name="close" size={14} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add more slot */}
          {imageCount < MAX_IMAGES && (
            <TouchableOpacity
              style={styles.addMoreSlot}
              onPress={handlePickImages}
              disabled={uploading}
              activeOpacity={0.7}
            >
              {uploading ? (
                <ActivityIndicator color={colors.gray[400]} />
              ) : (
                <Icon name="add" size={28} color={colors.gray[400]} />
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Image counter + warning */}
      {hasImages && (
        <View style={styles.counterRow}>
          {imageCount < MIN_IMAGES && (
            <Text style={styles.warningText}>
              Vui lòng tải lên ít nhất {MIN_IMAGES} ảnh
            </Text>
          )}
          <Text style={styles.counterText}>
            {imageCount}/{MAX_IMAGES} ảnh
          </Text>
        </View>
      )}

      {/* Photo guide */}
      <View style={styles.guideBox}>
        <View style={styles.guideHeader}>
          <Icon name="camera-outline" size={18} color={colors.gray[500]} />
          <Text style={styles.guideTitle}>Góc chụp đề xuất</Text>
        </View>
        <View style={styles.guideAngles}>
          {[
            { icon: 'bicycle-outline', label: 'Bên phải' },
            { icon: 'bicycle-outline', label: 'Bên trái' },
            { icon: 'settings-outline', label: 'Hệ truyền\nđộng' },
          ].map((angle, i) => (
            <View key={i} style={styles.guideAngle}>
              <View style={styles.guideAngleIcon}>
                <Icon name={angle.icon as any} size={28} color={colors.gray[400]} />
              </View>
              <Text style={styles.guideAngleLabel}>{angle.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const THUMB_SIZE = 88;
const COVER_SIZE = 140;

const styles = StyleSheet.create({
  emptyUpload: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingVertical: 36,
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  emptyUploadHint: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  tipBadge: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tipBadgeText: {
    fontSize: 12,
    color: '#854D0E',
  },
  tipBadgeEmphasis: {
    fontWeight: '700',
  },
  uploadBtn: {
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 10,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  coverWrapper: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  coverBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  thumbWrapper: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreSlot: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningText: {
    fontSize: 12,
    color: colors.error,
  },
  counterText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  guideBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  guideAngles: {
    flexDirection: 'row',
    gap: 16,
  },
  guideAngle: {
    alignItems: 'center',
    gap: 4,
  },
  guideAngleIcon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideAngleLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default Step4Images;
