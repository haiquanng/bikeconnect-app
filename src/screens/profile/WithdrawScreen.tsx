import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { walletService } from '../../api/walletService';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const AMOUNT_PRESETS = [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000];

const WithdrawScreen = ({ navigation, route }: any) => {
  const availableBalance: number = route.params?.availableBalance ?? 0;

  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);

  const parsedAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;

  const handleSubmit = async () => {
    if (parsedAmount < 10_000) {
      Alert.alert('Lỗi', 'Số tiền rút tối thiểu là 10.000đ');
      return;
    }
    if (parsedAmount > availableBalance) {
      Alert.alert('Lỗi', 'Số tiền rút vượt quá số dư khả dụng');
      return;
    }
    if (!bankName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên ngân hàng');
      return;
    }
    if (!accountNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tài khoản');
      return;
    }
    if (!accountName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chủ tài khoản');
      return;
    }

    Alert.alert(
      'Xác nhận rút tiền',
      `Bạn muốn rút ${formatVND(parsedAmount)} về tài khoản ${accountNumber} - ${bankName}?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              setLoading(true);
              await walletService.withdraw({
                amount: parsedAmount,
                bankInfo: {
                  bankName: bankName.trim(),
                  accountNumber: accountNumber.trim(),
                  accountName: accountName.trim(),
                },
              });
              Alert.alert(
                'Yêu cầu đã được gửi',
                'Chúng tôi sẽ xử lý trong vòng nhiều nhất 2 ngày làm việc, không tính ngày nghỉ.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
              );
            } catch (e: any) {
              Alert.alert('Lỗi', e?.response?.data?.message ?? 'Không thể gửi yêu cầu rút tiền');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const canSubmit = parsedAmount >= 10_000 && parsedAmount <= availableBalance && bankName.trim() && accountNumber.trim() && accountName.trim() && !loading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yêu cầu rút tiền</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Balance info */}
          <View style={styles.balanceBox}>
            <Icon name="wallet-outline" size={20} color={colors.primaryGreen} />
            <Text style={styles.balanceLabel}>Số dư khả dụng:</Text>
            <Text style={styles.balanceValue}>{formatVND(availableBalance)}</Text>
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Số tiền muốn rút</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputText}
                placeholder="Nhập số tiền..."
                placeholderTextColor={colors.gray[300]}
                keyboardType="numeric"
                value={parsedAmount > 0 ? parsedAmount.toLocaleString('vi-VN') : ''}
                onChangeText={t => setAmount(t.replace(/\D/g, ''))}
              />
              <Text style={styles.currency}>₫</Text>
            </View>

            <View style={styles.presetRow}>
              {AMOUNT_PRESETS.map(preset => (
                <TouchableOpacity
                  key={preset}
                  style={[styles.presetChip, parsedAmount === preset && styles.presetChipActive, preset > availableBalance && styles.presetChipDisabled]}
                  onPress={() => preset <= availableBalance && setAmount(String(preset))}
                  disabled={preset > availableBalance}
                >
                  <Text style={[styles.presetText, parsedAmount === preset && styles.presetTextActive, preset > availableBalance && styles.presetTextDisabled]}>
                    {preset >= 1_000_000 ? `${preset / 1_000_000}tr` : `${preset / 1_000}k`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {parsedAmount > availableBalance && parsedAmount > 0 && (
              <Text style={styles.errorHint}>Số tiền vượt quá số dư khả dụng</Text>
            )}
          </View>

          {/* Bank info */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Thông tin tài khoản ngân hàng</Text>

            <Text style={styles.fieldLabel}>Tên ngân hàng</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputText}
                placeholder="VD: Vietcombank, BIDV..."
                placeholderTextColor={colors.gray[300]}
                value={bankName}
                onChangeText={setBankName}
              />
            </View>

            <Text style={styles.fieldLabel}>Số tài khoản</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputText}
                placeholder="Nhập số tài khoản..."
                placeholderTextColor={colors.gray[300]}
                keyboardType="numeric"
                value={accountNumber}
                onChangeText={setAccountNumber}
              />
            </View>

            <Text style={styles.fieldLabel}>Tên chủ tài khoản</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputText}
                placeholder="Họ và tên chủ tài khoản..."
                placeholderTextColor={colors.gray[300]}
                autoCapitalize="characters"
                value={accountName}
                onChangeText={setAccountName}
              />
            </View>
          </View>

          {/* Note */}
          <View style={styles.noteBox}>
            <Icon name="information-circle-outline" size={16} color={colors.primaryGreen} />
            <Text style={styles.noteText}>
              Chúng tôi sẽ xử lý trong vòng nhiều nhất <Text style={styles.noteBold}>2 ngày làm việc</Text>, không tính ngày nghỉ.
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>Gửi yêu cầu rút tiền</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.primaryGreen,
  },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.white },

  content: { padding: 16, gap: 16, paddingBottom: 40 },

  balanceBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.primaryGreen + '30',
  },
  balanceLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  balanceValue: { fontSize: 16, fontWeight: '700', color: colors.primaryGreen },

  section: {
    backgroundColor: colors.white, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.gray[200], gap: 10,
  },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 4 },

  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.gray[200], borderRadius: 10,
    paddingHorizontal: 14, height: 48,
  },
  inputText: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  currency: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },

  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: colors.gray[200], backgroundColor: colors.gray[50],
  },
  presetChipActive: { borderColor: colors.primaryGreen, backgroundColor: '#D1FAE5' },
  presetChipDisabled: { opacity: 0.4 },
  presetText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  presetTextActive: { color: colors.primaryGreen },
  presetTextDisabled: { color: colors.textSecondary },
  errorHint: { fontSize: 12, color: '#DC2626', marginTop: -4 },

  noteBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#ECFDF5', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: colors.primaryGreen + '40',
  },
  noteText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  noteBold: { fontWeight: '700', color: colors.textPrimary },

  submitBtn: {
    backgroundColor: colors.primaryGreen, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});

export default WithdrawScreen;
