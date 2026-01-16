import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { Button } from '../../components/atoms';

interface ForgotPasswordNewPasswordScreenProps {
  navigation: any;
  route: any;
}

const ForgotPasswordNewPasswordScreen: React.FC<
  ForgotPasswordNewPasswordScreenProps
> = ({ navigation, route }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email, otp } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (
    pwd: string,
  ): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (pwd.length < 8) {
      errors.push('Ít nhất 8 ký tự');
    }
    if (!/[a-zA-Z]/.test(pwd)) {
      errors.push('Chứa ít nhất 1 chữ cái');
    }
    if (!/\d/.test(pwd)) {
      errors.push('Chứa ít nhất 1 số');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const getPasswordStrength = (
    pwd: string,
  ): {
    strength: string;
    color: string;
  } => {
    if (pwd.length === 0) {
      return { strength: '', color: colors.gray[300] };
    }

    const validation = validatePassword(pwd);
    if (validation.isValid) {
      return { strength: 'Mạnh', color: colors.success };
    }

    if (pwd.length >= 6) {
      return { strength: 'Trung bình', color: colors.warning };
    }

    return { strength: 'Yếu', color: colors.error };
  };

  const handleContinue = async () => {
    const validation = validatePassword(password);

    if (!validation.isValid) {
      Alert.alert('Lỗi', validation.errors.join('\n'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to reset password
      // await authService.resetPassword(email, otp, password);

      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 1000));

      // Navigate to success screen
      navigation.navigate('ForgotPasswordSuccess');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
          >
            <Icon name="arrow-back" size={24} color={colors.white} />
          </Pressable>

          {/* Title */}
          <Text style={styles.title}>Tạo mật khẩu mới</Text>
          <Text style={styles.subtitle}>
            Mật khẩu mới của bạn phải khác với mật khẩu đã sử dụng trước đó
          </Text>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor={colors.gray[300]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Password input"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                accessibilityRole="button"
                accessibilityLabel="Toggle password visibility"
              >
                <Icon
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.gray[400]}
                />
              </Pressable>
            </View>

            {/* Password Strength */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <Text
                  style={[
                    styles.strengthText,
                    { color: passwordStrength.color },
                  ]}
                >
                  {passwordStrength.strength}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor={colors.gray[300]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Confirm password input"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                accessibilityRole="button"
                accessibilityLabel="Toggle confirm password visibility"
              >
                <Icon
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.gray[400]}
                />
              </Pressable>
            </View>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>
              Mật khẩu phải chứa ít nhất:
            </Text>
            <View style={styles.requirementItem}>
              <Icon
                name={
                  password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'
                }
                size={16}
                color={password.length >= 8 ? colors.success : colors.gray[400]}
              />
              <Text style={styles.requirementText}>8 ký tự</Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon
                name={
                  /[a-zA-Z]/.test(password)
                    ? 'checkmark-circle'
                    : 'ellipse-outline'
                }
                size={16}
                color={
                  /[a-zA-Z]/.test(password) ? colors.success : colors.gray[400]
                }
              />
              <Text style={styles.requirementText}>1 chữ cái</Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon
                name={
                  /\d/.test(password) ? 'checkmark-circle' : 'ellipse-outline'
                }
                size={16}
                color={/\d/.test(password) ? colors.success : colors.gray[400]}
              />
              <Text style={styles.requirementText}>1 số</Text>
            </View>
          </View>

          {/* Continue Button */}
          <Button
            title="Tiếp tục"
            onPress={handleContinue}
            loading={loading}
            disabled={loading}
            style={styles.continueButton}
            size="md"
          />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
    fontWeight: '400',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: 16,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  eyeIcon: {
    padding: 4,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  requirementsContainer: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
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
  continueButton: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
    height: 50,
  },
});

export default ForgotPasswordNewPasswordScreen;
