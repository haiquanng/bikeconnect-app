import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import SearchablePickerModal from '../../../components/ui/SearchablePickerModal';
import { colors } from '../../../theme';
import { provinces } from '../../../data/helper/addressData';
import type { CreateListingFormData } from '../../../types/bicycle';
import {
  ORIGIN_OPTIONS,
  YEAR_OPTIONS,
  FRAME_SIZE_OPTIONS,
  FRAME_MATERIAL_OPTIONS,
  COLOR_OPTIONS,
} from '../../../types/bicycle';

interface Props {
  formData: CreateListingFormData;
  onChange: (updates: Partial<CreateListingFormData>) => void;
}

type PickerField = 'city' | 'origin' | 'yearManufactured' | 'frameSize' | 'frameMaterial' | 'color' | null;

const Step2BasicInfo: React.FC<Props> = ({ formData, onChange }) => {
  const [activePicker, setActivePicker] = useState<PickerField>(null);

  // const provinceCode = useMemo(
  //   () => findProvinceCodeByName(formData.city),
  //   [formData.city],
  // );

  const pickerConfig: Record<
    Exclude<PickerField, null>,
    { title: string; data: { label: string; value: string }[]; onSelect: (v: string) => void }
  > = {
    city: {
      title: 'Tỉnh / Thành phố',
      data: provinces,
      onSelect: v => {
        const item = provinces.find(p => p.value === v);
        onChange({ city: item?.label || v });
      },
    },
    origin: {
      title: 'Xuất xứ',
      data: ORIGIN_OPTIONS.map(o => ({ label: o, value: o })),
      onSelect: v => onChange({ origin: v }),
    },
    yearManufactured: {
      title: 'Năm sản xuất',
      data: YEAR_OPTIONS.map(y => ({ label: y, value: y })),
      onSelect: v => onChange({ yearManufactured: v }),
    },
    frameSize: {
      title: 'Kích thước khung',
      data: FRAME_SIZE_OPTIONS.map(s => ({ label: s, value: s })),
      onSelect: v => onChange({ frameSize: v }),
    },
    frameMaterial: {
      title: 'Chất liệu khung',
      data: FRAME_MATERIAL_OPTIONS.map(m => ({ label: m, value: m })),
      onSelect: v => onChange({ frameMaterial: v }),
    },
    color: {
      title: 'Màu sắc',
      data: COLOR_OPTIONS.map(c => ({ label: c, value: c })),
      onSelect: v => onChange({ color: v }),
    },
  };

  const openPicker = (field: Exclude<PickerField, null>) => setActivePicker(field);
  const closePicker = () => setActivePicker(null);

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

      {/* City */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Tỉnh / Thành phố</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => openPicker('city')}
          activeOpacity={0.7}
        >
          <Text style={formData.city ? styles.pickerValueText : styles.pickerPlaceholderText}>
            {formData.city || 'Chọn tỉnh / thành phố'}
          </Text>
          <Icon name="chevron-down" size={18} color={colors.gray[400]} />
        </TouchableOpacity>
      </View>

      {/* Row: Origin + Year */}
      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.fieldLabel}>Xuất xứ</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => openPicker('origin')}
            activeOpacity={0.7}
          >
            <Text style={formData.origin ? styles.pickerValueText : styles.pickerPlaceholderText} numberOfLines={1}>
              {formData.origin || 'Chọn'}
            </Text>
            <Icon name="chevron-down" size={16} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
        <View style={styles.rowGap} />
        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.fieldLabel}>Năm sản xuất</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => openPicker('yearManufactured')}
            activeOpacity={0.7}
          >
            <Text style={formData.yearManufactured ? styles.pickerValueText : styles.pickerPlaceholderText} numberOfLines={1}>
              {formData.yearManufactured || 'Chọn'}
            </Text>
            <Icon name="chevron-down" size={16} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Row: Frame size + Frame material */}
      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.fieldLabel}>Kích thước khung</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => openPicker('frameSize')}
            activeOpacity={0.7}
          >
            <Text style={formData.frameSize ? styles.pickerValueText : styles.pickerPlaceholderText} numberOfLines={1}>
              {formData.frameSize || 'Chọn'}
            </Text>
            <Icon name="chevron-down" size={16} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
        <View style={styles.rowGap} />
        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.fieldLabel}>Chất liệu khung</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => openPicker('frameMaterial')}
            activeOpacity={0.7}
          >
            <Text style={formData.frameMaterial ? styles.pickerValueText : styles.pickerPlaceholderText} numberOfLines={1}>
              {formData.frameMaterial || 'Chọn'}
            </Text>
            <Icon name="chevron-down" size={16} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Row: Electric toggle + Color */}
      <View style={styles.row}>
        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.fieldLabel}>Loại xe</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, formData.isElectric && styles.toggleBtnActive]}
              onPress={() => onChange({ isElectric: true })}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, formData.isElectric && styles.toggleTextActive]}>
                Xe điện
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, !formData.isElectric && styles.toggleBtnActive]}
              onPress={() => onChange({ isElectric: false })}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleText, !formData.isElectric && styles.toggleTextActive]}>
                Khác
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.rowGap} />
        <View style={[styles.fieldGroup, styles.flex1]}>
          <Text style={styles.fieldLabel}>Màu sắc</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => openPicker('color')}
            activeOpacity={0.7}
          >
            <Text style={formData.color ? styles.pickerValueText : styles.pickerPlaceholderText} numberOfLines={1}>
              {formData.color || 'Chọn'}
            </Text>
            <Icon name="chevron-down" size={16} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Picker Modals */}
      {activePicker && (
        <SearchablePickerModal
          visible={true}
          title={pickerConfig[activePicker].title}
          data={pickerConfig[activePicker].data}
          onSelect={item => {
            pickerConfig[activePicker].onSelect(item.value);
            closePicker();
          }}
          onClose={closePicker}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  required: {
    color: colors.error,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  textArea: {
    height: 96,
    paddingTop: 12,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: colors.white,
  },
  pickerValueText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  pickerPlaceholderText: {
    fontSize: 14,
    color: colors.gray[400],
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowGap: {
    width: 12,
  },
  flex1: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[200],
    alignItems: 'center',
  },
  toggleBtnActive: {
    borderColor: colors.primaryGreen,
    backgroundColor: '#F0FDF4',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.primaryGreen,
  },
});

export default Step2BasicInfo;
