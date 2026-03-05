import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { walletService, Wallet, WalletTransaction } from '../../api/walletService';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const formatDate = (s: string) => {
  const d = new Date(s);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const TXN_LABEL: Record<string, string> = {
  DEPOSIT: 'Nạp tiền',
  WITHDRAW: 'Rút tiền',
  ESCROW_IN: 'Thanh toán đơn hàng',
  ESCROW_OUT: 'Hoàn tiền',
  FULL: 'Thanh toán toàn bộ',
  REMAINING: 'Thanh toán phần còn lại',
};

const DEPOSIT_PRESETS = [50_000, 100_000, 200_000, 500_000, 1_000_000];

const CARD_IMAGES = [
  require('../../assets/images/card/card_1.png'),
  require('../../assets/images/card/card_2.png'),
  require('../../assets/images/card/card_3.png'),
  require('../../assets/images/card/card_4.png'),
  require('../../assets/images/card/card_5.png'),
  require('../../assets/images/card/card_6.png'),
];

const WalletScreen = ({ navigation }: any) => {
  const cardImage = useMemo(
    () => CARD_IMAGES[Math.floor(Math.random() * CARD_IMAGES.length)],
    [],
  );
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Deposit modal
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  // VNPay WebView
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) { setLoading(true); }
      const [w, t] = await Promise.all([
        walletService.getMyWallet(),
        walletService.getTransactions(1, 20),
      ]);
      setWallet(w);
      setTransactions(t.transactions);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount.replace(/\D/g, ''), 10);
    if (!amount || amount < 10_000) {
      Alert.alert('Lỗi', 'Số tiền tối thiểu là 10.000đ');
      return;
    }
    try {
      setDepositing(true);
      const { paymentUrl: url } = await walletService.deposit(amount);
      setShowDeposit(false);
      setDepositAmount('');
      setPaymentUrl(url);
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message ?? 'Không thể tạo giao dịch');
    } finally {
      setDepositing(false);
    }
  };

  const handleWebViewNav = (state: WebViewNavigation) => {
    if (state.loading) { return; }

    const url = state.url;
    const isReturnUrl = url.includes('/vnpay-return') || url.includes('deposit=success') || url.includes('deposit=fail');
    if (!isReturnUrl) { return; }

    const success = url.includes('vnp_ResponseCode=00') || url.includes('deposit=success');
    setPaymentUrl(null);

    if (success) {
      Alert.alert('Nạp tiền thành công!', 'Số dư ví đã được cập nhật.', [
        { text: 'OK', onPress: () => load(true) },
      ]);
    } else {
      Alert.alert('Thanh toán thất bại', 'Giao dịch không thành công hoặc bị huỷ.', [
        { text: 'OK', onPress: () => load(true) },
      ]);
    }
  };

  const availableBalance = wallet ? walletService.availableBalance(wallet) : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Header navigation={navigation} />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primaryGreen} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header navigation={navigation} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Image source={cardImage} style={styles.balanceCardImg} resizeMode="stretch" />
          <View style={styles.balanceCardContent}>
            <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
            <Text style={styles.balanceAmount}>{formatVND(availableBalance)}</Text>
            {wallet && wallet.frozenBalance > 0 && (
              <Text style={styles.frozenText}>Đang giữ: {formatVND(wallet.frozenBalance)}</Text>
            )}
            <TouchableOpacity style={styles.depositBtn} onPress={() => setShowDeposit(true)}>
              <Icon name="add-circle-outline" size={18} color={colors.white} />
              <Text style={styles.depositBtnText}>Nạp tiền</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyTxn}>
              <Icon name="receipt-outline" size={40} color={colors.gray[300]} />
              <Text style={styles.emptyTxnText}>Chưa có giao dịch</Text>
            </View>
          ) : (
            transactions.map(txn => (
              <TxnRow
                key={txn._id}
                txn={txn}
                onPress={() => navigation.navigate('TransactionDetail', { txn })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.withdrawBtn}
          onPress={() => navigation.navigate('Withdraw', { availableBalance })}
          activeOpacity={0.85}
        >
          <Icon name="arrow-up-circle-outline" size={20} color={colors.primaryGreen} />
          <Text style={styles.withdrawBtnText}>Yêu cầu rút tiền</Text>
        </TouchableOpacity>
      </View>

      {/* Deposit Modal */}
      <Modal visible={showDeposit} animationType="slide" transparent onRequestClose={() => setShowDeposit(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nạp tiền vào ví</Text>
              <TouchableOpacity onPress={() => setShowDeposit(false)}>
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Chọn số tiền</Text>
            <View style={styles.presetRow}>
              {DEPOSIT_PRESETS.map(amount => (
                <TouchableOpacity
                  key={amount}
                  style={[styles.presetChip, depositAmount === String(amount) && styles.presetChipActive]}
                  onPress={() => setDepositAmount(String(amount))}
                >
                  <Text style={[styles.presetText, depositAmount === String(amount) && styles.presetTextActive]}>
                    {amount >= 1_000_000 ? `${amount / 1_000_000}tr` : `${amount / 1_000}k`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Hoặc nhập số tiền</Text>
            <View style={styles.amountInput}>
              <TextInput
                style={styles.amountInputText}
                placeholder="Nhập số tiền..."
                placeholderTextColor={colors.gray[300]}
                keyboardType="numeric"
                value={depositAmount ? Number(depositAmount).toLocaleString('vi-VN') : ''}
                onChangeText={t => setDepositAmount(t.replace(/\D/g, ''))}
              />
              <Text style={styles.amountCurrency}>₫</Text>
            </View>

            <Text style={styles.vnpayNote}>
              <Icon name="shield-checkmark-outline" size={13} /> Thanh toán qua VNPay (Sandbox)
            </Text>

            <TouchableOpacity
              style={[styles.confirmDepositBtn, (!depositAmount || depositing) && styles.confirmDepositBtnDisabled]}
              onPress={handleDeposit}
              disabled={!depositAmount || depositing}
            >
              {depositing ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.confirmDepositText}>Nạp tiền qua VNPay</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* VNPay WebView Modal */}
      <Modal visible={!!paymentUrl} animationType="slide" onRequestClose={() => setPaymentUrl(null)}>
        <SafeAreaView style={styles.webViewSafeArea} edges={['top']}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity onPress={() => setPaymentUrl(null)} style={styles.webViewClose}>
              <Icon name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>Thanh toán VNPay</Text>
            <View style={styles.webViewSpacer} />
          </View>
          {paymentUrl && (
            <WebView
              ref={webViewRef}
              source={{ uri: paymentUrl }}
              onNavigationStateChange={handleWebViewNav}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.center}>
                  <ActivityIndicator size="large" color={colors.primaryGreen} />
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const Header = ({ navigation }: any) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
      <Icon name="arrow-back" size={22} color={colors.white} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Ví của tôi</Text>
    <View style={styles.headerBtn} />
  </View>
);

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Đang xử lý', color: '#D97706' },
  SUCCESS: { label: 'Thành công', color: '#065F46' },
  FAILED:  { label: 'Thất bại',   color: '#DC2626' },
};

const TxnRow = ({ txn, onPress }: { txn: WalletTransaction; onPress: () => void }) => {
  const isIn = ['DEPOSIT', 'ESCROW_OUT'].includes(txn.type);
  const status = txn.data?.status;
  const isFailed = status === 'FAILED';
  const statusCfg = status ? STATUS_CONFIG[status] : null;
  return (
    <TouchableOpacity style={[styles.txnRow, isFailed && styles.txnRowFailed]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.txnIcon, isIn && !isFailed ? styles.txnIconIn : styles.txnIconOut]}>
        <Icon
          name={isFailed ? 'close-circle-outline' : isIn ? 'arrow-down-outline' : 'arrow-up-outline'}
          size={18}
          color={isFailed ? '#DC2626' : isIn ? '#065F46' : '#991B1B'}
        />
      </View>
      <View style={styles.txnInfo}>
        <Text style={[styles.txnLabel, isFailed && styles.txnLabelFailed]}>
          {TXN_LABEL[txn.type] ?? txn.type}
        </Text>
        <Text style={styles.txnDate}>{formatDate(txn.createdAt)}</Text>
        {statusCfg && (
          <Text style={[styles.txnStatus, statusCfg.color === '#D97706' ? styles.txnStatusPending : statusCfg.color === '#065F46' ? styles.txnStatusSuccess : styles.txnStatusFailed]}>
            {statusCfg.label}
          </Text>
        )}
      </View>
      <Text style={[styles.txnAmount, isFailed ? styles.txnAmountFailed : isIn ? styles.txnAmountIn : styles.txnAmountOut]}>
        {isFailed ? '' : isIn ? '+' : '-'}{formatVND(txn.amount)}
      </Text>
      <Icon name="chevron-forward" size={16} color={colors.gray[300]} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.primaryGreen,
  },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.white },

  balanceCard: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  balanceCardImg: {
    width: '100%',
    height: 190,
    borderRadius: 16,
  },
  balanceCardContent: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  balanceAmount: { fontSize: 32, fontWeight: '800', color: colors.white },
  frozenText: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  depositBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24,
  },
  depositBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },

  scrollContent: { paddingBottom: 90 },
  section: { margin: 16, marginTop: 0 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  emptyTxn: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyTxnText: { fontSize: 14, color: colors.textSecondary },

  txnRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 8,
  },
  txnIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txnIconIn:  { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D1FAE5' },
  txnIconOut: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2' },
  txnInfo: { flex: 1 },
  txnLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  txnDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  txnPending: { fontSize: 11, color: colors.warning, marginTop: 2, fontWeight: '500' },
  txnStatus: { fontSize: 11, marginTop: 2, fontWeight: '500' },
  txnStatusPending: { fontSize: 11, marginTop: 2, fontWeight: '500', color: '#D97706' },
  txnStatusSuccess: { fontSize: 11, marginTop: 2, fontWeight: '500', color: '#065F46' },
  txnStatusFailed:  { fontSize: 11, marginTop: 2, fontWeight: '500', color: '#DC2626' },
  txnRowFailed: { opacity: 0.7 },
  txnLabelFailed: { color: colors.textSecondary },
  txnAmount: { fontSize: 14, fontWeight: '700' },
  txnAmountIn:     { fontSize: 14, fontWeight: '700', color: '#065F46' },
  txnAmountOut:    { fontSize: 14, fontWeight: '700', color: '#991B1B' },
  txnAmountFailed: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },

  // Deposit modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  modalLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 10 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  presetChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: colors.gray[200], backgroundColor: colors.gray[50],
  },
  presetChipActive: { borderColor: colors.primaryGreen, backgroundColor: '#D1FAE5' },
  presetText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  presetTextActive: { color: colors.primaryGreen },
  amountInput: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.gray[200], borderRadius: 12,
    paddingHorizontal: 16, height: 52, marginBottom: 8,
  },
  amountInputText: { flex: 1, fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  amountCurrency: { fontSize: 18, fontWeight: '600', color: colors.textSecondary },
  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: colors.gray[100],
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 6,
  },
  withdrawBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 48, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.primaryGreen,
    backgroundColor: '#ECFDF5',
  },
  withdrawBtnText: { fontSize: 15, fontWeight: '700', color: colors.primaryGreen },

  vnpayNote: { fontSize: 12, color: colors.textSecondary, marginBottom: 16 },
  confirmDepositBtn: {
    backgroundColor: colors.primaryGreen, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  confirmDepositBtnDisabled: { opacity: 0.5 },
  confirmDepositText: { fontSize: 16, fontWeight: '700', color: colors.white },

  // WebView
  webViewHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.white, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.gray[200],
  },
  webViewSafeArea: { flex: 1 },
  webViewClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  webViewSpacer: { width: 36 },
  webViewTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
});

export default WalletScreen;
