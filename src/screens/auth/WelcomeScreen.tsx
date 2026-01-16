import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors } from '../../theme';
import { Button } from '../../components/atoms';

const WelcomeScreen = ({ navigation }: any) => {
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleGoogleLogin = () => {
    Alert.alert('Thông báo', 'Tính năng đang phát triển');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Spacer */}
        <View style={styles.topSpacer} />

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.brandContainer}>
            <Text style={styles.brandText}>
              <Text style={styles.brandGreen}>Bike</Text>
              <Text style={styles.brandBlack}>Connect</Text>
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Register and Login Buttons */}
          <View style={styles.authButtons}>
            <Button
              title="Đăng ký"
              onPress={handleRegister}
              variant="outline"
              style={styles.registerButton}
              textStyle={styles.registerButtonText}
              size="md"
            />
            <Button
              title="Đăng nhập"
              onPress={handleLogin}
              variant="primary"
              style={styles.loginButton}
              size="md"
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.divider} />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
          >
            <Image
              source={require('../../assets/icons/icon_google.png')}
              style={styles.googleIcon}
              resizeMode="contain"
            />
            <Text style={styles.googleButtonText}>Đăng nhập với Google</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
  },
  topSpacer: {
    flex: 0.5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 260,
    height: 260,
    marginBottom: 4,
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  brandGreen: {
    color: colors.primary,
  },
  brandBlack: {
    color: colors.textPrimary,
  },
  buttonsContainer: {
    width: '100%',
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  registerButton: {
    flex: 1,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.primaryGreen,
    backgroundColor: colors.white,
    height: 50,
  },
  registerButtonText: {
    color: colors.primaryGreen,
  },
  loginButton: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: colors.primaryGreen,
    height: 50,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[300],
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginHorizontal: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.primaryGreen,
    height: 50,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bottomSpacer: {
    flex: 1,
  },
});

export default WelcomeScreen;
