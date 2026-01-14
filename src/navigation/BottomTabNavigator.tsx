import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';
import SellScreen from '../screens/SellScreen';
import InboxScreen from '../screens/InboxScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

// --- Components ---

// 1. Active Indicator (Top Line)
const ActiveIndicator = ({
  focused,
  color,
}: {
  focused: boolean;
  color: string;
}) => {
  if (!focused) return null;
  return <View style={[styles.activeIndicator, { backgroundColor: color }]} />;
};

// 2. Wave Animation Background
const WaveBackground = () => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.wave,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.2)', 'transparent']}
          // Changed to black/gray for visibility on white background,
          // or use primary color? User said "wave layer".
          // Let's try subtle primary color or just shadow.
          // Previous was white on white which is invisible.
          // Let's use a subtle gray or primary color.
          // The user said "wave layer covering".
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

// 3. Custom Center Button with Label
const CustomTabBarButton = ({ children, onPress }: any) => (
  <View style={styles.customButtonContainer}>
    <TouchableOpacity
      style={styles.customButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
    <Text style={styles.customButtonLabel}>Đăng bán</Text>
  </View>
);

// 4. Tab Icons
interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

const HomeTabBarIcon = ({ color, size, focused }: TabBarIconProps) => (
  <View style={styles.iconContainer}>
    <ActiveIndicator focused={focused} color={color} />
    <Icon name={focused ? 'home' : 'home-outline'} size={size} color={color} />
  </View>
);

const ShopTabBarIcon = ({ color, size, focused }: TabBarIconProps) => (
  <View style={styles.iconContainer}>
    <ActiveIndicator focused={focused} color={color} />
    <Icon
      name={focused ? 'storefront' : 'storefront-outline'}
      size={size}
      color={color}
    />
  </View>
);

const SellTabBarIcon = () => <Icon name="add" size={32} color={colors.white} />;

const InboxTabBarIcon = ({ color, size, focused }: TabBarIconProps) => (
  <View style={styles.iconContainer}>
    <ActiveIndicator focused={focused} color={color} />
    <Icon
      name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
      size={size}
      color={color}
    />
  </View>
);

const ProfileTabBarIcon = ({ color, size, focused }: TabBarIconProps) => (
  <View style={styles.iconContainer}>
    <ActiveIndicator focused={focused} color={color} />
    <Icon
      name={focused ? 'person' : 'person-outline'}
      size={size}
      color={color}
    />
  </View>
);

// --- Main Navigator ---

const renderTabBarBackground = () => <WaveBackground />;

const BottomTabNavigator = () => {
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray[400],
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarBackground: renderTabBarBackground,
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
            tabBarLabel: () => null, // Hide default label as we render it in CustomButton
            tabBarIcon: SellTabBarIcon,
            tabBarButton: CustomTabBarButton,
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

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // overflow: 'hidden', // Removed to allow center button to float
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 50,
  },
  customButtonContainer: {
    top: -35, // Raised higher to float nicely (approx 50% out)
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: 64, // Slightly larger
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 4,
  },
  customButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[400],
    marginBottom: 0,
  },
  activeIndicator: {
    position: 'absolute',
    top: -12,
    height: 3,
    width: 40,
    borderRadius: 2,
  },
  wave: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    opacity: 0.1,
  },
});

export default BottomTabNavigator;
