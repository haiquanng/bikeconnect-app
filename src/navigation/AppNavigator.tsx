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
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import ProfileEditScreen from '../screens/profile/ProfileEditScreen';
import AddressListScreen from '../screens/profile/AddressListScreen';
import AddAddressScreen from '../screens/profile/AddAddressScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import OrdersScreen from '../screens/profile/OrdersScreen';
import ListingsScreen from '../screens/profile/ListingsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import HelpScreen from '../screens/profile/HelpScreen';
import SearchScreen from '../screens/main/SearchScreen';
import ChatDetailScreen from '../screens/main/ChatDetailScreen';
import BicycleDetailScreen from '../screens/main/BicycleDetailScreen';
import CheckoutScreen from '../screens/checkout/CheckoutScreen';
import OrderDetailScreen from '../screens/profile/OrderDetailScreen';
import SellerOrdersScreen from '../screens/profile/SellerOrdersScreen';
import SellerOrderDetailScreen from '../screens/profile/SellerOrderDetailScreen';
import WalletScreen from '../screens/profile/WalletScreen';
import WithdrawScreen from '../screens/profile/WithdrawScreen';
import TransactionDetailScreen from '../screens/profile/TransactionDetailScreen';
import InspectionReportScreen from '../screens/profile/InspectionReportScreen';
import PackageScreen from '../screens/profile/PackageScreen';
import VnpayWebViewScreen from '../screens/checkout/VnpayWebViewScreen';
import CreateListingScreen from '../screens/sell/CreateListingScreen';
import EditListingScreen from '../screens/sell/EditListingScreen';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Provider store={store}>
      <>
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
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
            <Stack.Screen name="AddressList" component={AddressListScreen} />
            <Stack.Screen name="AddAddress" component={AddAddressScreen} />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
            />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="Listings" component={ListingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
            <Stack.Screen name="CreateListing" component={CreateListingScreen} />
            <Stack.Screen name="BicycleDetail" component={BicycleDetailScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="SellerOrders" component={SellerOrdersScreen} />
            <Stack.Screen name="SellerOrderDetail" component={SellerOrderDetailScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="Withdraw" component={WithdrawScreen} />
            <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
            <Stack.Screen name="InspectionReport" component={InspectionReportScreen} />
            <Stack.Screen name="EditListing" component={EditListingScreen} />
            <Stack.Screen name="Package" component={PackageScreen} />
            <Stack.Screen name="VnpayWebView" component={VnpayWebViewScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </>
    </Provider>
  );
};

export default AppNavigator;
