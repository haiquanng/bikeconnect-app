import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { colors } from '../../theme';
import { Button } from '../../components/atoms';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { updateUser } from '../../redux/auth/authSlice';
import { authService } from '../../api/authService';
import { uploadImageToCloudinary } from '../../api/uploadService';

const ProfileEditScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, _setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const validatePhone = (phoneInput: string): boolean => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phoneInput);
  };

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Lỗi', 'Không thể chọn ảnh');
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        return;
      }

      setUploadingAvatar(true);
      try {
        const uploadResult = await uploadImageToCloudinary(asset.uri);
        setAvatarUrl(uploadResult.url);
        Alert.alert('Thành công', 'Tải ảnh lên thành công');
      } catch (error: any) {
        Alert.alert('Lỗi', error.message || 'Không thể tải ảnh lên');
      } finally {
        setUploadingAvatar(false);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi chọn ảnh');
    }
  };

  const handleUpdate = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return;
    }

    if (phone && !validatePhone(phone)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ (10-11 số)');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const updatedUser = await authService.updateProfile({
        fullName,
        phone,
        avatarUrl: avatarUrl || undefined,
      });
      dispatch(updateUser(updatedUser));

      // Show success and navigate back
      setTimeout(() => {
        Alert.alert('Thành công', 'Cập nhật hồ sơ thành công', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }, 100);
    } catch (error: any) {
      console.log('Update profile error:', error);
      setTimeout(() => {
        Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi cập nhật');
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  avatarUrl ||
                  'https://api.dicebear.com/9.x/adventurer/svg?seed=Easton',
              }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.changeAvatarButton}
              onPress={handlePickImage}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Icon name="camera" size={20} color={colors.white} />
                  <Text style={styles.changeAvatarText}>Đổi ảnh</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nguyễn Văn A"
              placeholderTextColor={colors.gray[300]}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputContainer, styles.inputDisabled]}>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              placeholderTextColor={colors.gray[300]}
              value={email}
              editable={false}
            />
            <Icon name="mail-outline" size={20} color={colors.gray[400]} />
          </View>
          <Text style={styles.hint}>Email không thể thay đổi</Text>
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số điện thoại</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="0912345678"
              placeholderTextColor={colors.gray[300]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Icon name="call-outline" size={20} color={colors.gray[400]} />
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          title="Cập nhật"
          onPress={handleUpdate}
          loading={loading}
          disabled={loading}
          style={styles.updateButton}
          size="md"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // Extra padding for bottom button
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gray[200],
  },
  changeAvatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 20,
    minWidth: 120,
  },
  changeAvatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: 16,
    height: 56,
  },
  inputDisabled: {
    backgroundColor: colors.gray[100],
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  updateButton: {
    borderRadius: 12,
    backgroundColor: colors.primary,
    height: 56,
  },
});

export default ProfileEditScreen;
