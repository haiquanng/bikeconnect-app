import React from 'react';
import { View, Animated, DeviceEventEmitter } from 'react-native';
import { colors } from '../../../theme';
import WaveBackground from '../../molecules/WaveBackground';
import TabButton from '../../molecules/TabButton';
import CenterTabButton from '../../molecules/CenterTabButton';
import { CustomTabBarProps, TabLayout } from './types';
import { styles } from './styles';

export const SCROLL_TO_TOP_EVENT = 'tabScrollToTop';

const CustomTabBarComponent: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const [tabLayouts, setTabLayouts] = React.useState<TabLayout[]>([]);
  const indicatorPosition = React.useRef(new Animated.Value(0)).current;

  // Animate indicator when active tab changes
  React.useEffect(() => {
    if (tabLayouts.length > 0 && tabLayouts[state.index]) {
      const activeTab = tabLayouts[state.index];
      // Center the indicator within the tab
      const indicatorWidth = 40; // Fixed width
      const centeredPosition =
        activeTab.x + (activeTab.width - indicatorWidth) / 2;

      Animated.spring(indicatorPosition, {
        toValue: centeredPosition,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [state.index, tabLayouts, indicatorPosition]);

  const handleLayout = (event: any, index: number) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts(prev => {
      const newLayouts = [...prev];
      newLayouts[index] = { x, width };
      return newLayouts;
    });
  };

  return (
    <View style={styles.tabBar}>
      <WaveBackground />

      <Animated.View
        style={[
          styles.animatedIndicator,
          {
            transform: [{ translateX: indicatorPosition }],
          },
        ]}
      />

      {/* Tab Buttons */}
      <View style={styles.tabButtonsContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || route.name;
          const isFocused = state.index === index;
          const isCenterButton = route.name === 'Sell';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            } else if (isFocused) {
              // Bấm lại tab đang active → cuộn về đầu
              DeviceEventEmitter.emit(SCROLL_TO_TOP_EVENT, {
                routeName: route.name,
              });
            }
          };

          // Render icon
          const icon = options.tabBarIcon
            ? options.tabBarIcon({
                focused: isFocused,
                color: isCenterButton
                  ? colors.white
                  : isFocused
                  ? colors.primary
                  : colors.gray[400],
                size: isCenterButton ? 32 : 24,
              })
            : null;

          if (isCenterButton) {
            return (
              <CenterTabButton
                key={route.key}
                label="Đăng bán"
                onPress={onPress}
                onLayout={e => handleLayout(e, index)}
                icon={icon}
              />
            );
          }

          // Regular tab button
          return (
            <TabButton
              key={route.key}
              label={label}
              isFocused={isFocused}
              onPress={onPress}
              onLayout={e => handleLayout(e, index)}
              icon={icon}
            />
          );
        })}
      </View>
    </View>
  );
};

// Wrapper function for React Navigation compatibility with React 19
const CustomTabBar = (props: CustomTabBarProps) => {
  return <CustomTabBarComponent {...props} />;
};

export default CustomTabBar;
