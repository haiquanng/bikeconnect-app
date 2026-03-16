import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 4,
    overflow: 'visible',
  },
  tabButtonsContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  shadowGradient: {
    position: 'absolute',
    top: -16,
    left: 0,
    right: 0,
    height: 16,
  },
});
