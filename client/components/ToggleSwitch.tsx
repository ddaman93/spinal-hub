import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";

interface ToggleSwitchProps {
  value: boolean;
  onToggle: (newValue: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedView = Animated.createAnimatedComponent(View);

export function ToggleSwitch({
  value,
  onToggle,
  disabled = false,
  accessibilityLabel,
}: ToggleSwitchProps): React.JSX.Element {
  const { theme } = useTheme();
  const translateX = useSharedValue(value ? 28 : 4);

  const animatedTrackStyle = useAnimatedStyle(() => ({
    backgroundColor: value
      ? theme.primary
      : theme.backgroundSecondary,
  }));

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    
    const newValue = !value;
    translateX.value = withSpring(
      newValue ? 28 : 4,
      springConfig
    );
    onToggle(newValue);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessible
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
    >
      <AnimatedView
        style={[
          styles.track,
          animatedTrackStyle,
          {
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <AnimatedView
          style={[
            styles.thumb,
            animatedThumbStyle,
            {
              backgroundColor: theme.backgroundDefault,
            },
          ]}
        />
      </AnimatedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 60,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
