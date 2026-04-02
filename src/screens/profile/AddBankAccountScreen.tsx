import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';
import { bankAccountService } from '../../api/bankAccountService';
import { walletService } from '../../api/walletService';
import type { VietQRBank } from '../../types/bankAccount';

const AddBankAccountScreen = ({ navigation }: any) => {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountOwner, setAccountOwner] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  const [banks, setBanks] = useState<VietQRBank[]>([]);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState<VietQRBank | null>(null);
  const [loadingBanks, setLoadingBanks] = useState(false);

  useEffect(() => {
    setLoadingBanks(true);
    walletService.getBanks()
      .then(data => {
        const transferable = data.filter(b => b.transferSupported === 1);
        setBanks(transferable);
      })
      .catch(() => { /* dùng manual input nếu lỗi */ })
      .finally(() => setLoadingBanks(false));
  }, []);

  const filteredBanks = bankSearch.trim()
    ? banks.filter(b =>
        b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
        b.shortName.toLowerCase().includes(bankSearch.toLowerCase()) ||
        b.code.toLowerCase().includes(bankSearch.toLowerCase()),
      )
    : banks;

  const handleSelectBank = (bank: VietQRBank) => {
    setSelectedBank(bank);
    setBankName(bank.shortName);
    setShowBankPicker(false);
    setBankSearch('');
  };

  const handleSubmit = async () => {
    if (!bankName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngân hàng');
      return;
    }
    if (!accountNumber.trim() || !/^[0-9]+$/.test(accountNumber.trim())) {
      Alert.alert('Lỗi', 'Số tài khoản chỉ gồm chữ số');
      return;
    }
    if (!accountOwner.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chủ tài khoản');
      return;
    }

    setLoading(true);
    try {
      await bankAccountService.add({
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountOwner: accountOwner.trim().toUpperCase(),
        isDefault,
      });
      navigation.goBack();
    } catch (e: any) {
      const status = e?.response?.status;
      const msg: string = e?.response?.data?.message ?? '';
      const msgLower = msg.toLowerCase();
      // Kiểm tra name mismatch TRƯỚC (message chứa "tên"/"name"/"khớp"/"owner")
      const isNameMismatch = status === 400 && (
        msgLower.includes('không khớp') ||
        msgLower.includes('tên chủ') ||
        msgLower.includes('accountowner') ||
        msgLower.includes('owner')
      );
      // KYC chưa xác minh: message chứa "kyc" hoặc "chưa" kết hợp "xác minh"
      const isKycRequired = status === 400 && !isNameMismatch && (
        msgLower.includes('kyc') ||
        (msgLower.includes('chưa') && msgLower.includes('xác minh'))
      );

      if (isNameMismatch) {
        Alert.alert('Tên không khớp', 'Tên chủ tài khoản phải trùng chính xác với tên trên CCCD/CMND đã xác minh.');
      } else if (isKycRequired) {
        Alert.alert('Cần xác minh danh tính', 'Vui lòng xác minh CCCD/CMND trước khi thêm tài khoản ngân hàng.', [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Xác minh ngay', onPress: () => navigation.navigate('KYC') },
        ]);
      } else if (status === 409) {
        Alert.alert('Lỗi', 'Tài khoản ngân hàng này đã được thêm trước đó.');
      } else {
        Alert.alert('Lỗi', 'Không thể thêm tài khoản ngân hàng. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm tài khoản ngân hàng</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Bank picker */}
          <View style={styles.field}>
            <Text style={styles.label}>Ngân hàng <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setShowBankPicker(true)}
            >
              {loadingBanks ? (
                <ActivityIndicator size="small" color={colors.primaryGreen} />
              ) : selectedBank ? (
                <View style={styles.selectedBankRow}>
                  {selectedBank.logo ? (
                    <Image source={{ uri: selectedBank.logo }} style={styles.bankLogo} resizeMode="contain" />
                  ) : null}
                  <Text style={styles.pickerValue}>{selectedBank.shortName}</Text>
                </View>
              ) : (
                <Text style={styles.pickerPlaceholder}>Chọn ngân hàng...</Text>
              )}
              <Icon name="chevron-down-outline" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          </View>

          {/* Account number */}
          <View style={styles.field}>
            <Text style={styles.label}>Số tài khoản <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số tài khoản"
              placeholderTextColor={colors.gray[300]}
              keyboardType="numeric"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />
          </View>

          {/* Account owner */}
          <View style={styles.field}>
            <Text style={styles.label}>Tên chủ tài khoản <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập đúng tên trên thẻ ngân hàng"
              placeholderTextColor={colors.gray[300]}
              autoCapitalize="characters"
              value={accountOwner}
              onChangeText={t => setAccountOwner(t.toUpperCase())}
            />
            <Text style={styles.hint}>Nhập đúng họ tên như trên CCCD/CMND đã xác minh (in hoa)</Text>
          </View>

          {/* Default checkbox */}
          <TouchableOpacity style={styles.checkRow} onPress={() => setIsDefault(!isDefault)}>
            <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
              {isDefault && <Icon name="checkmark" size={14} color={colors.white} />}
            </View>
            <Text style={styles.checkLabel}>Đặt làm tài khoản mặc định</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.submitBtnText}>Lưu tài khoản</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bank picker modal */}
      <Modal
        visible={showBankPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBankPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngân hàng</Text>
              <TouchableOpacity onPress={() => setShowBankPicker(false)}>
                <Icon name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <Icon name="search-outline" size={18} color={colors.gray[400]} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm ngân hàng..."
                placeholderTextColor={colors.gray[300]}
                value={bankSearch}
                onChangeText={setBankSearch}
                autoFocus
              />
            </View>
            <FlatList
              data={filteredBanks}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.bankItem, selectedBank?.id === item.id && styles.bankItemSelected]}
                  onPress={() => handleSelectBank(item)}
                >
                  {item.logo ? (
                    <Image source={{ uri: item.logo }} style={styles.bankItemLogo} resizeMode="contain" />
                  ) : (
                    <View style={styles.bankItemLogoFallback}>
                      <Icon name="card-outline" size={20} color={colors.primaryGreen} />
                    </View>
                  )}
                  <View style={styles.bankItemInfo}>
                    <Text style={styles.bankItemShort}>{item.shortName}</Text>
                    <Text style={styles.bankItemName} numberOfLines={1}>{item.name}</Text>
                  </View>
                  {selectedBank?.id === item.id && (
                    <Icon name="checkmark-circle" size={20} color={colors.primaryGreen} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.primaryGreen,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.white },

  content: { padding: 16, gap: 20, paddingBottom: 48 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  required: { color: colors.error },
  hint: { fontSize: 12, color: colors.textSecondary },

  input: {
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.textPrimary,
  },
  pickerBtn: {
    height: 52,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedBankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  bankLogo: { width: 36, height: 24, borderRadius: 4 },
  pickerValue: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  pickerPlaceholder: { fontSize: 15, color: colors.gray[300] },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: -4 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: colors.gray[300],
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primaryGreen, borderColor: colors.primaryGreen },
  checkLabel: { fontSize: 15, color: colors.textPrimary },

  submitBtn: {
    height: 52, backgroundColor: colors.primaryGreen,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 20, maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: colors.gray[50], borderRadius: 10,
    borderWidth: 1, borderColor: colors.gray[200],
    paddingHorizontal: 12, height: 44,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  bankItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.gray[100],
  },
  bankItemSelected: { backgroundColor: colors.primaryGreen + '10' },
  bankItemLogo: { width: 44, height: 28, borderRadius: 4 },
  bankItemLogoFallback: {
    width: 44, height: 28, borderRadius: 4,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  bankItemInfo: { flex: 1 },
  bankItemShort: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  bankItemName: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
});

export default AddBankAccountScreen;
