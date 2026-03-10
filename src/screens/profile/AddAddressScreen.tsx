import React, { useState, useEffect } from 'react';
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
import { shippingService, GHNProvince, GHNDistrict, GHNWard } from '../../api/shippingService';
import { Address } from '../../types/user';

const AddAddressScreen = ({ navigation, route }: any) => {
  const dispatch = useAppDispatch();
  const editAddress: Address | undefined = route.params?.address;
  const isEditMode = !!editAddress;

  const [label, setLabel] = useState(editAddress?.label || '');
  const [street, setStreet] = useState(editAddress?.street || '');
  const [isDefault, setIsDefault] = useState(editAddress?.isDefault || false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // GHN data
  const [provinces, setProvinces] = useState<GHNProvince[]>([]);
  const [districts, setDistricts] = useState<GHNDistrict[]>([]);
  const [wards, setWards] = useState<GHNWard[]>([]);

  // Loading states for each level
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Selected values
  const [selectedProvince, setSelectedProvince] = useState<GHNProvince | null>(
    editAddress?.provinceId ? { ProvinceID: editAddress.provinceId, ProvinceName: editAddress.provinceName || '' } : null,
  );
  const [selectedDistrict, setSelectedDistrict] = useState<GHNDistrict | null>(
    editAddress?.districtId ? { DistrictID: editAddress.districtId, DistrictName: editAddress.districtName || '', ProvinceID: editAddress.provinceId || 0 } : null,
  );
  const [selectedWard, setSelectedWard] = useState<GHNWard | null>(
    editAddress?.wardCode ? { WardCode: editAddress.wardCode, WardName: editAddress.wardName || '', DistrictID: editAddress.districtId || 0 } : null,
  );

  // Picker visibility
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [showWardPicker, setShowWardPicker] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    setLoadingProvinces(true);
    shippingService.getProvinces()
      .then(data => setProvinces(data))
      .catch(() => Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh/thành'))
      .finally(() => setLoadingProvinces(false));
  }, []);

  // Load districts when province selected
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict(null);
      setWards([]);
      setSelectedWard(null);
      return;
    }
    setLoadingDistricts(true);
    shippingService.getDistricts(selectedProvince.ProvinceID)
      .then(data => setDistricts(data))
      .catch(() => Alert.alert('Lỗi', 'Không thể tải danh sách quận/huyện'))
      .finally(() => setLoadingDistricts(false));
  }, [selectedProvince]);

  // Load wards when district selected
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard(null);
      return;
    }
    setLoadingWards(true);
    shippingService.getWards(selectedDistrict.DistrictID)
      .then(data => setWards(data))
      .catch(() => Alert.alert('Lỗi', 'Không thể tải danh sách phường/xã'))
      .finally(() => setLoadingWards(false));
  }, [selectedDistrict]);

  const handleProvinceSelect = (item: { label: string; value: string | number }) => {
    const province = provinces.find(p => p.ProvinceID === Number(item.value));
    if (province) {
      setSelectedProvince(province);
      setSelectedDistrict(null);
      setSelectedWard(null);
    }
    setShowProvincePicker(false);
  };

  const handleDistrictSelect = (item: { label: string; value: string | number }) => {
    const district = districts.find(d => d.DistrictID === Number(item.value));
    if (district) {
      setSelectedDistrict(district);
      setSelectedWard(null);
    }
    setShowDistrictPicker(false);
  };

  const handleWardSelect = (item: { label: string; value: string | number }) => {
    const ward = wards.find(w => w.WardCode === String(item.value));
    if (ward) { setSelectedWard(ward); }
    setShowWardPicker(false);
  };

  const handleSubmit = async () => {
    if (!label.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên địa chỉ');
      return;
    }
    if (!selectedProvince) {
      Alert.alert('Lỗi', 'Vui lòng chọn Tỉnh/Thành phố');
      return;
    }
    if (!selectedDistrict) {
      Alert.alert('Lỗi', 'Vui lòng chọn Quận/Huyện');
      return;
    }
    if (!selectedWard) {
      Alert.alert('Lỗi', 'Vui lòng chọn Phường/Xã');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    const addressData: Omit<Address, '_id'> = {
      label: label.trim(),
      street: street.trim(),
      provinceName: selectedProvince.ProvinceName,
      provinceId: selectedProvince.ProvinceID,
      districtName: selectedDistrict.DistrictName,
      districtId: selectedDistrict.DistrictID,
      wardName: selectedWard.WardName,
      wardCode: selectedWard.WardCode,
      fullAddress: [selectedWard.WardName, selectedDistrict.DistrictName, selectedProvince.ProvinceName].join(', '),
      isDefault,
    };

    try {
      let updatedAddresses: Address[];

      if (isEditMode && editAddress?._id) {
        updatedAddresses = await addressService.updateAddress(editAddress._id, addressData);
      } else {
        updatedAddresses = await addressService.addAddress(addressData);
      }

      dispatch(updateUser({ addresses: updatedAddresses }));

      setTimeout(() => {
        Alert.alert(
          'Thành công',
          isEditMode ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
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
    if (!editAddress?._id) { return; }
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
              const updatedAddresses = await addressService.deleteAddress(editAddress._id!);
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

  const provinceItems = provinces.map(p => ({ label: p.ProvinceName, value: String(p.ProvinceID) }));
  const districtItems = districts.map(d => ({ label: d.DistrictName, value: String(d.DistrictID) }));
  const wardItems = wards.map(w => ({ label: w.WardName, value: w.WardCode }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Label */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên địa chỉ <Text style={styles.required}>*</Text></Text>
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

        {/* Province */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tỉnh/Thành phố <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => !loadingProvinces && setShowProvincePicker(true)}
          >
            {loadingProvinces ? (
              <ActivityIndicator size="small" color={colors.primaryGreen} />
            ) : (
              <>
                <Text style={[styles.pickerText, !selectedProvince && styles.pickerPlaceholder]}>
                  {selectedProvince?.ProvinceName || 'Chọn Tỉnh/Thành phố'}
                </Text>
                <Icon name="chevron-down-outline" size={20} color={colors.gray[400]} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* District */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quận/Huyện <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={[styles.inputContainer, !selectedProvince && styles.inputDisabled]}
            onPress={() => selectedProvince && !loadingDistricts && setShowDistrictPicker(true)}
            disabled={!selectedProvince}
          >
            {loadingDistricts ? (
              <ActivityIndicator size="small" color={colors.primaryGreen} />
            ) : (
              <>
                <Text style={[styles.pickerText, !selectedDistrict && styles.pickerPlaceholder]}>
                  {selectedDistrict?.DistrictName || (selectedProvince ? 'Chọn Quận/Huyện' : 'Chọn Tỉnh/Thành trước')}
                </Text>
                <Icon name="chevron-down-outline" size={20} color={colors.gray[400]} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Ward */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phường/Xã <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={[styles.inputContainer, !selectedDistrict && styles.inputDisabled]}
            onPress={() => selectedDistrict && !loadingWards && setShowWardPicker(true)}
            disabled={!selectedDistrict}
          >
            {loadingWards ? (
              <ActivityIndicator size="small" color={colors.primaryGreen} />
            ) : (
              <>
                <Text style={[styles.pickerText, !selectedWard && styles.pickerPlaceholder]}>
                  {selectedWard?.WardName || (selectedDistrict ? 'Chọn Phường/Xã' : 'Chọn Quận/Huyện trước')}
                </Text>
                <Icon name="chevron-down-outline" size={20} color={colors.gray[400]} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Street */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số nhà, tên đường</Text>
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
        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIsDefault(!isDefault)}>
          <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
            {isDefault && <Icon name="checkmark" size={16} color={colors.white} />}
          </View>
          <Text style={styles.checkboxLabel}>Đặt làm địa chỉ mặc định</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Fixed Bottom */}
      <View style={styles.bottomContainer}>
        {isEditMode ? (
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={deleting}>
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
        visible={showProvincePicker}
        title="Chọn Tỉnh/Thành phố"
        data={provinceItems}
        onSelect={handleProvinceSelect}
        onClose={() => setShowProvincePicker(false)}
        placeholder="Tìm tỉnh/thành phố..."
      />
      <SearchablePickerModal
        visible={showDistrictPicker}
        title="Chọn Quận/Huyện"
        data={districtItems}
        onSelect={handleDistrictSelect}
        onClose={() => setShowDistrictPicker(false)}
        placeholder="Tìm quận/huyện..."
      />
      <SearchablePickerModal
        visible={showWardPicker}
        title="Chọn Phường/Xã"
        data={wardItems}
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
    shadowOffset: { width: 0, height: -2 },
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
