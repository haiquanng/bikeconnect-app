import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme';
import type { Address } from '../../../types/user';

interface Props {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}

const formatAddress = (a: Address) =>
  a.fullAddress || [a.street, a.wardName, a.provinceName].filter(Boolean).join(', ');

const AddressCard: React.FC<Props> = ({ address, selected, onSelect }) => (
  <TouchableOpacity
    style={[styles.card, selected && styles.cardSelected]}
    onPress={onSelect}
    activeOpacity={0.75}
  >
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>

    <View style={styles.content}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{address.label}</Text>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Mặc định</Text>
          </View>
        )}
      </View>
      <Text style={styles.addressText} numberOfLines={2}>
        {formatAddress(address) || 'Chưa có địa chỉ chi tiết'}
      </Text>
    </View>

    <Icon
      name="location-outline"
      size={18}
      color={selected ? colors.primaryGreen : colors.gray[400]}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    marginBottom: 12,
    gap: 12,
  },
  cardSelected: {
    borderColor: colors.primaryGreen,
    backgroundColor: colors.primaryGreen + '08',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primaryGreen },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryGreen,
  },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  defaultBadge: {
    backgroundColor: colors.primaryGreen + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: { fontSize: 11, color: colors.primaryGreen, fontWeight: '600' },
  addressText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});

export default AddressCard;
