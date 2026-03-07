import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
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
import StepIndicator from './components/StepIndicator';
import AddressStep from './steps/AddressStep';
import ConfirmStep, { PaymentMethod } from './steps/ConfirmStep';

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
  const [orderSuccess, setOrderSuccess]       = useState(false);
  const [paymentMethod, setPaymentMethod]     = useState<PaymentMethod>('WALLET');
  const [walletBalance, setWalletBalance]     = useState<number>(0);

  // Load wallet balance
  useEffect(() => {
    walletService.getMyWallet()
      .then(w => setWalletBalance(walletService.availableBalance(w)))
      .catch(() => setWalletBalance(0));
  }, []);

  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!orderSuccess) { return; }
    Animated.parallel([
      Animated.spring(scaleAnim,   { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.timing(opacityAnim, { toValue: 1, useNativeDriver: true, duration: 300 }),
    ]).start();
    const timer = setTimeout(() => {
      navigation.reset({
        index: 1,
        routes: [{ name: 'Main', params: { screen: 'Shop' } }, { name: 'Orders' }],
      });
    }, 4000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderSuccess]);

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

      // Bước 1: Tạo đơn → bicycle chuyển RESERVED
      const order = await orderService.createOrder({
        bicycleId:         params.bicycleId,
        paymentType:       'FULL_100',
        shippingAddressId: selectedAddress._id,
      });

      if (paymentMethod === 'VNPAY') {
        // VNPay: lấy payment URL → mở WebView
        const { paymentUrl } = await orderService.payOrderVnpay(order._id);
        navigation.navigate('VnpayWebView', { paymentUrl, orderId: order._id });
      } else {
        // Wallet: kiểm tra số dư rồi thanh toán
        const total     = order.amounts?.total ?? params.bicyclePrice;
        if (walletBalance >= total) {
          await orderService.payOrder(order._id);
          setOrderSuccess(true);
        } else {
          const shortage = total - walletBalance;
          Alert.alert(
            'Số dư không đủ',
            `Cần thêm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shortage)} để thanh toán đơn hàng này.`,
            [
              { text: 'Nạp tiền ngay', onPress: () => navigation.reset({ index: 1, routes: [{ name: 'Main', params: { screen: 'Shop' } }, { name: 'Orders' }, { name: 'Wallet' }] }) },
              { text: 'Để sau', onPress: () => navigation.reset({ index: 1, routes: [{ name: 'Main', params: { screen: 'Shop' } }, { name: 'Orders' }] }) },
            ],
          );
        }
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

      {/* Success Overlay */}
      {orderSuccess && (
        <Animated.View style={[styles.successOverlay, { opacity: opacityAnim }]}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.successIconWrapper}>
              <Icon name="checkmark" size={52} color={colors.white} />
            </View>
            <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
            <Text style={styles.successSub}>Đang chuyển đến đơn hàng của bạn...</Text>
          </Animated.View>
        </Animated.View>
      )}

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
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            walletBalance={walletBalance}
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
  successOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  successCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  successIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default CheckoutScreen;
