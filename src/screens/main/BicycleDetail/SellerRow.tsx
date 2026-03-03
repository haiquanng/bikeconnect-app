import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme';
import { showToast } from '../../../utils/toast';
import type { BicycleListing } from '../../../types/bicycle';

interface Props {
  seller: BicycleListing['seller'];
  location: BicycleListing['location'];
}

const SellerRow = ({ seller, location }: Props) => (
  <View style={styles.row}>
    <View style={styles.left}>
      <View style={styles.avatar}>
        {seller?.avatarUrl ? (
          <Image source={{ uri: seller.avatarUrl }} style={styles.avatarImg} />
        ) : (
          <Icon name="person" size={24} color={colors.gray[400]} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.by}>Người bán</Text>
        <Text style={styles.name} numberOfLines={1}>
          {seller?.fullName ?? 'Ẩn danh'}
        </Text>
        {location?.city && (
          <Text style={styles.location}>{location.city}</Text>
        )}
      </View>
    </View>
    <TouchableOpacity
      style={styles.msgBtn}
      onPress={() => showToast('Đang phát triển')}
    >
      <Text style={styles.msgBtnText}>Nhắn tin</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 48, height: 48 },
  info: { flex: 1 },
  by: { fontSize: 11, color: colors.textSecondary },
  name: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  location: { fontSize: 12, color: colors.textSecondary },
  msgBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
  },
  msgBtnText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
});

export default SellerRow;
