import React, { memo, useCallback } from 'react';
import {
  Pressable,
  PressableProps,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface PressableCardProps extends Omit<PressableProps, 'style'> {
  style?: ViewStyle;
  pressedScale?: number;
  pressingScale?: number;
  animationDuration?: number;
  springConfig?: object;
}

const PressableCard: React.FC<PressableCardProps> = memo(({
  children,
  style,
  pressedScale = 0.98,
  pressingScale = 0.95,
  animationDuration = 100,
  springConfig = {
    damping: 15,
    stiffness: 300,
  },
  onPress,
  onPressIn,
  onPressOut,
  ...pressableProps
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = useCallback((event: any) => {
    scale.value = withSpring(pressingScale, springConfig);
    opacity.value = withTiming(0.8, { duration: animationDuration });
    onPressIn?.(event);
  }, [pressingScale, springConfig, animationDuration, onPressIn]);

  const handlePressOut = useCallback((event: any) => {
    scale.value = withSpring(1, springConfig);
    opacity.value = withTiming(1, { duration: animationDuration });
    onPressOut?.(event);
  }, [springConfig, animationDuration, onPressOut]);

  const handlePress = useCallback((event: any) => {
    scale.value = withSpring(pressedScale, {
      ...springConfig,
      damping: 10,
    });
    setTimeout(() => {
      scale.value = withSpring(1, springConfig);
    }, 100);
    onPress?.(event);
  }, [pressedScale, springConfig, onPress]);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      {...pressableProps}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
});

PressableCard.displayName = 'PressableCard';

export default PressableCard;
