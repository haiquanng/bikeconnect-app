import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { globalLoading } from '../../components/ui/GlobalLoading';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { Button } from '../../components/atoms';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { updateUser } from '../../redux/auth/authSlice';
import { addressService } from '../../api/addressService';
import { Address } from '../../types/user';

const AddressListScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const [addresses, setAddresses] = useState<Address[]>(
    user?.addresses || [],
  );
  const [deleting, setDeleting] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const freshAddresses = user?.addresses || [];
      setAddresses(freshAddresses);
    }, [user?.addresses]),
  );

  const handleDelete = (address: Address) => {
    Alert.alert(
      'Xoá địa chỉ',
      `Bạn có chắc chắn muốn xoá "${address.label}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            if (!address._id) {
              return;
            }
            setDeleting(address._id);
            try {
              const updatedAddresses = await addressService.deleteAddress(
                address._id,
              );
              dispatch(updateUser({ addresses: updatedAddresses }));
              setAddresses(updatedAddresses);
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xoá địa chỉ');
            } finally {
              setDeleting(null);
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (address: Address) => {
    if (!address._id || address.isDefault) {
      return;
    }
    globalLoading.show();
    try {
      const updatedAddresses = await addressService.setDefaultAddress(
        address._id,
      );
      dispatch(updateUser({ addresses: updatedAddresses }));
      setAddresses(updatedAddresses);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đặt địa chỉ mặc định');
    } finally {
      globalLoading.hide();
    }
  };

  const formatAddress = (address: Address): string => {
    const parts = [address.street, address.ward, address.district, address.city];
    return parts.filter(Boolean).join(', ');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa chỉ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon
              name="location-outline"
              size={64}
              color={colors.gray[300]}
            />
            <Text style={styles.emptyText}>Chưa có địa chỉ nào</Text>
            <Text style={styles.emptySubText}>
              Thêm địa chỉ để thuận tiện khi mua hàng
            </Text>
          </View>
        ) : (
          addresses.map((address, index) => (
            <TouchableOpacity
              key={address._id || index}
              style={styles.addressCard}
              onPress={() => handleSetDefault(address)}
              onLongPress={() => handleDelete(address)}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                  <Icon
                    name="location-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.labelRow}>
                    <Text style={styles.addressLabel}>{address.label}</Text>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Mặc định</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressDetail} numberOfLines={2}>
                    {formatAddress(address)}
                  </Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate('AddAddress', { address })
                  }
                >
                  <Icon
                    name="create-outline"
                    size={20}
                    color={colors.gray[500]}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(address)}
                  disabled={deleting === address._id}
                >
                  {deleting === address._id ? (
                    <ActivityIndicator size="small" color={colors.error} />
                  ) : (
                    <Icon
                      name="trash-outline"
                      size={20}
                      color={colors.error}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          title="Thêm địa chỉ mới"
          onPress={() => navigation.navigate('AddAddress')}
          style={styles.addButton}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 16,
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  addressDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  addButton: {
    borderRadius: 12,
    backgroundColor: colors.primary,
    height: 56,
  },
});

export default AddressListScreen;
