import React from 'react';
import { View, DeviceEventEmitter } from 'react-native';
import { colors } from '../../../theme';
import NotchedTabBackground from '../../molecules/NotchedTabBackground';
import TabButton from '../../molecules/TabButton';
import CenterTabButton from '../../molecules/CenterTabButton';
import { CustomTabBarProps } from './types';
import { styles } from './styles';

export const SCROLL_TO_TOP_EVENT = 'tabScrollToTop';

const CustomTabBarComponent: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.tabBar}>
      <NotchedTabBackground />

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
              DeviceEventEmitter.emit(SCROLL_TO_TOP_EVENT, {
                routeName: route.name,
              });
            }
          };

          const icon = options.tabBarIcon
            ? options.tabBarIcon({
                focused: isFocused,
                color: isCenterButton
                  ? colors.white
                  : isFocused
                  ? colors.primary
                  : colors.gray[400],
                size: isCenterButton ? 28 : 24,
              })
            : null;

          if (isCenterButton) {
            return (
              <CenterTabButton
                key={route.key}
                onPress={onPress}
                onLayout={() => {}}
                icon={icon}
              />
            );
          }

          return (
            <TabButton
              key={route.key}
              label={label}
              isFocused={isFocused}
              onPress={onPress}
              onLayout={() => {}}
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
