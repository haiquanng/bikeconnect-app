import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../theme';

export const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabButtonsContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  animatedIndicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    width: 40,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
