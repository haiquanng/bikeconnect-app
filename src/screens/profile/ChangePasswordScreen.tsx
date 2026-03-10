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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { Button } from '../../components/atoms';
import { useAppSelector } from '../../redux/hooks';
import { apiClient } from '../../api/apiClient';
import { API_BASE_URL } from '../../config/appConfig';
import { User } from '../../types/user';

const ChangePasswordScreen = ({ navigation }: any) => {
  const user = useAppSelector(state => state.auth.user);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string): boolean => {
    return pwd.length >= 8 && /[a-zA-Z]/.test(pwd) && /\d/.test(pwd);
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      // Verify current password
      if (user?.password !== currentPassword) {
        throw new Error('Mật khẩu hiện tại không đúng');
      }

      // Update password via MockAPI
      await apiClient.put<User>(`${API_BASE_URL}/users/${user?.id}`, {
        ...user,
        password: newPassword,
      });

      // Show success and navigate back
      setTimeout(() => {
        Alert.alert('Thành công', 'Đổi mật khẩu thành công', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }, 100);
    } catch (error: any) {
      console.log('Change password error:', error);
      setTimeout(() => {
        Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi đổi mật khẩu');
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
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Current Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu hiện tại</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu hiện tại"
              placeholderTextColor={colors.gray[300]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.gray[400]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu mới</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor={colors.gray[300]}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.gray[400]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor={colors.gray[300]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.gray[400]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Password Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Mật khẩu phải chứa:</Text>
          <View style={styles.requirementItem}>
            <Icon
              name={
                newPassword.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'
              }
              size={16}
              color={
                newPassword.length >= 8 ? colors.success : colors.gray[400]
              }
            />
            <Text style={styles.requirementText}>Ít nhất 8 ký tự</Text>
          </View>
          <View style={styles.requirementItem}>
            <Icon
              name={
                /[a-zA-Z]/.test(newPassword)
                  ? 'checkmark-circle'
                  : 'ellipse-outline'
              }
              size={16}
              color={
                /[a-zA-Z]/.test(newPassword) ? colors.success : colors.gray[400]
              }
            />
            <Text style={styles.requirementText}>Ít nhất 1 chữ cái</Text>
          </View>
          <View style={styles.requirementItem}>
            <Icon
              name={
                /\d/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'
              }
              size={16}
              color={/\d/.test(newPassword) ? colors.success : colors.gray[400]}
            />
            <Text style={styles.requirementText}>Ít nhất 1 số</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          title="Đổi mật khẩu"
          onPress={handleChangePassword}
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
    paddingBottom: 100,
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
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  eyeIcon: {
    padding: 4,
  },
  requirementsContainer: {
    backgroundColor: colors.gray[50],
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
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

export default ChangePasswordScreen;
