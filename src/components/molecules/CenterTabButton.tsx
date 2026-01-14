import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme';

export interface CenterTabButtonProps {
  label: string;
  onPress: () => void;
  onLayout: (event: any) => void;
  icon?: React.ReactNode;
}

const CenterTabButton: React.FC<CenterTabButtonProps> = ({
  label,
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
        <View style={styles.customButton}>{icon}</View>
        <Text style={styles.customButtonLabel}>{label}</Text>
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
    marginTop: -24,
  },
  customButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  customButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[400],
  },
});

export default CenterTabButton;
