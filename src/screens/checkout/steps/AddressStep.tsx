import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../theme';
import type { Address } from '../../../types/user';
import AddressCard from '../components/AddressCard';

interface Props {
  addresses: Address[];
  selectedAddress: Address | null;
  onSelectAddress: (addr: Address) => void;
  onAddNew: () => void;
  onContinue: () => void;
}

const AddressStep: React.FC<Props> = ({
  addresses,
  selectedAddress,
  onSelectAddress,
  onAddNew,
  onContinue,
}) => {
  const insets = useSafeAreaInsets();
  const canContinue = selectedAddress !== null;

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Icon name="location-outline" size={20} color={colors.primaryGreen} />
          <Text style={styles.sectionTitle}>Giao hàng đến</Text>
        </View>

        {/* Address list */}
        {addresses.length === 0 ? (
          <View style={styles.emptyBox}>
            <Icon name="location-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>Chưa có địa chỉ</Text>
            <Text style={styles.emptyDesc}>Thêm địa chỉ giao hàng để tiếp tục</Text>
          </View>
        ) : (
          addresses.map(addr => (
            <AddressCard
              key={addr._id ?? addr.label}
              address={addr}
              selected={selectedAddress?._id === addr._id && selectedAddress?._id !== undefined
                ? true
                : selectedAddress?.label === addr.label && selectedAddress?._id === undefined}
              onSelect={() => onSelectAddress(addr)}
            />
          ))
        )}

        {/* Add new address */}
        <TouchableOpacity style={styles.addBtn} onPress={onAddNew} activeOpacity={0.75}>
          <View style={styles.addIcon}>
            <Icon name="add" size={20} color={colors.primaryGreen} />
          </View>
          <View style={styles.addContent}>
            <Text style={styles.addTitle}>Thêm địa chỉ mới</Text>
            <Text style={styles.addDesc}>Lưu để thanh toán nhanh hơn</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={colors.gray[400]} />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 20 }]}>
        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          onPress={onContinue}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>
            {canContinue ? 'Tiếp tục' : 'Chọn địa chỉ để tiếp tục'}
          </Text>
          {canContinue && <Icon name="arrow-forward" size={18} color={colors.white} />}
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
    backgroundColor: colors.white,
    marginTop: 4,
    gap: 12,
  },
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryGreen + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addContent: { flex: 1 },
  addTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  addDesc:  { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

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
  continueBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueBtnDisabled: {
    backgroundColor: colors.gray[200],
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default AddressStep;
