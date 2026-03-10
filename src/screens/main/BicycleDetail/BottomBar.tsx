import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../../../theme';

interface Props {
  isSeller: boolean;
  bottomInset: number;
  onViewListings: () => void;
  onDeposit: () => void;
  onBuy: () => void;
}

const BottomBar = ({ isSeller, bottomInset, onViewListings, onDeposit, onBuy }: Props) => (
  <View style={[styles.bar, { paddingBottom: bottomInset || 16 }]}>
    {isSeller ? (
      <TouchableOpacity style={styles.primaryBtn} onPress={onViewListings}>
        <Text style={styles.primaryBtnText}>Xem toàn bộ tin đăng</Text>
      </TouchableOpacity>
    ) : (
      <>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onDeposit}
        >
          <Text style={styles.secondaryBtnText}>Đặt cọc 10%</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={onBuy}>
          <Text style={styles.primaryBtnText}>Mua ngay</Text>
        </TouchableOpacity>
      </>
    )}
  </View>
);

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.gray[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});

export default BottomBar;
