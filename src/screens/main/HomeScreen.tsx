import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import { colors } from '../../theme';
import Icon from 'react-native-vector-icons/Ionicons';

const HomeScreen = () => {
  const user = useAppSelector(state => state.auth.user);

  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <Icon name="hand-left" size={40} color={colors.primaryGreen} />
        <Text style={styles.greeting}>Hello, {user?.fullName || 'Guest'}!</Text>
        <Text style={styles.subtitle}>Welcome to BikeConnect</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;
