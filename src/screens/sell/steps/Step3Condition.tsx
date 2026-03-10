import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme';
import type { BicycleCondition, CreateListingFormData } from '../../../types/bicycle';

interface Props {
  formData: CreateListingFormData;
  onChange: (updates: Partial<CreateListingFormData>) => void;
}

const CONDITIONS: {
  value: BicycleCondition;
  label: string;
  description: string;
  details: string[];
}[] = [
  {
    value: 'NEW',
    label: 'Xe mới',
    description: 'Xe còn mới, chưa từng sử dụng',
    details: ['Xe vừa mua về', 'Mẫu mới, sản phẩm mới', 'Chưa từng qua sử dụng'],
  },
  {
    value: 'LIKE_NEW',
    label: 'Xe còn tốt',
    description: 'Qua sử dụng ngắn, khung và thiết bị còn tốt',
    details: ['Sử dụng dưới 6 tháng', 'Khung và thiết bị còn tốt', 'Không có hư hỏng đáng kể'],
  },
  {
    value: 'GOOD',
    label: 'Xe tốt',
    description: 'Xe có thể cần bảo dưỡng thêm',
    details: ['Đã sử dụng một thời gian', 'Có thể cần bảo dưỡng nhẹ', 'Vẫn hoạt động tốt'],
  },
  {
    value: 'POOR',
    label: 'Xe có vấn đề',
    description: 'Có vấn đề về máy móc, cần cải thiện',
    details: ['Cần sửa chữa', 'Có vấn đề về máy móc', 'Cần nâng cấp linh kiện'],
  },
];

const Step3Condition: React.FC<Props> = ({ formData, onChange }) => {
  return (
    <View>
      {/* Info banner */}
      <View style={styles.infoBanner}>
        <View style={styles.infoBannerIcon}>
          <Icon name="checkmark" size={14} color={colors.white} />
        </View>
        <View style={styles.infoBannerContent}>
          <Text style={styles.infoBannerTitle}>
            Hãy mô tả chính xác tình trạng xe đạp của bạn.
          </Text>
          <Text style={styles.infoBannerDesc}>
            Cung cấp thông tin chính xác để người mua biết họ sẽ nhận được gì —
            điều này giúp tránh hủy đơn và tiết kiệm chi phí trả hàng.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Tình trạng xe</Text>

      <View style={styles.conditionGrid}>
        {CONDITIONS.map(cond => {
          const isSelected = formData.condition === cond.value;
          return (
            <TouchableOpacity
              key={cond.value}
              style={[styles.conditionCard, isSelected && styles.conditionCardSelected]}
              onPress={() => onChange({ condition: cond.value })}
              activeOpacity={0.7}
            >
              <View style={styles.conditionCardHeader}>
                <View style={styles.conditionCardText}>
                  <Text style={[styles.conditionLabel, isSelected && styles.conditionLabelSelected]}>
                    {cond.label}
                  </Text>
                  <Text style={styles.conditionDesc} numberOfLines={2}>
                    {cond.description}
                  </Text>
                </View>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && (
                    <Icon name="checkmark" size={10} color={colors.white} />
                  )}
                </View>
              </View>

              {/* Details bullets — visible when selected */}
              {isSelected && (
                <View style={styles.detailsContainer}>
                  {cond.details.map((detail, i) => (
                    <View key={i} style={styles.detailRow}>
                      <View style={styles.detailDot}>
                        <Icon name="checkmark" size={9} color={colors.white} />
                      </View>
                      <Text style={styles.detailText}>{detail}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoBanner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  infoBannerIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoBannerDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  conditionGrid: {
    gap: 10,
  },
  conditionCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  conditionCardSelected: {
    borderColor: colors.primaryGreen,
    backgroundColor: '#F0FDF4',
  },
  conditionCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  conditionCardText: {
    flex: 1,
  },
  conditionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  conditionLabelSelected: {
    color: colors.primaryGreen,
  },
  conditionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  radioOuterSelected: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.primaryGreen,
  },
  detailsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
});

export default Step3Condition;
