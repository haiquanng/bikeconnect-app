import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../theme';
import type { Address } from '../../../types/user';
import type { PaymentType } from '../../../types/order';
import BikeSummaryCard from '../components/BikeSummaryCard';
import PriceSummary from '../components/PriceSummary';

export type PaymentMethod = 'WALLET' | 'VNPAY';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatAddress = (a: Address) =>
  a.fullAddress || [a.street, a.wardName, a.provinceName].filter(Boolean).join(', ');

interface BikeInfo {
  bicycleTitle: string;
  bicyclePrice: number;
  primaryImage?: string;
  condition?: string;
}

interface Props {
  bike: BikeInfo;
  address: Address;
  shippingFee: number;
  calculatingFee: boolean;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  walletBalance: number;
  paymentType: PaymentType;
  onPaymentTypeChange: (type: PaymentType) => void;
}

const VNPAY_LOGO = require('../../../assets/images/card/vnpay.png');

const PAYMENT_OPTIONS: { method: PaymentMethod; icon?: string; logo?: any; label: string; desc: string }[] = [
  {
    method: 'WALLET',
    icon: 'wallet-outline',
    label: 'Ví BikeConnect',
    desc: 'Thanh toán bằng số dư ví',
  },
  {
    method: 'VNPAY',
    logo: VNPAY_LOGO,
    label: 'VNPay',
    desc: 'Thẻ ATM / Thẻ tín dụng / Ngân hàng',
  },
];

const ConfirmStep: React.FC<Props> = ({
  bike, address, shippingFee, calculatingFee,
  onConfirm, onBack, loading,
  paymentMethod, onPaymentMethodChange, walletBalance,
  paymentType, onPaymentTypeChange,
}) => {
  const insets = useSafeAreaInsets();
  const total  = bike.bicyclePrice + shippingFee;
  const deposit = Math.round(total * 0.1);

  const payNow = paymentType === 'DEPOSIT_10' ? deposit : total;
  const btnIcon  = paymentMethod === 'VNPAY' ? 'card-outline' : 'wallet-outline';
  const btnLabel = paymentMethod === 'VNPAY'
    ? `Thanh toán qua VNPay`
    : `Thanh toán ${formatPrice(payNow)}`;

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Bike summary */}
        <BikeSummaryCard
          title={bike.bicycleTitle}
          price={bike.bicyclePrice}
          primaryImage={bike.primaryImage}
          condition={bike.condition}
        />

        {/* Delivery address */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="location-outline" size={18} color={colors.primaryGreen} />
            <Text style={styles.cardTitle}>Địa chỉ giao hàng</Text>
          </View>
          <Text style={styles.addressLabel}>{address.label}</Text>
          <Text style={styles.addressDetail}>
            {formatAddress(address) || 'Chưa có địa chỉ chi tiết'}
          </Text>
          <TouchableOpacity onPress={onBack} style={styles.changeBtn}>
            <Text style={styles.changeBtnText}>Thay đổi</Text>
          </TouchableOpacity>
        </View>

        {/* Payment method selector */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="card-outline" size={18} color={colors.primaryGreen} />
            <Text style={styles.cardTitle}>Phương thức thanh toán</Text>
          </View>
          {PAYMENT_OPTIONS.map((opt, idx) => {
            const selected = paymentMethod === opt.method;
            const isLast   = idx === PAYMENT_OPTIONS.length - 1;
            return (
              <TouchableOpacity
                key={opt.method}
                style={[styles.paymentRow, !isLast && styles.paymentRowDivider]}
                onPress={() => onPaymentMethodChange(opt.method)}
                activeOpacity={0.7}
              >
                <View style={[styles.paymentIconBox, selected && styles.paymentIconBoxActive]}>
                  {opt.logo ? (
                    <Image source={opt.logo} style={styles.paymentLogo} resizeMode="contain" />
                  ) : (
                    <Icon
                      name={opt.icon!}
                      size={22}
                      color={selected ? colors.primaryGreen : colors.textSecondary}
                    />
                  )}
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentLabel, selected && styles.paymentLabelActive]}>
                    {opt.label}
                  </Text>
                  {opt.method === 'WALLET' ? (
                    <Text style={styles.paymentDesc}>
                      Số dư: <Text style={styles.walletBalance}>{formatPrice(walletBalance)}</Text>
                    </Text>
                  ) : (
                    <Text style={styles.paymentDesc}>{opt.desc}</Text>
                  )}
                </View>
                <View style={[styles.radio, selected && styles.radioActive]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment type selector */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="cash-outline" size={18} color={colors.primaryGreen} />
            <Text style={styles.cardTitle}>Loại thanh toán</Text>
          </View>
          {([
            { type: 'FULL_100' as PaymentType, label: 'Thanh toán đầy đủ', desc: `${formatPrice(total)} — thanh toán toàn bộ ngay bây giờ` },
            { type: 'DEPOSIT_10' as PaymentType, label: 'Đặt cọc 10%', desc: `${formatPrice(deposit)} — thanh toán phần còn lại sau khi nhận hàng` },
          ] as const).map((opt, idx) => {
            const selected = paymentType === opt.type;
            const isLast   = idx === 1;
            return (
              <TouchableOpacity
                key={opt.type}
                style={[styles.paymentRow, !isLast && styles.paymentRowDivider]}
                onPress={() => onPaymentTypeChange(opt.type)}
                activeOpacity={0.7}
              >
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentLabel, selected && styles.paymentLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.paymentDesc}>{opt.desc}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioActive]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Price summary */}
        <PriceSummary
          bicyclePrice={bike.bicyclePrice}
          paymentType={paymentType}
          shippingFee={shippingFee}
          calculatingFee={calculatingFee}
        />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 20 }]}>
        <TouchableOpacity
          style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
          onPress={onConfirm}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Icon name={btnIcon} size={20} color={colors.white} />
              <Text style={styles.confirmBtnText}>{btnLabel}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 120 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle:  { fontSize: 15, fontWeight: '700', color: colors.textPrimary },

  addressLabel:  { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  addressDetail: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  changeBtn:     { alignSelf: 'flex-start', marginTop: 10 },
  changeBtnText: { fontSize: 13, color: colors.primaryGreen, fontWeight: '600' },

  paymentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
  },
  paymentRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray[100],
  },
  paymentIconBox: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: colors.gray[50],
    alignItems: 'center', justifyContent: 'center',
  },
  paymentIconBoxActive: { backgroundColor: colors.primaryGreen + '15' },
  paymentLogo: { width: 36, height: 24 },
  paymentInfo:  { flex: 1 },
  paymentLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  paymentLabelActive: { color: colors.textPrimary },
  paymentDesc:  { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  walletBalance: { fontWeight: '700', color: colors.primaryGreen },

  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.gray[300],
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primaryGreen },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primaryGreen },

  bottomBar: {
    paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.gray[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 6,
  },
  confirmBtn: {
    flexDirection: 'row', height: 52, borderRadius: 12,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});

export default ConfirmStep;
