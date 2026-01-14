import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme';

export interface TabButtonProps {
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLayout: (event: any) => void;
  icon?: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({
  label,
  isFocused,
  onPress,
  onLayout,
  icon,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabButton}
      onLayout={onLayout}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text
        style={[
          styles.tabBarLabel,
          {
            color: isFocused ? colors.primary : colors.gray[400],
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TabButton;
