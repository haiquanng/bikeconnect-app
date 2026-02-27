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
}

const STEPS = ['Địa chỉ', 'Thanh toán'];

const CheckoutScreen = ({ navigation, route }: any) => {
  const params = route.params as CheckoutParams;
  const user   = useAppSelector(state => state.auth.user);

  const [step, setStep]                       = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading]                 = useState(false);

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

  const handleConfirm = async () => {
    if (!selectedAddress || !selectedAddress._id) { return; }
    try {
      setLoading(true);
      // Tạo đơn hàng trước — bicycle chuyển sang RESERVED, order status = RESERVED_FULL
      await orderService.createOrder({
        bicycleId:         params.bicycleId,
        paymentType:       'FULL_100',
        shippingAddressId: selectedAddress._id,
      });
      // Đơn đã tạo; cổng thanh toán chưa tích hợp
      showToast('Đặt hàng thành công! Chưa hỗ trợ thanh toán online');
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Main', params: { screen: 'Shop' } },
          { name: 'Orders' },
        ],
      });
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
          onContinue={() => setStep(2)}
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
