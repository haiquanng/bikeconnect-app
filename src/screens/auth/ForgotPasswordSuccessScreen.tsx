import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { Button } from '../../components/atoms';

interface ForgotPasswordSuccessScreenProps {
  navigation: any;
}

const ForgotPasswordSuccessScreen: React.FC<
  ForgotPasswordSuccessScreenProps
> = ({ navigation }) => {
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Animate checkmark
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    // Navigate back to login screen
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Icon name="checkmark" size={64} color={colors.white} />
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Đặt lại thành công</Text>
          <Text style={styles.subtitle}>
            Mật khẩu của bạn đã được đặt lại thành công
          </Text>
        </Animated.View>

        {/* Continue Button */}
        <Button
          title="Continue"
          onPress={handleContinue}
          style={styles.continueButton}
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 20,
  },
  continueButton: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: colors.primary,
    height: 50,
  },
});

export default ForgotPasswordSuccessScreen;
