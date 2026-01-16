import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Modal,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme';

interface LoadingProps {
  visible?: boolean;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
  style?: ViewStyle;
}

const Loading: React.FC<LoadingProps> = ({
  visible = true,
  size = 'large',
  color = colors.primary,
  overlay = false,
  style,
}) => {
  if (!visible) return null;

  const content = (
    <View style={[overlay ? styles.overlayContainer : styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default Loading;
