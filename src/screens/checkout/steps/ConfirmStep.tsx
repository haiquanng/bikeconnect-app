import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../theme';
import type { Address } from '../../../types/user';
import BikeSummaryCard from '../components/BikeSummaryCard';
import PriceSummary from '../components/PriceSummary';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatAddress = (a: Address) =>
  [a.street, a.ward, a.city].filter(Boolean).join(', ');

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
}

const ConfirmStep: React.FC<Props> = ({ bike, address, shippingFee, calculatingFee, onConfirm, onBack, loading }) => {
  const insets = useSafeAreaInsets();
  const total  = bike.bicyclePrice + shippingFee;

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

        {/* Payment method */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="qr-code-outline" size={18} color={colors.primaryGreen} />
            <Text style={styles.cardTitle}>Phương thức thanh toán</Text>
          </View>
          <View style={styles.paymentRow}>
            <View style={styles.paymentIconBox}>
              <Icon name="qr-code" size={28} color={colors.primaryGreen} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Quét mã QR</Text>
              <Text style={styles.paymentDesc}>Thanh toán nhanh qua ứng dụng ngân hàng</Text>
            </View>
            <View style={styles.radioActive}>
              <View style={styles.radioDot} />
            </View>
          </View>
        </View>

        {/* Price summary */}
        <PriceSummary
          bicyclePrice={bike.bicyclePrice}
          paymentType="FULL_100"
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
              <Icon name="qr-code-outline" size={20} color={colors.white} />
              <Text style={styles.confirmBtnText}>
                Thanh toán {formatPrice(total)}
              </Text>
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

  paymentRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  paymentIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryGreen + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfo:  { flex: 1 },
  paymentLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  paymentDesc:  { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  radioActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryGreen,
  },

  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default ConfirmStep;
