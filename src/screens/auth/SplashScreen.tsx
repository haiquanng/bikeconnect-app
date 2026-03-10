import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, gradients } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../redux/hooks';
import { loginSuccess, updateUser } from '../../redux/auth/authSlice';
import { authService } from '../../api/authService';
import { authStorage } from '../../utils/authStorage';

const SplashScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    const checkAuth = async () => {
      try {
        const saved = await authStorage.load();
        if (saved?.refreshToken) {
          const tokens = await authService.refreshToken(saved.refreshToken);
          dispatch(loginSuccess({
            user: saved.user,
            idToken: tokens.idToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
          }));
          // Sync fresh profile in background without blocking navigation
          authService.getProfile().then(profile => {
            const merged = { ...saved.user, ...profile };
            dispatch(updateUser(merged));
            authStorage.save({ refreshToken: tokens.refreshToken, user: merged }).catch(() => {});
          }).catch(() => {});
          navigation.navigate('Main' as never);
          return;
        }
      } catch {
        await authStorage.clear();
      }
      navigation.navigate('Onboarding' as never);
    };

    const timer = setTimeout(checkAuth, 2000);
    return () => clearTimeout(timer);
  }, [navigation, slideAnim, fadeAnim, dispatch]);

  return (
    <LinearGradient
      colors={gradients.primary}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* BikeConnect Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ translateX: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 276,
    height: 220,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
  },
  footerText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
});

export default SplashScreen;
