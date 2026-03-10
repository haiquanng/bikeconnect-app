import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme';
import type { CreateListingFormData } from '../../../types/bicycle';

interface Props {
  formData: CreateListingFormData;
  onChange: (updates: Partial<CreateListingFormData>) => void;
}

const SELLER_PROTECTION_RATE = 0.075; // 7.5%

const formatVND = (amount: number): string =>
  amount.toLocaleString('vi-VN');

const Step5Price: React.FC<Props> = ({ formData, onChange }) => {
  const priceNum = Number(formData.price) || 0;
  const fee = Math.round(priceNum * SELLER_PROTECTION_RATE);
  const earnings = priceNum - fee;

  const handlePriceChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    onChange({ price: digits });
  };

  return (
    <View>
      {/* Price input */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          Giá bán mong muốn <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.priceInputWrapper}>
          <Text style={styles.currencySymbol}>₫</Text>
          <TextInput
            style={styles.priceInput}
            value={formData.price}
            onChangeText={handlePriceChange}
            placeholder="0"
            placeholderTextColor={colors.gray[400]}
            keyboardType="numeric"
            returnKeyType="done"
          />
        </View>
      </View>

      {/* Fee breakdown */}
      {priceNum > 0 && (
        <View style={styles.feeBreakdown}>
          <View style={styles.feeRow}>
            <View style={styles.feeRowLeft}>
              <Text style={styles.feeLabel}>Phí bảo vệ người bán</Text>
              <Icon name="information-circle-outline" size={16} color={colors.gray[400]} />
            </View>
            <Text style={styles.feeValue}>
              {(SELLER_PROTECTION_RATE * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>Bạn nhận được</Text>
            <Text style={styles.earningsValue}>₫ {formatVND(earnings)}</Text>
          </View>
        </View>
      )}

      {/* Seller protection card */}
      <View style={styles.protectionCard}>
        <View style={styles.protectionHeader}>
          <Icon name="shield-checkmark-outline" size={22} color={colors.gray[500]} />
          <Text style={styles.protectionTitle}>
            Chương trình bảo vệ người bán bao gồm vận chuyển
          </Text>
        </View>

        <View style={styles.protectionItems}>
          <View style={styles.protectionItem}>
            <View style={styles.checkDot}>
              <Icon name="checkmark" size={10} color={colors.white} />
            </View>
            <Text style={styles.protectionItemText}>
              Chúng tôi gửi{' '}
              <Text style={styles.bold}>vật liệu đóng gói và nhãn gửi hàng trả trước</Text>
              {' '}— hoàn toàn miễn phí.
            </Text>
          </View>

          <View style={styles.protectionItem}>
            <View style={styles.checkDot}>
              <Icon name="checkmark" size={10} color={colors.white} />
            </View>
            <Text style={styles.protectionItemText}>
              Chúng tôi nhận xe,{' '}
              <Text style={styles.bold}>bảo hiểm và vận chuyển</Text>
              {' '}trên toàn quốc. Không phí ẩn.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingVertical: 13,
  },
  feeBreakdown: {
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  feeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  feeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  feeValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  earningsLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  earningsValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  protectionCard: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 16,
  },
  protectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  protectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  protectionItems: {
    gap: 12,
    paddingLeft: 32,
  },
  protectionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  protectionItemText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 19,
    flex: 1,
  },
  bold: {
    fontWeight: '600',
  },
});

export default Step5Price;
