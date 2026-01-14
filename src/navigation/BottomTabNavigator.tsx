import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import CustomTabBar from '../components/organisms/CustomTabBar';
import TabIcon from '../components/atoms/TabIcon';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';
import SellScreen from '../screens/SellScreen';
import InboxScreen from '../screens/InboxScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Tab Icon Components
const HomeTabBarIcon = ({ color, size }: any) => (
  <TabIcon name="home" size={size} color={color} />
);

const ShopTabBarIcon = ({ color, size }: any) => (
  <TabIcon name="bicycle" size={size} color={color} />
);

const SellTabBarIcon = () => (
  <TabIcon name="add" size={32} color={colors.white} />
);

const InboxTabBarIcon = ({ color, size }: any) => (
  <TabIcon name="chatbubbles" size={size} color={color} />
);

const ProfileTabBarIcon = ({ color, size }: any) => (
  <TabIcon name="person" size={size} color={color} />
);

const BottomTabNavigator = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={CustomTabBar}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Nhà',
            tabBarIcon: HomeTabBarIcon,
          }}
        />
        <Tab.Screen
          name="Shop"
          component={ShopScreen}
          options={{
            tabBarLabel: 'Mua',
            tabBarIcon: ShopTabBarIcon,
          }}
        />
        <Tab.Screen
          name="Sell"
          component={SellScreen}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: SellTabBarIcon,
          }}
        />
        <Tab.Screen
          name="Inbox"
          component={InboxScreen}
          options={{
            tabBarLabel: 'Chat',
            tabBarIcon: InboxTabBarIcon,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Tôi',
            tabBarIcon: ProfileTabBarIcon,
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default BottomTabNavigator;
