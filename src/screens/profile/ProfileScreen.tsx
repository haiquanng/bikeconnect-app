import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/auth/authSlice';
import { authStorage } from '../../utils/authStorage';
import { SCROLL_TO_TOP_EVENT } from '../../components/organisms/CustomTabBar';

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
  showChevron?: boolean;
  textColor?: string;
}

const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      SCROLL_TO_TOP_EVENT,
      ({ routeName }) => {
        if (routeName === 'Profile') {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        }
      },
    );
    return () => sub.remove();
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            authStorage.clear();
            navigation.replace('Welcome');
          },
        },
      ],
      { cancelable: true },
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'edit-profile',
      title: 'Chỉnh sửa hồ sơ',
      icon: 'person-outline',
      onPress: () => navigation.navigate('ProfileEdit'),
      showChevron: true,
    },
    {
      id: 'addresses',
      title: 'Địa chỉ',
      icon: 'location-outline',
      onPress: () => navigation.navigate('AddressList'),
      showChevron: true,
    },
    {
      id: 'change-password',
      title: 'Đổi mật khẩu',
      icon: 'lock-closed-outline',
      onPress: () => navigation.navigate('ChangePassword'),
      showChevron: true,
    },
    {
      id: 'wallet',
      title: 'Ví của tôi',
      icon: 'wallet-outline',
      onPress: () => navigation.navigate('Wallet'),
      showChevron: true,
    },
    {
      id: 'package',
      title: 'Gói dùng',
      icon: 'cube-outline',
      onPress: () => navigation.navigate('Package'),
      showChevron: true,
    },
    {
      id: 'orders',
      title: 'Đơn mua của tôi',
      icon: 'receipt-outline',
      onPress: () => navigation.navigate('Orders'),
      showChevron: true,
    },
    {
      id: 'listings',
      title: 'Sản phẩm đang bán',
      icon: 'list-outline',
      onPress: () => navigation.navigate('Listings'),
      showChevron: true,
    },
    {
      id: 'notifications',
      title: 'Thông báo',
      icon: 'notifications-outline',
      onPress: () => navigation.navigate('Notifications'),
      showChevron: true,
    },
    {
      id: 'help',
      title: 'Trợ giúp',
      icon: 'help-circle-outline',
      onPress: () => navigation.navigate('Help'),
      showChevron: true,
    },
    {
      id: 'signout',
      title: 'Đăng xuất',
      icon: 'log-out-outline',
      onPress: handleSignOut,
      showChevron: false,
      textColor: colors.error,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user?.avatarUrl ||
                  'https://api.dicebear.com/9.x/adventurer/svg?seed=Easton',
              }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => navigation.navigate('ProfileEdit')}
            >
              <Icon name="pencil" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.fullName || 'Người dùng'}</Text>
          <Text style={styles.userPhone}>{user?.phone || ''}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Icon
                    name={item.icon}
                    size={22}
                    color={item.textColor || colors.textPrimary}
                  />
                </View>
                <Text
                  style={[
                    styles.menuItemText,
                    item.textColor && { color: item.textColor },
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              {item.showChevron && (
                <Icon
                  name="chevron-forward"
                  size={20}
                  color={colors.gray[400]}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: 100, // Increased to prevent last item from being cut off
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  userCard: {
    backgroundColor: colors.white,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray[200],
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuContainer: {
    backgroundColor: colors.white,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});

export default ProfileScreen;
