import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme';

export interface CenterTabButtonProps {
  onPress: () => void;
  onLayout: (event: any) => void;
  icon?: React.ReactNode;
}

const CenterTabButton: React.FC<CenterTabButtonProps> = ({
  onPress,
  onLayout,
  icon,
}) => {
  return (
    <View style={styles.centerTabContainer} onLayout={onLayout}>
      <TouchableOpacity
        onPress={onPress}
        style={styles.centerButtonWrapper}
        activeOpacity={0.8}
      >
        {/* White halo ring — tạo hiệu ứng nổi như mẫu Flutter */}
        <View style={styles.halo}>
          <View style={styles.customButton}>{icon}</View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  centerTabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -44,
  },
  halo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primaryGreen,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 14,
  },
  customButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default CenterTabButton;
