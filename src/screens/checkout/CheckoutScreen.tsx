import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { useAppSelector } from '../../redux/hooks';
import type { Address } from '../../types/user';
import { orderService } from '../../api/orderService';
import { walletService } from '../../api/walletService';
import { shippingService } from '../../api/shippingService';
import { showToast } from '../../utils/toast';
import StepIndicator from './components/StepIndicator';
import AddressStep from './steps/AddressStep';
import ConfirmStep from './steps/ConfirmStep';

export interface CheckoutParams {
  bicycleId: string;
  bicycleTitle: string;
  bicyclePrice: number;
  primaryImage?: string;
  condition?: string;
  // Địa chỉ của xe (để tính phí ship GHN)
  fromDistrictId?: number;
  fromWardCode?: string;
}

const STEPS = ['Địa chỉ', 'Thanh toán'];

const CheckoutScreen = ({ navigation, route }: any) => {
  const params = route.params as CheckoutParams;
  const user   = useAppSelector(state => state.auth.user);

  const [step, setStep]                       = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [shippingFee, setShippingFee]         = useState<number>(30_000);
  const [calculatingFee, setCalculatingFee]   = useState(false);

  const addresses: Address[] = user?.addresses ?? [];

  // Auto-select default address when screen focuses (handles return from AddAddress)
  useFocusEffect(
    useCallback(() => {
      const list: Address[] = user?.addresses ?? [];
      if (selectedAddress) {
        const refreshed = list.find(a => a._id === selectedAddress._id);
        if (refreshed) { setSelectedAddress(refreshed); }
      } else {
        const def = list.find(a => a.isDefault) ?? list[0];
        if (def) { setSelectedAddress(def); }
      }
    }, [selectedAddress, user?.addresses]),
  );

  const handleGoToConfirm = async () => {
    if (!selectedAddress?.districtId || !selectedAddress?.wardCode) {
      setStep(2);
      return;
    }
    if (!params.fromDistrictId || !params.fromWardCode) {
      setStep(2);
      return;
    }
    setStep(2);
    setCalculatingFee(true);
    try {
      const result = await shippingService.calculateFee({
        fromDistrictId: params.fromDistrictId,
        fromWardCode:   params.fromWardCode,
        toDistrictId:   selectedAddress.districtId,
        toWardCode:     selectedAddress.wardCode,
        insuranceValue: params.bicyclePrice,
      });
      setShippingFee(result.total);
    } catch {
      // Giữ giá trị mặc định 30,000 nếu API lỗi
    } finally {
      setCalculatingFee(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedAddress || !selectedAddress._id) { return; }

    // Validate address has GHN IDs required by backend
    if (!selectedAddress.districtId || !selectedAddress.wardCode) {
      Alert.alert(
        'Địa chỉ chưa hợp lệ',
        'Vui lòng cập nhật địa chỉ giao hàng (chọn lại Quận/Huyện và Phường/Xã) để tiếp tục.',
        [{ text: 'Cập nhật', onPress: () => navigation.navigate('AddAddress', { address: selectedAddress }) }, { text: 'Huỷ', style: 'cancel' }],
      );
      return;
    }

    try {
      setLoading(true);
      // Bước 1: Tạo đơn → bicycle chuyển RESERVED, order = RESERVED_FULL
      const order = await orderService.createOrder({
        bicycleId:         params.bicycleId,
        paymentType:       'FULL_100',
        shippingAddressId: selectedAddress._id,
      });

      // Bước 2: Kiểm tra ví có đủ không
      let wallet;
      try { wallet = await walletService.getMyWallet(); } catch { wallet = null; }

      const total = order.amounts?.total ?? params.bicyclePrice;
      const available = wallet ? walletService.availableBalance(wallet) : 0;

      if (available >= total) {
        // Đủ tiền → thanh toán luôn
        await orderService.payOrder(order._id);
        showToast('Đặt hàng và thanh toán thành công!');
        navigation.reset({
          index: 1,
          routes: [{ name: 'Main', params: { screen: 'Shop' } }, { name: 'Orders' }],
        });
      } else {
        // Không đủ tiền → ra màn Orders, nhắc nạp tiền
        const shortage = total - available;
        showToast('Đặt hàng thành công! Vui lòng nạp tiền để hoàn tất thanh toán.');
        Alert.alert(
          'Số dư không đủ',
          `Cần thêm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shortage)} để thanh toán đơn hàng này.`,
          [
            { text: 'Nạp tiền ngay', onPress: () => navigation.reset({ index: 1, routes: [{ name: 'Main', params: { screen: 'Shop' } }, { name: 'Orders' }, { name: 'Wallet' }] }) },
            { text: 'Để sau', onPress: () => navigation.reset({ index: 1, routes: [{ name: 'Main', params: { screen: 'Shop' } }, { name: 'Orders' }] }) },
          ],
        );
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message ?? 'Không thể tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) { setStep(1); }
    else { navigation.goBack(); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Icon name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt hàng</Text>
        <View style={styles.headerSpacer} />
      </View>

      <StepIndicator currentStep={step} totalSteps={2} labels={STEPS} />
      <View style={styles.divider} />

      {step === 1 ? (
        <AddressStep
          addresses={addresses}
          selectedAddress={selectedAddress}
          onSelectAddress={setSelectedAddress}
          onAddNew={() => navigation.navigate('AddAddress')}
          onContinue={handleGoToConfirm}
        />
      ) : (
        selectedAddress && (
          <ConfirmStep
            bike={{
              bicycleTitle: params.bicycleTitle,
              bicyclePrice: params.bicyclePrice,
              primaryImage: params.primaryImage,
              condition: params.condition,
            }}
            address={selectedAddress}
            shippingFee={shippingFee}
            calculatingFee={calculatingFee}
            onConfirm={handleConfirm}
            onBack={() => setStep(1)}
            loading={loading}
          />
        )
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSpacer: { width: 36 },
  divider: { height: 1, backgroundColor: colors.gray[100] },
});

export default CheckoutScreen;
