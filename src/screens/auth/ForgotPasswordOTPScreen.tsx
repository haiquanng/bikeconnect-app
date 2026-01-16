import React, { useState, useRef, useEffect } from 'react';
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

interface ForgotPasswordOTPScreenProps {
  navigation: any;
  route: any;
}

const ForgotPasswordOTPScreen: React.FC<ForgotPasswordOTPScreenProps> = ({
  navigation,
  route,
}) => {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) {
      return;
    }

    try {
      // TODO: Call API to resend OTP
      // await authService.requestPasswordReset(email);

      Alert.alert('Thành công', 'Mã xác nhận đã được gửi lại');
      setResendTimer(60);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi');
    }
  };

  const handleContinue = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã xác nhận');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to verify OTP
      // await authService.verifyOTP(email, otpCode);

      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 1000));

      // Navigate to new password screen
      navigation.navigate('ForgotPasswordNewPassword', { email, otp: otpCode });
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Mã xác nhận không đúng');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Quên mật khẩu?</Text>
          <Text style={styles.subtitle}>
            Vui lòng nhập mã code gắn với tài khoản
          </Text>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                style={styles.otpInput}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                accessibilityLabel={`OTP digit ${index + 1}`}
              />
            ))}
          </View>

          {/* Resend Link */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Chưa nhận được mã code? </Text>
            <Pressable
              onPress={handleResend}
              disabled={resendTimer > 0}
              accessibilityRole="button"
              accessibilityLabel="Gửi lại mã"
            >
              <Text
                style={[
                  styles.resendLink,
                  resendTimer > 0 && styles.resendLinkDisabled,
                ]}
              >
                {resendTimer > 0 ? `${resendTimer}s` : 'Gửi lại'}
              </Text>
            </Pressable>
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
    marginBottom: 40,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resendLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: colors.gray[400],
  },
  continueButton: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
    height: 50,
  },
});

export default ForgotPasswordOTPScreen;
