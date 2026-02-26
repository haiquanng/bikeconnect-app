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
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { Button } from '../../components/atoms';
import { SuccessModal } from '../../components/ui';
import { authService } from '../../api/authService';
import { useAppDispatch } from '../../redux/hooks';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  updateUser,
} from '../../redux/auth/authSlice';
import { authStorage } from '../../utils/authStorage';

const LoginScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);
    dispatch(loginStart());

    try {
      // Call API
      const response = await authService.login({ email, password });

      const basicUser = {
        id: response.data.id,
        email: response.data.email,
        fullName: response.data.fullName,
        avatarUrl: response.data.avatarUrl,
        roles: response.data.roles,
        isVerified: response.data.isVerified,
        authProvider: response.data.authProvider,
        reputationScore: 0,
        isActive: true,
      };

      const tokens = {
        idToken: response.data.idToken,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
      };

      // Store user data and tokens in Redux
      dispatch(
        loginSuccess({
          user: basicUser,
          ...tokens,
        }),
      );

      try {
        const fullProfile = await authService.getProfile();
        dispatch(updateUser(fullProfile));
        authStorage.save({ refreshToken: tokens.refreshToken, user: fullProfile }).catch(() => {});
      } catch (profileError) {
        console.log(
          'Failed to fetch full profile, using basic data:',
          profileError,
        );
        // Persist basic user if profile fetch fails
        authStorage.save({ refreshToken: tokens.refreshToken, user: basicUser }).catch(() => {});
      }

      // Dismiss keyboard and stop loading
      setLoading(false);
      Keyboard.dismiss();

      // Show success modal after a brief delay to ensure keyboard is dismissed
      setTimeout(() => {
        setShowSuccess(true);
      }, 100);
    } catch (error: any) {
      console.log('Login error:', error);
      dispatch(loginFailure(error.message || 'Đã xảy ra lỗi'));
      setLoading(false);
      Keyboard.dismiss();

      // Show error alert after keyboard is dismissed
      setTimeout(() => {
        Alert.alert('Đăng nhập thất bại', error.message || 'Đã xảy ra lỗi');
      }, 100);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Navigate to Main screen
    navigation.replace('Main');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPasswordEmail');
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
          <Text style={styles.title}>Đăng nhập</Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ email của bạn</Text>
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

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder=""
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

          {/* Login Button */}
          <Button
            title="Đăng nhập"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
            size="md"
          />

          {/* Forgot Password */}
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Success Modal */}
        <SuccessModal
          visible={showSuccess}
          onClose={handleSuccessClose}
          title="Đăng nhập thành công"
          subtitle="Vui lòng đợi
                Đang chuyển đến trang chủ"
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
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: colors.primaryGreen,
    height: 50,
  },
  forgotPassword: {
    color: colors.textPrimary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LoginScreen;
