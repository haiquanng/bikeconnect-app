import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import SearchablePickerModal from '../../../components/ui/SearchablePickerModal';
import { colors } from '../../../theme';
import type { CreateListingFormData } from '../../../types/bicycle';
import {
  ORIGIN_OPTIONS,
  YEAR_OPTIONS,
  FRAME_SIZE_OPTIONS,
  FRAME_MATERIAL_OPTIONS,
  COLOR_OPTIONS,
} from '../../../types/bicycle';
import { shippingService, GHNProvince, GHNDistrict, GHNWard } from '../../../api/shippingService';

interface Props {
  formData: CreateListingFormData;
  onChange: (updates: Partial<CreateListingFormData>) => void;
}

type SpecPickerField = 'origin' | 'yearManufactured' | 'frameSize' | 'frameMaterial' | 'color' | null;

const Step2BasicInfo: React.FC<Props> = ({ formData, onChange }) => {
  const [activePicker, setActivePicker] = useState<SpecPickerField>(null);

  // GHN data
  const [provinces, setProvinces] = useState<GHNProvince[]>([]);
  const [districts, setDistricts] = useState<GHNDistrict[]>([]);
  const [wards, setWards]         = useState<GHNWard[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards]         = useState(false);

  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [showWardPicker, setShowWardPicker]         = useState(false);

  useEffect(() => {
    setLoadingProvinces(true);
    shippingService.getProvinces()
      .then(data => setProvinces(data))
      .catch(() => Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh/thành'))
      .finally(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    if (!formData.provinceId) { setDistricts([]); return; }
    setLoadingDistricts(true);
    shippingService.getDistricts(formData.provinceId)
      .then(data => setDistricts(data))
      .catch(() => Alert.alert('Lỗi', 'Không thể tải danh sách quận/huyện'))
      .finally(() => setLoadingDistricts(false));
  }, [formData.provinceId]);

  useEffect(() => {
    if (!formData.districtId) { setWards([]); return; }
    setLoadingWards(true);
    shippingService.getWards(formData.districtId)
      .then(data => setWards(data))
      .catch(() => Alert.alert('Lỗi', 'Không thể tải danh sách phường/xã'))
      .finally(() => setLoadingWards(false));
  }, [formData.districtId]);

  const handleProvinceSelect = (item: { label: string; value: string | number }) => {
    const province = provinces.find(p => p.ProvinceID === Number(item.value));
    if (province) {
      onChange({
        city: province.ProvinceName, provinceId: province.ProvinceID,
        district: '', districtId: null, ward: '', wardCode: '',
      });
    }
    setShowProvincePicker(false);
  };

  const handleDistrictSelect = (item: { label: string; value: string | number }) => {
    const district = districts.find(d => d.DistrictID === Number(item.value));
    if (district) {
      onChange({ district: district.DistrictName, districtId: district.DistrictID, ward: '', wardCode: '' });
    }
    setShowDistrictPicker(false);
  };

  const handleWardSelect = (item: { label: string; value: string | number }) => {
    const ward = wards.find(w => w.WardCode === String(item.value));
    if (ward) { onChange({ ward: ward.WardName, wardCode: ward.WardCode }); }
    setShowWardPicker(false);
  };

  const specPickerConfig: Record<
    Exclude<SpecPickerField, null>,
    { title: string; data: { label: string; value: string }[]; onSelect: (v: string) => void }
  > = {
    origin:           { title: 'Xuất xứ',          data: ORIGIN_OPTIONS.map(o => ({ label: o, value: o })),          onSelect: v => onChange({ origin: v }) },
    yearManufactured: { title: 'Năm sản xuất',      data: YEAR_OPTIONS.map(y => ({ label: y, value: y })),            onSelect: v => onChange({ yearManufactured: v }) },
    frameSize:        { title: 'Kích thước khung',  data: FRAME_SIZE_OPTIONS.map(s => ({ label: s, value: s })),     onSelect: v => onChange({ frameSize: v }) },
    frameMaterial:    { title: 'Chất liệu khung',   data: FRAME_MATERIAL_OPTIONS.map(m => ({ label: m, value: m })), onSelect: v => onChange({ frameMaterial: v }) },
    color:            { title: 'Màu sắc',            data: COLOR_OPTIONS.map(c => ({ label: c, value: c })),          onSelect: v => onChange({ color: v }) },
  };

  const provinceItems = provinces.map(p => ({ label: p.ProvinceName, value: String(p.ProvinceID) }));
  const districtItems = districts.map(d => ({ label: d.DistrictName, value: String(d.DistrictID) }));
  const wardItems     = wards.map(w => ({ label: w.WardName, value: w.WardCode }));

  return (
    <View>
      {/* Title */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          Tiêu đề tin đăng <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.textInput}
          value={formData.title}
          onChangeText={v => onChange({ title: v })}
          placeholder="Nhập tiêu đề tin đăng"
          placeholderTextColor={colors.gray[400]}
          returnKeyType="next"
        />
      </View>

      {/* Description */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Mô tả tin đăng</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.description}
          onChangeText={v => onChange({ description: v })}
          placeholder="Mô tả chi tiết về xe đạp của bạn..."
          placeholderTextColor={colors.gray[400]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Province */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Tỉnh / Thành phố</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => !loadingProvinces && setShowProvincePicker(true)}
          activeOpacity={0.7}
        >
          {loadingProvinces ? (
            <ActivityIndicator size="small" color={colors.primaryGreen} style={{ flex: 1 }} />
          ) : (
            <>
              <Text style={formData.city ? styles.pickerValueText : styles.pickerPlaceholderText} numberOfLines={1}>
                {formData.city || 'Chọn tỉnh / thành phố'}
              </Text>
              <Icon name="chevron-down" size={18} color={colors.gray[400]} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* District */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Quận / Huyện</Text>
        <TouchableOpacity
          style={[styles.pickerButton, !formData.provinceId && styles.pickerDisabled]}
          onPress={() => formData.provinceId && !loadingDistricts && setShowDistrictPicker(true)}
          activeOpacity={0.7}
          disabled={!formData.provinceId}
        >
          {loadingDistricts ? (
            <ActivityIndicator size="small" color={colors.primaryGreen} style={{ flex: 1 }} />
          ) : (
            <>
              <Text style={formData.district ? styles.pickerValueText : styles.pickerPlaceholderText} numberOfLines={1}>
                {formData.district || (formData.provinceId ? 'Chọn quận / huyện' : 'Chọn tỉnh/thành trước')}
              </Text>
              <Icon name="chevron-down" size={18} color={colors.gray[400]} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Ward */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Phường / Xã</Text>
        <TouchableOpacity
          style={[styles.pickerButton, !formData.districtId && styles.pickerDisabled]}
          onPress={() => formData.districtId && !loadingWards && setShowWardPicker(true)}
          activeOpacity={0.7}
          disabled={!formData.districtId}
        >
          {loadingWards ? (
            <ActivityIndicator size="small" color={colors.primaryGreen} style={{ flex: 1 }} />
          ) : (
            <>
              <Text style={formData.ward ? styles.pickerValueText : styles.pickerPlaceholderText} numberOfLines={1}>
                {formData.ward || (formData.districtId ? 'Chọn phường / xã' : 'Chọn quận/huyện trước')}
              </Text>
              <Icon name="chevron-down" size={18} color={colors.gray[400]} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Street */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Số nhà, tên đường</Text>
        <TextInput
          style={styles.textInput}
          value={formData.street}
          onChangeText={v => onChange({ street: v })}
          placeholder="VD: 123 Nguyễn Huệ"
          placeholderTextColor={colors.gray[400]}
        />
      </View>

      {/* Row: Origin + Year */}
      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.fieldLabel}>Xuất xứ</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setActivePicker('origin')} activeOpacity={0.7}>
            <Text style={formData.origin ? styles.pickerValueText : styles.pickerPlaceholderText} numberOfLines={1}>{formData.origin || 'Chọn'}</Text>
            <Icon name="chevron-down" size={16} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
        <View style={styles.rowGap} />
        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.fieldLabel}>Năm sản xuất</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setActivePicker('yearManufactured')} activeOpacity={0.7}>
            <Text style={formData.yearManufactured ? styles.pickerValueText : styles.pickerPlaceholderText} numberOfLines={1}>{formData.yearManufactured || 'Chọn'}</Text>
            <Icon name="chevron-down" size={16} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Row: Frame size + Frame material */}
      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.fieldLabel}>Kích thước khung</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setActivePicker('frameSize')} activeOpacity={0.7}>
            <Text style={formData.frameSize ? styles.pickerValueText : styles.pickerPlaceholderText} numberOfLines={1}>{formData.frameSize || 'Chọn'}</Text>
            <Icon name="chevron-down" size={16} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
        <View style={styles.rowGap} />
        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.fieldLabel}>Chất liệu khung</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setActivePicker('frameMaterial')} activeOpacity={0.7}>
            <Text style={formData.frameMaterial ? styles.pickerValueText : styles.pickerPlaceholderText} numberOfLines={1}>{formData.frameMaterial || 'Chọn'}</Text>
            <Icon name="chevron-down" size={16} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Row: Electric toggle + Color */}
      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.fieldLabel}>Loại xe</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity style={[styles.toggleBtn, formData.isElectric && styles.toggleBtnActive]} onPress={() => onChange({ isElectric: true })} activeOpacity={0.7}>
              <Text style={[styles.toggleText, formData.isElectric && styles.toggleTextActive]}>Xe điện</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleBtn, !formData.isElectric && styles.toggleBtnActive]} onPress={() => onChange({ isElectric: false })} activeOpacity={0.7}>
              <Text style={[styles.toggleText, !formData.isElectric && styles.toggleTextActive]}>Khác</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.rowGap} />
        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.fieldLabel}>Màu sắc</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setActivePicker('color')} activeOpacity={0.7}>
            <Text style={formData.color ? styles.pickerValueText : styles.pickerPlaceholderText} numberOfLines={1}>{formData.color || 'Chọn'}</Text>
            <Icon name="chevron-down" size={16} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Spec Picker Modals */}
      {activePicker && (
        <SearchablePickerModal
          visible={true}
          title={specPickerConfig[activePicker].title}
          data={specPickerConfig[activePicker].data}
          onSelect={item => { specPickerConfig[activePicker].onSelect(item.value as string); setActivePicker(null); }}
          onClose={() => setActivePicker(null)}
        />
      )}

      {/* GHN Location Picker Modals */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup:              { marginBottom: 16 },
  fieldLabel:              { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: 6 },
  required:                { color: colors.error },
  textInput: {
    borderWidth: 1, borderColor: colors.gray[300], borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 14,
    color: colors.textPrimary, backgroundColor: colors.white,
  },
  textArea:                { height: 96, paddingTop: 12 },
  pickerButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.gray[300], borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13, backgroundColor: colors.white,
  },
  pickerDisabled:          { opacity: 0.5 },
  pickerValueText:         { fontSize: 14, color: colors.textPrimary, flex: 1 },
  pickerPlaceholderText:   { fontSize: 14, color: colors.gray[400], flex: 1 },
  row:                     { flexDirection: 'row', alignItems: 'flex-start' },
  rowGap:                  { width: 12 },
  flex1:                   { flex: 1 },
  toggleRow:               { flexDirection: 'row', gap: 8 },
  toggleBtn:               { flex: 1, paddingVertical: 11, borderRadius: 10, borderWidth: 2, borderColor: colors.gray[200], alignItems: 'center' },
  toggleBtnActive:         { borderColor: colors.primaryGreen, backgroundColor: '#F0FDF4' },
  toggleText:              { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  toggleTextActive:        { color: colors.primaryGreen },
});

export default Step2BasicInfo;
