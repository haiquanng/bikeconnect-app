import React, {
  createRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { colors } from '../../theme';

interface GlobalLoadingRef {
  show: () => void;
  hide: () => void;
}

const globalLoadingRef = createRef<GlobalLoadingRef>();

export const globalLoading = {
  show: () => globalLoadingRef.current?.show(),
  hide: () => globalLoadingRef.current?.hide(),
};

const GlobalLoading = forwardRef<GlobalLoadingRef>((_, ref) => {
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    show: () => setVisible(true),
    hide: () => setVisible(false),
  }));

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export { globalLoadingRef };
export default GlobalLoading;
