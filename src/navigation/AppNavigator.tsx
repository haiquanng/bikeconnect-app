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
import ProfileEditScreen from '../screens/profile/ProfileEditScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import OrdersScreen from '../screens/profile/OrdersScreen';
import ListingsScreen from '../screens/profile/ListingsScreen';
import SalesScreen from '../screens/profile/SalesScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import HelpScreen from '../screens/profile/HelpScreen';

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
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
          />
          <Stack.Screen name="Orders" component={OrdersScreen} />
          <Stack.Screen name="Listings" component={ListingsScreen} />
          <Stack.Screen name="Sales" component={SalesScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default AppNavigator;
