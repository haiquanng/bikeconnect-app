import React, { useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { walletService } from '../../api/walletService';
import { bankAccountService } from '../../api/bankAccountService';
import { kycService } from '../../api/kycService';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { updateUser } from '../../redux/auth/authSlice';
import type { BankAccount } from '../../types/bankAccount';
import type { KycStatus } from '../../types/user';
// useAppSelector dùng để khởi tạo kycStatus từ Redux trước khi API trả về

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const AMOUNT_PRESETS = [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000];

const WithdrawScreen = ({ navigation, route }: any) => {
  const availableBalance: number = route.params?.availableBalance ?? 0;
  const dispatch = useAppDispatch();
  // Đọc từ Redux làm giá trị khởi tạo, loadData sẽ sync lại từ API
  const reduxKycStatus = useAppSelector(state => state.auth.user?.kycStatus);

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycStatus | undefined>(reduxKycStatus);

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const parsedAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;

  const loadData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [kyc, accs] = await Promise.all([
        kycService.getStatus(),
        bankAccountService.getAll(),
      ]);
      setKycStatus(kyc.kycStatus);
      // Sync lên Redux nếu khác giá trị hiện tại
      dispatch(updateUser({ kycStatus: kyc.kycStatus }));
      setAccounts(accs);
      const defaultAcc = accs.find(a => a.isDefault) ?? accs[0] ?? null;
      setSelectedAccount(defaultAcc);
    } catch {
      /* giữ nguyên kycStatus từ Redux nếu API lỗi */
    } finally {
      setLoadingData(false);
    }
  }, [dispatch]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleSubmit = async () => {
    if (kycStatus !== 'VERIFIED') {
      Alert.alert(
        'Cần xác minh danh tính',
        'Bạn cần xác minh CCCD/CMND trước khi rút tiền.',
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Xác minh ngay', onPress: () => navigation.navigate('KYC') },
        ],
      );
      return;
    }
    if (!selectedAccount) {
      Alert.alert(
        'Chưa có tài khoản ngân hàng',
        'Vui lòng thêm tài khoản ngân hàng để rút tiền.',
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Thêm tài khoản', onPress: () => navigation.navigate('BankAccountList') },
        ],
      );
      return;
    }
    if (parsedAmount < 10_000) {
      Alert.alert('Lỗi', 'Số tiền rút tối thiểu là 10.000đ');
      return;
    }
    if (parsedAmount > availableBalance) {
      Alert.alert('Lỗi', 'Số tiền rút vượt quá số dư khả dụng');
      return;
    }

    Alert.alert(
      'Xác nhận rút tiền',
      `Rút ${formatVND(parsedAmount)} về tài khoản ${selectedAccount.accountNumber} - ${selectedAccount.bankName}?`,
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
                  bankName:      selectedAccount.bankName,
                  accountNumber: selectedAccount.accountNumber,
                  accountName:   selectedAccount.accountOwner,
                },
              });
              const isAutoApprove = parsedAmount < 3_000_000;
              Alert.alert(
                isAutoApprove ? 'Rút tiền thành công!' : 'Yêu cầu đã được gửi',
                isAutoApprove
                  ? 'Tiền đã được chuyển vào tài khoản ngân hàng của bạn.'
                  : 'Yêu cầu trên 3.000.000đ cần xét duyệt. Chúng tôi sẽ xử lý trong vòng nhiều nhất 2 ngày làm việc, không tính ngày nghỉ.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
              );
            } catch {
              Alert.alert('Lỗi', 'Không thể gửi yêu cầu rút tiền. Vui lòng thử lại.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const canSubmit = parsedAmount >= 10_000 && parsedAmount <= availableBalance && !!selectedAccount && !loading;

  if (loadingData) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Icon name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yêu cầu rút tiền</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yêu cầu rút tiền</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* KYC warning */}
          {kycStatus !== 'VERIFIED' && (
            <TouchableOpacity style={styles.kycBanner} onPress={() => navigation.navigate('KYC')}>
              <Icon name="shield-outline" size={20} color="#b45309" />
              <Text style={styles.kycBannerText}>
                Cần xác minh danh tính để rút tiền.{' '}
                <Text style={styles.kycBannerLink}>Xác minh ngay →</Text>
              </Text>
            </TouchableOpacity>
          )}

          {/* Balance */}
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

          {/* Bank account selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Tài khoản nhận tiền</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BankAccountList')}>
                <Text style={styles.manageLink}>Quản lý</Text>
              </TouchableOpacity>
            </View>

            {accounts.length === 0 ? (
              <TouchableOpacity
                style={styles.addAccountCard}
                onPress={() => navigation.navigate('BankAccountList')}
              >
                <Icon name="add-circle-outline" size={22} color={colors.primaryGreen} />
                <Text style={styles.addAccountText}>Thêm tài khoản ngân hàng</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.accountList}>
                {accounts.map(account => (
                  <TouchableOpacity
                    key={account._id}
                    style={[styles.accountCard, selectedAccount?._id === account._id && styles.accountCardSelected]}
                    onPress={() => setSelectedAccount(account)}
                  >
                    <View style={styles.accountCardLeft}>
                      <Icon name="card-outline" size={20} color={selectedAccount?._id === account._id ? colors.primaryGreen : colors.textSecondary} />
                      <View style={styles.accountCardInfo}>
                        <View style={styles.accountCardRow}>
                          <Text style={styles.accountCardBank}>{account.bankName}</Text>
                          {account.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>Mặc định</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.accountCardNumber}>{account.accountNumber}</Text>
                        <Text style={styles.accountCardOwner}>{account.accountOwner}</Text>
                      </View>
                    </View>
                    {selectedAccount?._id === account._id && (
                      <Icon name="checkmark-circle" size={22} color={colors.primaryGreen} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Note */}
          <View style={styles.noteBox}>
            <Icon name="information-circle-outline" size={16} color={colors.primaryGreen} />
            <Text style={styles.noteText}>
              {parsedAmount > 0 && parsedAmount < 3_000_000
              ? <>Số tiền dưới 3.000.000đ sẽ được <Text style={styles.noteBold}>chuyển ngay</Text> vào tài khoản của bạn.</>
              : <>Số tiền từ 3.000.000đ trở lên cần xét duyệt, xử lý trong vòng <Text style={styles.noteBold}>2 ngày làm việc</Text>, không tính ngày nghỉ.</>
            }
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  content: { padding: 16, gap: 16, paddingBottom: 40 },

  kycBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fffbeb', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#fde68a',
  },
  kycBannerText: { flex: 1, fontSize: 13, color: '#92400e', lineHeight: 20 },
  kycBannerLink: { fontWeight: '700', textDecorationLine: 'underline' },

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
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  manageLink: { fontSize: 13, color: colors.primaryGreen, fontWeight: '600' },

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

  addAccountCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1.5, borderColor: colors.primaryGreen, borderStyle: 'dashed',
    borderRadius: 10, padding: 14,
  },
  addAccountText: { fontSize: 14, color: colors.primaryGreen, fontWeight: '600' },

  accountList: { gap: 8 },
  accountCard: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.gray[200], borderRadius: 10, padding: 12,
  },
  accountCardSelected: { borderColor: colors.primaryGreen, backgroundColor: colors.primaryGreen + '08' },
  accountCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  accountCardInfo: { flex: 1 },
  accountCardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  accountCardBank: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  defaultBadge: { backgroundColor: colors.primaryGreen + '20', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  defaultBadgeText: { fontSize: 10, fontWeight: '600', color: colors.primaryGreen },
  accountCardNumber: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  accountCardOwner: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },

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
