import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { Button } from '../../components/atoms';
import { SearchablePickerModal } from '../../components/ui';
import { useAppDispatch } from '../../redux/hooks';
import { updateUser } from '../../redux/auth/authSlice';
import { addressService } from '../../api/addressService';
import { Address } from '../../types/user';
import {
  provinces,
  getWardsByProvince,
  findProvinceCodeByName,
} from '../../data/helper/addressData';

const AddAddressScreen = ({ navigation, route }: any) => {
  const dispatch = useAppDispatch();
  const editAddress: Address | undefined = route.params?.address;
  const isEditMode = !!editAddress;

  const [label, setLabel] = useState(editAddress?.label || '');
  const [street, setStreet] = useState(editAddress?.street || '');
  const [city, setCity] = useState(editAddress?.city || '');
  const [cityCode, setCityCode] = useState(() =>
    editAddress?.city ? findProvinceCodeByName(editAddress.city) : '',
  );
  const [ward, setWard] = useState(editAddress?.ward || '');
  const [isDefault, setIsDefault] = useState(editAddress?.isDefault || false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showWardPicker, setShowWardPicker] = useState(false);

  const wardsList = useMemo(
    () => (cityCode ? getWardsByProvince(cityCode) : []),
    [cityCode],
  );

  const handleCitySelect = (item: { label: string; value: string }) => {
    const provinceName = item.label
      .replace(/^Thành phố /, '')
      .replace(/^Tỉnh /, '');
    setCity(provinceName);
    setCityCode(item.value);
    setWard('');
    setShowCityPicker(false);
  };

  const handleWardSelect = (item: { label: string; value: string }) => {
    setWard(item.label);
    setShowWardPicker(false);
  };

  const handleSubmit = async () => {
    if (!label.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên địa chỉ');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    const addressData = {
      label: label.trim(),
      street: street.trim(),
      ward: ward.trim(),
      district: 'a',
      city: city.trim(),
      isDefault,
    };

    try {
      let updatedAddresses: Address[];

      if (isEditMode && editAddress?._id) {
        updatedAddresses = await addressService.updateAddress(
          editAddress._id,
          addressData,
        );
      } else {
        updatedAddresses = await addressService.addAddress(addressData);
      }

      dispatch(updateUser({ addresses: updatedAddresses }));

      setTimeout(() => {
        Alert.alert(
          'Thành công',
          isEditMode
            ? 'Cập nhật địa chỉ thành công'
            : 'Thêm địa chỉ thành công',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      }, 100);
    } catch (error: any) {
      setTimeout(() => {
        Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi');
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!editAddress?._id) {
      return;
    }
    Alert.alert(
      'Xoá địa chỉ',
      `Bạn có chắc chắn muốn xoá "${editAddress.label}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const updatedAddresses = await addressService.deleteAddress(
                editAddress._id!,
              );
              dispatch(updateUser({ addresses: updatedAddresses }));
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xoá địa chỉ');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
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
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Label */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Tên địa chỉ <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="VD: Nhà, Công ty"
              placeholderTextColor={colors.gray[300]}
              value={label}
              onChangeText={setLabel}
            />
          </View>
        </View>

        {/* City */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Thành phố/Tỉnh</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowCityPicker(true)}
          >
            <Text
              style={[styles.pickerText, !city && styles.pickerPlaceholder]}
            >
              {city || 'Chọn Thành phố/Tỉnh'}
            </Text>
            <Icon
              name="chevron-down-outline"
              size={20}
              color={colors.gray[400]}
            />
          </TouchableOpacity>
        </View>

        {/* Ward */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phường/Xã</Text>
          <TouchableOpacity
            style={[styles.inputContainer, !cityCode && styles.inputDisabled]}
            onPress={() => cityCode && setShowWardPicker(true)}
            disabled={!cityCode}
          >
            <Text
              style={[styles.pickerText, !ward && styles.pickerPlaceholder]}
            >
              {ward || (cityCode ? 'Chọn Phường/Xã' : 'Chọn Thành phố trước')}
            </Text>
            <Icon
              name="chevron-down-outline"
              size={20}
              color={colors.gray[400]}
            />
          </TouchableOpacity>
        </View>

        {/* Street */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Đường</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Số nhà, tên đường"
              placeholderTextColor={colors.gray[300]}
              value={street}
              onChangeText={setStreet}
            />
          </View>
        </View>

        {/* Default Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsDefault(!isDefault)}
        >
          <View
            style={[styles.checkbox, isDefault && styles.checkboxChecked]}
          >
            {isDefault && (
              <Icon name="checkmark" size={16} color={colors.white} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>Đặt làm địa chỉ mặc định</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Fixed Bottom */}
      <View style={styles.bottomContainer}>
        {isEditMode ? (
          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Icon name="trash-outline" size={22} color={colors.error} />
              )}
              <Text style={styles.deleteText}>Xoá</Text>
            </TouchableOpacity>
            <Button
              title="Hoàn thành"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || deleting}
              style={styles.submitButtonFlex}
              size="md"
            />
          </View>
        ) : (
          <Button
            title="Hoàn thành"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            size="md"
          />
        )}
      </View>

      {/* Picker Modals */}
      <SearchablePickerModal
        visible={showCityPicker}
        title="Chọn Thành phố/Tỉnh"
        data={provinces}
        onSelect={handleCitySelect}
        onClose={() => setShowCityPicker(false)}
        placeholder="Tìm thành phố/tỉnh..."
      />
      <SearchablePickerModal
        visible={showWardPicker}
        title="Chọn Phường/Xã"
        data={wardsList}
        onSelect={handleWardSelect}
        onClose={() => setShowWardPicker(false)}
        placeholder="Tìm phường/xã..."
      />
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
    padding: 24,
    paddingBottom: 120,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: 16,
    height: 56,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  pickerPlaceholder: {
    color: colors.gray[300],
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.textPrimary,
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.error,
  },
  submitButton: {
    borderRadius: 12,
    backgroundColor: colors.primary,
    height: 56,
  },
  submitButtonFlex: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.primary,
    height: 56,
  },
});

export default AddAddressScreen;
