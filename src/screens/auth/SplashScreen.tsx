import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, gradients } from '../../theme';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-300)).current; // Start from left off-screen
  const fadeAnim = useRef(new Animated.Value(0)).current; // Start transparent

  useEffect(() => {
    // Start slide and fade animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to main screen after 2 seconds
    const timer = setTimeout(() => {
      navigation.navigate('Onboarding' as never);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, slideAnim, fadeAnim]);

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
