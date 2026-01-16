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

interface ForgotPasswordEmailScreenProps {
  navigation: any;
}

const ForgotPasswordEmailScreen: React.FC<ForgotPasswordEmailScreenProps> = ({
  navigation,
}) => {
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    if (!userEmail.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    if (!validateEmail(userEmail)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to send OTP
      // await authService.requestPasswordReset(email);

      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 1000));

      // Navigate to OTP screen
      navigation.navigate('ForgotPasswordOTP', { email: userEmail });
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi');
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
            Vui lòng nhập mã email gắn với tài khoản
          </Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ email của bạn</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="bikeconnect@gmail.com"
                placeholderTextColor={colors.gray[300]}
                value={userEmail}
                onChangeText={setUserEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Email input"
              />
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
    marginBottom: 40,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 32,
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
  continueButton: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
    height: 50,
  },
});

export default ForgotPasswordEmailScreen;
