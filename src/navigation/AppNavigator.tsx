import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import BottomTabNavigator from './BottomTabNavigator';
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordEmailScreen from '../screens/auth/ForgotPasswordEmailScreen';
import ForgotPasswordOTPScreen from '../screens/auth/ForgotPasswordOTPScreen';
import ForgotPasswordNewPasswordScreen from '../screens/auth/ForgotPasswordNewPasswordScreen';
import ForgotPasswordSuccessScreen from '../screens/auth/ForgotPasswordSuccessScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="ForgotPasswordEmail"
            component={ForgotPasswordEmailScreen}
          />
          <Stack.Screen
            name="ForgotPasswordOTP"
            component={ForgotPasswordOTPScreen}
          />
          <Stack.Screen
            name="ForgotPasswordNewPassword"
            component={ForgotPasswordNewPasswordScreen}
          />
          <Stack.Screen
            name="ForgotPasswordSuccess"
            component={ForgotPasswordSuccessScreen}
          />
          <Stack.Screen name="Main" component={BottomTabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default AppNavigator;
