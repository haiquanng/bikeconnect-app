import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updateUser } from '../../redux/auth/authSlice';
import { authStorage } from '../../utils/authStorage';
import { colors } from '../../theme';
import { kycService } from '../../api/kycService';
import { uploadImageToCloudinary } from '../../api/uploadService';
import type { KycInfo } from '../../api/kycService';
import type { KycStatus } from '../../types/user';

const STATUS_CONFIG: Record<KycStatus, { label: string; color: string; icon: string; bg: string }> = {
  NONE:     { label: 'Chưa xác minh',   color: colors.textSecondary, icon: 'shield-outline',        bg: colors.gray[100] },
  PENDING:  { label: 'Đang xử lý',      color: '#d97706',            icon: 'time-outline',          bg: '#fffbeb' },
  VERIFIED: { label: 'Đã xác minh',     color: colors.primaryGreen,  icon: 'shield-checkmark',      bg: '#ecfdf5' },
  REJECTED: { label: 'Xác minh thất bại', color: colors.error,       icon: 'shield-outline',        bg: '#fef2f2' },
};

const KYCScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.user);
  const refreshToken = useAppSelector(state => state.auth.refreshToken);
  const [kycInfo, setKycInfo] = useState<KycInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    kycService.getStatus()
      .then(setKycInfo)
      .catch(() => Alert.alert('Lỗi', 'Không thể tải thông tin xác minh.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.9 }, async response => {
      if (response.didCancel || !response.assets?.[0]?.uri) { return; }
      const uri = response.assets[0].uri!;
      setImageUri(uri);
    });
  };

  const handleVerify = async () => {
    if (!imageUri) {
      Alert.alert('Thiếu ảnh', 'Vui lòng chọn ảnh mặt trước CCCD/CMND');
      return;
    }

    setUploading(true);
    let uploadedUrl: string;
    try {
      uploadedUrl = (await uploadImageToCloudinary(imageUri)).url;
    } catch {
      Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
      setUploading(false);
      return;
    }
    setUploading(false);
    setVerifying(true);

    try {
      const result = await kycService.verify(uploadedUrl);
      setKycInfo(result);
      const kycFields = {
        kycStatus: result.kycStatus,
        kycFullName: result.kycFullName ?? undefined,
        kycIdNumber: result.kycIdNumber ?? undefined,
        kycDob: result.kycDob ?? undefined,
        kycAddress: result.kycAddress ?? undefined,
        kycVerifiedAt: result.kycVerifiedAt ?? undefined,
      };
      dispatch(updateUser(kycFields));
      // Persist to authStorage so kycStatus survives app restart
      if (currentUser && refreshToken) {
        const updatedUser = { ...currentUser, ...kycFields };
        authStorage.save({ refreshToken, user: updatedUser }).catch(() => {});
      }
      setImageUri(null);
      Alert.alert('Xác minh thành công', 'Danh tính của bạn đã được xác minh.');
    } catch {
      Alert.alert('Xác minh thất bại', 'Không thể đọc thông tin từ ảnh CCCD. Vui lòng chụp rõ mặt trước và thử lại.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác minh danh tính</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      </SafeAreaView>
    );
  }

  const status = kycInfo?.kycStatus ?? 'NONE';
  const config = STATUS_CONFIG[status];
  const isVerified = status === 'VERIFIED';
  const canVerify = status === 'NONE' || status === 'REJECTED';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác minh danh tính</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status card */}
        <View style={[styles.statusCard, { backgroundColor: config.bg }]}>
          <Icon name={config.icon as any} size={32} color={config.color} />
          <View style={styles.statusInfo}>
            <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
            {isVerified && kycInfo?.kycVerifiedAt && (
              <Text style={styles.statusDate}>
                Xác minh lúc {new Date(kycInfo.kycVerifiedAt).toLocaleDateString('vi-VN')}
              </Text>
            )}
          </View>
        </View>

        {/* Verified info */}
        {isVerified && kycInfo && (
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Thông tin đã xác minh</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Họ và tên</Text>
              <Text style={styles.infoValue}>{kycInfo.kycFullName ?? '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số CCCD</Text>
              <Text style={styles.infoValue}>{kycInfo.kycIdNumber ?? '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày sinh</Text>
              <Text style={styles.infoValue}>{kycInfo.kycDob ?? '—'}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Địa chỉ</Text>
              <Text style={[styles.infoValue, { flex: 1.5, textAlign: 'right' }]}>
                {kycInfo.kycAddress ?? '—'}
              </Text>
            </View>
          </View>
        )}

        {/* Why KYC */}
        {!isVerified && (
          <View style={styles.whyCard}>
            <Text style={styles.whyTitle}>Tại sao cần xác minh?</Text>
            {[
              'Rút tiền từ ví BikeConnect',
              'Thêm tài khoản ngân hàng',
              'Tăng độ tin cậy với người mua/bán',
            ].map(item => (
              <View key={item} style={styles.whyItem}>
                <Icon name="checkmark-circle" size={16} color={colors.primaryGreen} />
                <Text style={styles.whyText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Upload section */}
        {canVerify && (
          <>
            <View style={styles.uploadSection}>
              <Text style={styles.uploadTitle}>Chụp mặt trước CCCD/CMND</Text>
              <Text style={styles.uploadDesc}>
                Đảm bảo ảnh rõ ràng, đủ sáng, không bị che khuất hoặc mờ.
              </Text>

              <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Icon name="camera-outline" size={40} color={colors.gray[400]} />
                    <Text style={styles.imagePlaceholderText}>Nhấn để chọn ảnh</Text>
                  </View>
                )}
              </TouchableOpacity>

              {imageUri && (
                <TouchableOpacity style={styles.changeImageBtn} onPress={handlePickImage}>
                  <Text style={styles.changeImageText}>Chọn ảnh khác</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (!imageUri || uploading || verifying) && styles.btnDisabled]}
              onPress={handleVerify}
              disabled={!imageUri || uploading || verifying}
            >
              {uploading || verifying ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={colors.white} size="small" />
                  <Text style={styles.submitBtnText}>
                    {uploading ? 'Đang tải ảnh...' : 'Đang xác minh...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.submitBtnText}>Xác minh ngay</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.primaryGreen,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  content: { padding: 16, gap: 16, paddingBottom: 48 },

  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: 16, borderRadius: 14,
  },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: 16, fontWeight: '700' },
  statusDate: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

  infoCard: {
    backgroundColor: colors.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.gray[200],
  },
  infoCardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray[100],
  },
  infoLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  infoValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '600', flex: 1, textAlign: 'right' },

  whyCard: {
    backgroundColor: colors.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.gray[200], gap: 10,
  },
  whyTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  whyItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  whyText: { fontSize: 14, color: colors.textPrimary, flex: 1 },

  uploadSection: {
    backgroundColor: colors.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.gray[200], gap: 12,
  },
  uploadTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  uploadDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

  imagePicker: {
    height: 200, borderRadius: 12, overflow: 'hidden',
    borderWidth: 2, borderColor: colors.gray[200], borderStyle: 'dashed',
  },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.gray[50],
  },
  imagePlaceholderText: { fontSize: 14, color: colors.gray[400] },

  changeImageBtn: { alignSelf: 'center' },
  changeImageText: { fontSize: 14, color: colors.primaryGreen, fontWeight: '600' },

  submitBtn: {
    height: 52, backgroundColor: colors.primaryGreen,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});

export default KYCScreen;
