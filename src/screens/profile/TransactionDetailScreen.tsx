import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import type { WalletTransaction } from '../../api/walletService';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const formatDate = (s: string) => {
  const d = new Date(s);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

const TXN_LABEL: Record<string, string> = {
  DEPOSIT: 'Nạp tiền',
  WITHDRAW: 'Rút tiền',
  ESCROW_IN: 'Thanh toán đơn hàng',
  ESCROW_OUT: 'Hoàn tiền',
  FULL: 'Thanh toán toàn bộ',
  REMAINING: 'Thanh toán phần còn lại',
};

const TXN_ICON: Record<string, { name: string; bg: string; color: string }> = {
  DEPOSIT:    { name: 'arrow-down-outline',    bg: '#D1FAE5', color: '#065F46' },
  WITHDRAW:   { name: 'arrow-up-outline',      bg: '#FEE2E2', color: '#991B1B' },
  ESCROW_IN:  { name: 'lock-closed-outline',   bg: '#FEE2E2', color: '#991B1B' },
  ESCROW_OUT: { name: 'arrow-down-outline',    bg: '#D1FAE5', color: '#065F46' },
  FULL:       { name: 'arrow-up-outline',      bg: '#FEE2E2', color: '#991B1B' },
  REMAINING:  { name: 'arrow-up-outline',      bg: '#FEE2E2', color: '#991B1B' },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  PENDING: { label: 'Đang xử lý', bg: '#FEF3C7', color: '#D97706' },
  SUCCESS: { label: 'Thành công', bg: '#D1FAE5', color: '#065F46' },
  FAILED:  { label: 'Thất bại',   bg: '#FEE2E2', color: '#DC2626' },
};

const Row = ({ label, value, valueStyle }: { label: string; value: string; valueStyle?: any }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, valueStyle]} numberOfLines={2}>{value}</Text>
  </View>
);

const TransactionDetailScreen = ({ navigation, route }: any) => {
  const txn: WalletTransaction = route.params?.txn;

  if (!txn) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết giao dịch</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.center}><Text>Không tìm thấy giao dịch</Text></View>
      </SafeAreaView>
    );
  }

  const isIn = ['DEPOSIT', 'ESCROW_OUT'].includes(txn.type);
  const isFailed = txn.data?.status === 'FAILED';
  const status = txn.data?.status;
  const statusCfg = status ? STATUS_CONFIG[status] : null;
  const iconCfg = TXN_ICON[txn.type] ?? { name: 'swap-horizontal-outline', bg: colors.gray[100], color: colors.textSecondary };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết giao dịch</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Amount hero */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIcon, { backgroundColor: iconCfg.bg }]}>
            <Icon name={iconCfg.name} size={28} color={iconCfg.color} />
          </View>
          <Text style={styles.heroLabel}>{TXN_LABEL[txn.type] ?? txn.type}</Text>
          <Text style={[
            styles.heroAmount,
            isFailed ? styles.amountFailed : isIn ? styles.amountIn : styles.amountOut,
          ]}>
            {isFailed ? '' : isIn ? '+' : '-'}{formatVND(txn.amount)}
          </Text>
          {statusCfg && (
            <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
            </View>
          )}
        </View>

        {/* Details card */}
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Thông tin giao dịch</Text>

          {txn.transactionCode ? (
            <Row label="Mã giao dịch" value={txn.transactionCode} />
          ) : null}
          <Row label="Ngày tạo" value={formatDate(txn.createdAt)} />
          {txn.description ? (
            <Row label="Mô tả" value={txn.description} />
          ) : null}
          {txn.paymentMethod ? (
            <Row label="Phương thức" value={txn.paymentMethod} />
          ) : null}
        </View>

        {/* Balance card */}
        {(txn.balanceBefore !== undefined || txn.balanceAfter !== undefined) && (
          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>Biến động số dư</Text>
            {txn.balanceBefore !== undefined && (
              <Row label="Số dư trước" value={formatVND(txn.balanceBefore)} />
            )}
            {txn.amount !== undefined && (
              <Row
                label={isIn ? 'Cộng vào' : 'Trừ ra'}
                value={(isIn ? '+' : '-') + formatVND(txn.amount)}
                valueStyle={isIn ? styles.amountIn : styles.amountOut}
              />
            )}
            {txn.balanceAfter !== undefined && (
              <Row label="Số dư sau" value={formatVND(txn.balanceAfter)} valueStyle={styles.balanceAfterValue} />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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

  content: { padding: 16, gap: 12, paddingBottom: 40 },

  heroCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 24,
    alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.gray[200],
  },
  heroIcon: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  heroLabel: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  heroAmount: { fontSize: 30, fontWeight: '800' },
  amountIn:     { color: '#065F46' },
  amountOut:    { color: '#991B1B' },
  amountFailed: { color: colors.textSecondary },

  statusBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 4 },
  statusBadgeText: { fontSize: 13, fontWeight: '600' },

  detailCard: {
    backgroundColor: colors.white, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.gray[200], gap: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },

  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.gray[100],
  },
  rowLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, flex: 1, textAlign: 'right' },
  balanceAfterValue: { fontSize: 13, fontWeight: '700', color: colors.primaryGreen, flex: 1, textAlign: 'right' },
});

export default TransactionDetailScreen;
