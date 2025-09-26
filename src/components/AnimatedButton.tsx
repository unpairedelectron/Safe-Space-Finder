import React, { useState, useEffect } from 'react';
import { Pressable, Animated, View, StyleSheet, AccessibilityProps, AccessibilityInfo, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ds } from '@/theme/designSystem';

interface AnimatedButtonProps extends AccessibilityProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
  hapticType?: 'light' | 'medium' | 'heavy' | 'none';
  reduceMotionOverride?: boolean; // for tests
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onPress,
  style,
  hapticType = 'light',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityState,
  reduceMotionOverride,
  ...rest
}) => {
  const [scaleValue] = useState(new Animated.Value(1));
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(val => setPrefersReducedMotion(val))
      .catch(() => {});
  }, []);

  const actuallyReduce = reduceMotionOverride ?? prefersReducedMotion;

  const animateTo = (toValue: number, spring = true) => {
    if (actuallyReduce) {
      scaleValue.setValue(1); // no scale changes if user prefers reduced motion
      return;
    }
    if (spring) {
      Animated.spring(scaleValue, {
        toValue,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }).start();
    } else {
      Animated.timing(scaleValue, {
        toValue,
        duration: ds.motion.duration.sm,
        easing: ds.motion.easing.standard,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressIn = () => animateTo(0.95);
  const handlePressOut = () => animateTo(1);

  const handlePress = () => {
    switch (hapticType) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); break;
    }
    onPress();
  };

  // Provide subtle background/elevation treatment on press (visual feedback w/out motion)
  const elevationStyle = actuallyReduce ? (isDark ? styles.darkReduced : styles.lightReduced) : undefined;

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      {...rest}
    >
      <Animated.View
        style={[
          style,
          elevationStyle,
          { transform: [{ scale: scaleValue }] },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  darkReduced: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: ds.radii.sm,
  },
  lightReduced: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: ds.radii.sm,
  },
});
