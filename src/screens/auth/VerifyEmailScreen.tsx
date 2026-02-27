import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { authService } from '../../api/authService';

const RESEND_COOLDOWN = 60;

const VerifyEmailScreen = ({ navigation, route }: any) => {
  const email: string = route?.params?.email ?? '';

  const [sending, setSending] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    intervalRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Auto-send on mount
  useEffect(() => {
    authService
      .sendEmailVerification()
      .then(() => {
        startCooldown();
      })
      .catch(() => {
        // Even if it fails, still start cooldown to avoid spam
        startCooldown();
      })
      .finally(() => {
        setSending(false);
      });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleResend = async () => {
    if (cooldown > 0 || sending) return;
    setSending(true);
    try {
      await authService.sendEmailVerification();
    } catch {
      // silently ignore
    } finally {
      setSending(false);
      startCooldown();
    }
  };

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Icon */}
      <View style={styles.iconWrapper}>
        <Icon name="mail-outline" size={64} color={colors.primaryGreen} />
      </View>

      <Text style={styles.title}>Xác nhận email</Text>

      <Text style={styles.subtitle}>
        Chúng tôi đã gửi email xác nhận đến
      </Text>
      {!!email && <Text style={styles.email}>{email}</Text>}
      <Text style={styles.hint}>
        Kiểm tra hộp thư (kể cả thư mục Spam) và nhấn vào liên kết xác nhận.
      </Text>

      {/* Resend */}
      {sending ? (
        <ActivityIndicator
          size="small"
          color={colors.primaryGreen}
          style={styles.spinner}
        />
      ) : cooldown > 0 ? (
        <Text style={styles.cooldownText}>
          Gửi lại sau{' '}
          <Text style={styles.cooldownNum}>{cooldown}s</Text>
        </Text>
      ) : (
        <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
          <Text style={styles.resendText}>Gửi lại email xác nhận</Text>
        </TouchableOpacity>
      )}

      {/* Continue */}
      <TouchableOpacity
        style={styles.continueBtn}
        onPress={handleContinue}
        activeOpacity={0.85}
      >
        <Text style={styles.continueBtnText}>Tiếp tục</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  email: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  hint: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  spinner: {
    marginBottom: 24,
  },
  cooldownText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  cooldownNum: {
    fontWeight: '700',
    color: colors.primaryGreen,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryGreen,
    marginBottom: 24,
    textDecorationLine: 'underline',
  },
  continueBtn: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primaryGreen,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default VerifyEmailScreen;
