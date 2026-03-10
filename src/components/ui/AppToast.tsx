import React, {
  createRef,
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
} from 'react';
import { View, Text, Modal, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';

interface AppToastRef {
  show: (message: string) => void;
}

const appToastRef = createRef<AppToastRef>();

export const appToast = {
  show: (message: string) => appToastRef.current?.show(message),
};

const AppToast = forwardRef<AppToastRef>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useImperativeHandle(ref, () => ({
    show: (msg: string) => {
      // Cancel pending hide
      if (hideTimer.current) { clearTimeout(hideTimer.current); }
      translateY.stopAnimation();
      opacity.stopAnimation();

      setMessage(msg);
      setVisible(true);
      translateY.setValue(-80);
      opacity.setValue(0);

      // Slide in
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, friction: 7, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();

      // Auto-hide after 2.5s
      hideTimer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -80, duration: 220, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start(() => setVisible(false));
      }, 2500);
    },
  }));

  if (!visible) { return null; }

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            styles.toast,
            { top: insets.top + 12, opacity, transform: [{ translateY }] },
          ]}
        >
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: colors.primaryGreen,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.primaryGreen,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  text: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export { appToastRef };
export default AppToast;
