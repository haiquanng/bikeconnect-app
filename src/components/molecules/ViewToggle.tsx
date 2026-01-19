import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';

type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, viewMode === 'list' && styles.buttonActive]}
        onPress={() => onViewModeChange('list')}
      >
        <Icon
          name="list-outline"
          size={20}
          color={viewMode === 'list' ? colors.primary : colors.gray[400]}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, viewMode === 'grid' && styles.buttonActive]}
        onPress={() => onViewModeChange('grid')}
      >
        <Icon
          name="grid-outline"
          size={20}
          color={viewMode === 'grid' ? colors.primary : colors.gray[400]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: colors.primary + '20',
  },
});

export default ViewToggle;
