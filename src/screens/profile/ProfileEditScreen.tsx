import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { Button } from '../../components/atoms';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { loginSuccess } from '../../redux/auth/authSlice';
import { apiClient } from '../../api/apiClient';
import { API_BASE_URL } from '../../config/appConfig';
import { User } from '../../types/user';

const ProfileEditScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, _setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [gender, setGender] = useState(user?.gender || 0);
  const [loading, setLoading] = useState(false);

  const genderOptions = [
    { label: 'Nam', value: 0 },
    { label: 'Nữ', value: 1 },
    { label: 'Khác', value: 2 },
  ];

  const validatePhone = (phoneInput: string): boolean => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phoneInput);
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
      // Update user via MockAPI
      const updatedUser = await apiClient.put<User>(
        `${API_BASE_URL}/users/${user?.id}`,
        {
          ...user,
          fullName,
          email,
          phone,
          dob,
          gender,
        },
      );

      // Update Redux state
      dispatch(loginSuccess(updatedUser));

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

        {/* Date of Birth */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ngày sinh</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.gray[300]}
              value={dob}
              onChangeText={setDob}
            />
            <Icon name="calendar-outline" size={20} color={colors.gray[400]} />
          </View>
        </View>

        {/* Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Giới tính</Text>
          <View style={styles.genderContainer}>
            {genderOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderOption,
                  gender === option.value && styles.genderOptionActive,
                ]}
                onPress={() => setGender(option.value)}
              >
                <Text
                  style={[
                    styles.genderOptionText,
                    gender === option.value && styles.genderOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
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
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  genderOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  genderOptionTextActive: {
    color: colors.primary,
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
