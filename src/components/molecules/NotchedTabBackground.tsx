import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';

const { width: W } = Dimensions.get('window');

const NOTCH_RADIUS = 46;
const CORNER_RADIUS = 24;
const SMOOTH = 14;
export const FULL_HEIGHT = Platform.OS === 'ios' ? 88 : 68;

const NotchedTabBackground: React.FC = () => {
  const cx = W / 2;
  const r = NOTCH_RADIUS;
  const s = SMOOTH;
  const h = FULL_HEIGHT;

  const d = [
    `M 0,${h}`,
    `L 0,${CORNER_RADIUS}`,
    `Q 0,0 ${CORNER_RADIUS},0`,
    `L ${cx - r - 10 - s},0`,
    `Q ${cx - r - 1},0 ${cx - r - 0.5},${s}`,
    `A ${r},${r} 0 0 0 ${cx + r - 1.5},${s}`,
    `Q ${cx + r + 1},0 ${cx + r + 10 + s},0`,
    `L ${W - CORNER_RADIUS},0`,
    `Q ${W},0 ${W},${CORNER_RADIUS}`,
    `L ${W},${h}`,
    `Z`,
  ].join(' ');

  return (
    <View style={styles.container}>
      <Svg width={W} height={h}>
        <Path
          d={d}
          fill={colors.white}
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="1"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: W,
  },
});

export default NotchedTabBackground;
