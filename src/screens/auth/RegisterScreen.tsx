import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { Button } from '../../components/atoms';
import { SuccessModal } from '../../components/ui';
import { authService } from '../../api/authService';

const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateEmail = (emailInput: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailInput);
  };

  const validatePhone = (phoneInput: string): boolean => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phoneInput);
  };

  const handleRegister = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    if (phone && !validatePhone(phone)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ (10-11 số)');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        fullName,
        email,
        phone: phone || '',
        password,
        avatar:
          'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName),
        role: ['BUYER'],
        address: [],
        dob: '',
        emailNotification: true,
        pushNotification: true,
        gender: 0,
        isVerified: false,
        status: 'ACTIVE',
      };

      await authService.register(userData);

      // Dismiss keyboard and stop loading
      setLoading(false);
      Keyboard.dismiss();

      // Show success modal
      setTimeout(() => {
        setShowSuccess(true);
      }, 100);
    } catch (error: any) {
      console.log('Register error:', error);
      setLoading(false);
      Keyboard.dismiss();

      // Show error alert
      setTimeout(() => {
        Alert.alert('Đăng ký thất bại', error.message || 'Đã xảy ra lỗi');
      }, 100);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Navigate to Login screen
    navigation.navigate('Login');
  };

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
          bounces={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Đăng ký</Text>

          {/* Full Name Input */}
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

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="bikeconnect@gmail.com"
                placeholderTextColor={colors.gray[300]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Phone Input (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại (tùy chọn)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="0912345678"
                placeholderTextColor={colors.gray[300]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ít nhất 8 ký tự"
                placeholderTextColor={colors.gray[300]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.gray[400]}
                />
              </TouchableOpacity>
            </View>
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

          {/* Register Button */}
          <Button
            title="Đăng ký"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
            size="md"
          />

          {/* Login Link */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>
              Đã có tài khoản?{' '}
              <Text style={styles.loginLinkBold}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Success Modal */}
        <SuccessModal
          visible={showSuccess}
          onClose={handleSuccessClose}
          title="Đăng ký thành công"
          subtitle="Vui lòng đăng nhập để tiếp tục"
        />
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
    marginBottom: 20,
    marginTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 30,
    textAlign: 'center',
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
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: colors.primaryGreen,
    height: 50,
  },
  loginLink: {
    color: colors.textPrimary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '400',
  },
  loginLinkBold: {
    fontWeight: '600',
    color: colors.primary,
  },
});

export default RegisterScreen;
