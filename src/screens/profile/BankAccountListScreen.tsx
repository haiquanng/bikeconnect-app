import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { bankAccountService } from '../../api/bankAccountService';
import type { BankAccount } from '../../types/bankAccount';

const BankAccountListScreen = ({ navigation }: any) => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bankAccountService.getAll();
      setAccounts(data);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải danh sách tài khoản ngân hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadAccounts(); }, [loadAccounts]));

  const handleSetDefault = async (account: BankAccount) => {
    if (account.isDefault) { return; }
    setActionLoading(account._id);
    try {
      const updated = await bankAccountService.setDefault(account._id);
      setAccounts(prev =>
        prev.map(a => ({ ...a, isDefault: a._id === updated._id })),
      );
    } catch {
      Alert.alert('Lỗi', 'Không thể đặt tài khoản mặc định.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (account: BankAccount) => {
    Alert.alert(
      'Xoá tài khoản',
      `Bạn có chắc muốn xoá tài khoản ${account.accountNumber} - ${account.bankName}?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(account._id);
            try {
              await bankAccountService.remove(account._id);
              setAccounts(prev => prev.filter(a => a._id !== account._id));
            } catch {
              Alert.alert('Lỗi', 'Không thể xoá tài khoản ngân hàng.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: BankAccount }) => {
    const isLoading = actionLoading === item._id;
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.bankIconBox}>
            <Icon name="card-outline" size={22} color={colors.primaryGreen} />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.cardRow}>
              <Text style={styles.bankName}>{item.bankName}</Text>
              {item.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Mặc định</Text>
                </View>
              )}
            </View>
            <Text style={styles.accountNumber}>{item.accountNumber}</Text>
            <Text style={styles.accountOwner}>{item.accountOwner}</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primaryGreen} />
        ) : (
          <View style={styles.actions}>
            {!item.isDefault && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleSetDefault(item)}
              >
                <Icon name="star-outline" size={20} color={colors.primaryGreen} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDelete(item)}
            >
              <Icon name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tài khoản ngân hàng</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddBankAccount')}
        >
          <Icon name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      ) : accounts.length === 0 ? (
        <View style={styles.center}>
          <Icon name="card-outline" size={56} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>Chưa có tài khoản ngân hàng</Text>
          <Text style={styles.emptyDesc}>Thêm tài khoản để rút tiền nhanh chóng</Text>
          <TouchableOpacity
            style={styles.addFirstBtn}
            onPress={() => navigation.navigate('AddBankAccount')}
          >
            <Text style={styles.addFirstBtnText}>Thêm tài khoản</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
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
    paddingVertical: 14,
    backgroundColor: colors.primaryGreen,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.white },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginTop: 8 },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  addFirstBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primaryGreen,
    borderRadius: 12,
  },
  addFirstBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },

  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bankIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryGreen + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  bankName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  defaultBadge: {
    backgroundColor: colors.primaryGreen + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: { fontSize: 11, fontWeight: '600', color: colors.primaryGreen },
  accountNumber: { fontSize: 14, color: colors.textPrimary, fontWeight: '500', letterSpacing: 0.5 },
  accountOwner: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 8 },
});

export default BankAccountListScreen;
