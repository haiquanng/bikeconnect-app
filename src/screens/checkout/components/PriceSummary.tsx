import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme';
import type { PaymentType } from '../../../types/order';
import { formatPrice } from '../../../utils/helper';

export const DEFAULT_SHIPPING_FEE = 30_000;

interface Props {
  bicyclePrice: number;
  paymentType: PaymentType;
  shippingFee?: number;
  calculatingFee?: boolean;
}

const PriceSummary: React.FC<Props> = ({ bicyclePrice, paymentType, shippingFee = DEFAULT_SHIPPING_FEE, calculatingFee = false }) => {
  const total   = bicyclePrice + shippingFee;
  const deposit = Math.round(total * 0.1);

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Tóm tắt giá</Text>

      <Row label="Giá xe" value={formatPrice(bicyclePrice)} />
      <Row
        label="Phí vận chuyển"
        value={calculatingFee ? '' : formatPrice(shippingFee)}
        subLabel={calculatingFee ? undefined : '(GHN)'}
        loading={calculatingFee}
      />
      <View style={styles.divider} />
      <Row label="Tổng cộng" value={formatPrice(total)} bold loading={calculatingFee} />

      {paymentType === 'DEPOSIT_10' && (
        <>
          <View style={styles.divider} />
          <Row
            label="Số tiền đặt cọc (10%)"
            value={formatPrice(deposit)}
            bold
            green
          />
          <Text style={styles.remainNote}>
            Còn lại {formatPrice(total - deposit)} thanh toán sau khi nhận hàng
          </Text>
        </>
      )}
    </View>
  );
};

const Row = ({
  label,
  value,
  subLabel,
  bold,
  green,
  loading,
}: {
  label: string;
  value: string;
  subLabel?: string;
  bold?: boolean;
  green?: boolean;
  loading?: boolean;
}) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
    </View>
    {loading ? (
      <ActivityIndicator size="small" color={colors.primaryGreen} />
    ) : (
      <Text style={[styles.rowValue, bold && styles.bold, green && styles.green]}>
        {value}
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowLabel: { fontSize: 14, color: colors.textSecondary },
  subLabel: { fontSize: 12, color: colors.textTertiary },
  rowValue: { fontSize: 14, color: colors.textPrimary },
  bold: { fontWeight: '700', color: colors.textPrimary, fontSize: 15 },
  green: { color: colors.primaryGreen },
  divider: { height: 1, backgroundColor: colors.gray[100], marginVertical: 4 },
  remainNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
});

export default PriceSummary;
