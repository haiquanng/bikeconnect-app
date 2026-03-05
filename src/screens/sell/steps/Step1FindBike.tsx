import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { categoryService } from '../../../api/categoryService';
import { bicycleService } from '../../../api/bicycleService';
import SearchablePickerModal from '../../../components/ui/SearchablePickerModal';
import { colors } from '../../../theme';
import type { Category } from '../../../types/category';
import type { Brand, BicycleModel, CreateListingFormData } from '../../../types/bicycle';

interface Props {
  formData: CreateListingFormData;
  onChange: (updates: Partial<CreateListingFormData>) => void;
}

const Step1FindBike: React.FC<Props> = ({ formData, onChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<BicycleModel[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [modelModalVisible, setModelModalVisible] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getActiveCategories();
        setCategories(data);
      } catch {
        // silence
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!formData.categoryId) return;
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const data = await bicycleService.getBrands();
        setBrands(data);
      } catch {
        // silence
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, [formData.categoryId]);

  useEffect(() => {
    if (!formData.brandId) {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    bicycleService.getModels(formData.brandId)
      .then(setModels)
      .catch(() => {})
      .finally(() => setLoadingModels(false));
  }, [formData.brandId]);

  const handleCategorySelect = (cat: Category) => {
    onChange({
      categoryId: cat._id,
      categoryName: cat.name,
      brandId: '',
      brandName: '',
      modelId: '',
      modelName: '',
    });
  };

  return (
    <View>
      <Text style={styles.sectionLabel}>Loại xe đạp của bạn là?</Text>

      {loadingCategories ? (
        <View style={styles.loadingGrid}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={styles.skeletonItem} />
          ))}
        </View>
      ) : (
        <View style={styles.categoryGrid}>
          {categories.map(cat => {
            const isSelected = formData.categoryId === cat._id;
            return (
              <TouchableOpacity
                key={cat._id}
                style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                onPress={() => handleCategorySelect(cat)}
                activeOpacity={0.7}
              >
                {cat.imageUrl ? (
                  <Image source={{ uri: cat.imageUrl }} style={styles.categoryIcon} />
                ) : (
                  <Icon name="bicycle-outline" size={22} color={isSelected ? colors.primaryGreen : colors.gray[400]} />
                )}
                <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
                  {cat.name}
                </Text>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Brand picker */}
      {formData.categoryId && (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Thương hiệu</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setBrandModalVisible(true)}
            disabled={loadingBrands}
            activeOpacity={0.7}
          >
            <Text style={formData.brandName ? styles.pickerValueText : styles.pickerPlaceholderText}>
              {formData.brandName || 'Chọn thương hiệu...'}
            </Text>
            {loadingBrands ? (
              <ActivityIndicator size="small" color={colors.gray[400]} />
            ) : (
              <Icon name="chevron-down" size={18} color={colors.gray[400]} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Model picker */}
      {formData.brandId && (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Mẫu xe</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setModelModalVisible(true)}
            disabled={loadingModels}
            activeOpacity={0.7}
          >
            <Text style={formData.modelName ? styles.pickerValueText : styles.pickerPlaceholderText}>
              {formData.modelName || 'Chọn mẫu xe...'}
            </Text>
            {loadingModels ? (
              <ActivityIndicator size="small" color={colors.gray[400]} />
            ) : (
              <Icon name="chevron-down" size={18} color={colors.gray[400]} />
            )}
          </TouchableOpacity>
        </View>
      )}

      <SearchablePickerModal
        visible={brandModalVisible}
        title="Thương hiệu"
        placeholder="Tìm thương hiệu..."
        data={brands.map(b => ({ label: b.name, value: b._id }))}
        onSelect={item => {
          onChange({ brandId: item.value, brandName: item.label, modelId: '', modelName: '' });
          setBrandModalVisible(false);
        }}
        onClose={() => setBrandModalVisible(false)}
      />

      <SearchablePickerModal
        visible={modelModalVisible}
        title="Mẫu xe"
        placeholder="Tìm mẫu xe..."
        data={models.map(m => ({ label: m.name, value: m._id }))}
        onSelect={item => {
          onChange({ modelId: item.value, modelName: item.label });
          setModelModalVisible(false);
        }}
        onClose={() => setModelModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  skeletonItem: {
    width: '47%',
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.gray[100],
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  categoryCardSelected: {
    borderColor: colors.primaryGreen,
    backgroundColor: '#F0FDF4',
  },
  categoryIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  categoryName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  categoryNameSelected: {
    color: colors.primaryGreen,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primaryGreen,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryGreen,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 6,
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
});

export default Step1FindBike;
