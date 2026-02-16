import React, { useEffect, useCallback } from "react";
import { Platform, Pressable, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/constants/hooks/useTheme";
import { Colors } from "@/constants/theme";

const HORIZONTAL_PADDING = 16;
const BAR_HEIGHT = 64;
const PILL_HEIGHT = 50;

/* ─── icon map ─────────────────────────────────────── */
const ICON_MAP: Record<string, "home" | "tool" | "settings" | "user"> = {
  HomeTab: "home",
  ToolsTab: "tool",
  SettingsTab: "settings",
  ProfileTab: "user",
};

/* ─── per-tab animated item ────────────────────────── */
function AnimatedTabItem({
  label,
  iconName,
  isFocused,
  activeColor,
  inactiveColor,
  onPress,
  onLongPress,
  accessibilityLabel,
  tabWidth,
}: {
  label: string;
  iconName: "home" | "tool" | "settings" | "user";
  isFocused: boolean;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel: string;
  tabWidth: number;
}) {
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, { duration: 180 });
  }, [isFocused, progress]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 1.12], Extrapolate.CLAMP) },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.7, 1], Extrapolate.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [2, 0], Extrapolate.CLAMP) },
    ],
  }));

  const color = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={accessibilityLabel}
      testID={`tab-${label.toLowerCase()}`}
      style={{
        width: tabWidth,
        minHeight: 44,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    >
      <Animated.View style={iconStyle}>
        <Feather name={iconName} size={19} color={color} />
      </Animated.View>
      <Animated.Text
        style={[
          labelStyle,
          {
            fontSize: 11,
            fontWeight: "500",
            color,
            lineHeight: 14,
          },
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

/* ─── main tab bar ─────────────────────────────────── */
export default function AnimatedGlassTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const tabColors = isDark ? Colors.dark : Colors.light;

  const activeColor = tabColors.tabIconSelected;
  const inactiveColor = tabColors.tabIconDefault;

  const screenWidth = Dimensions.get("window").width;
  const tabCount = state.routes.length;
  const tabWidth = (screenWidth - HORIZONTAL_PADDING * 2) / tabCount;

  /* animated pill position */
  const activeIndex = useSharedValue(state.index);

  useEffect(() => {
    activeIndex.value = withTiming(state.index, { duration: 220 });
  }, [state.index, activeIndex]);

  const pillStyle = useAnimatedStyle(() => {
    const translateX = activeIndex.value * tabWidth;

    return {
      transform: [{ translateX }],
      backgroundColor: isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(255,255,255,0.7)",
      borderColor: isDark
        ? "rgba(255,255,255,0.16)"
        : "rgba(0,0,0,0.08)",
      // iOS shadow (glow)
      shadowColor: activeColor,
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    };
  });

  /* Android glow layer — positioned behind the pill */
  const glowStyle = useAnimatedStyle(() => {
    const translateX = activeIndex.value * tabWidth;
    return {
      transform: [{ translateX }],
    };
  });

  const handlePress = useCallback(
    (route: { name: string; key: string }) => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        navigation.navigate({ name: route.name, params: undefined });
      }
    },
    [navigation]
  );

  const handleLongPress = useCallback(
    (route: { name: string; key: string }) => {
      navigation.emit({
        type: "tabLongPress",
        target: route.key,
      });
    },
    [navigation]
  );

  return (
    <Animated.View
      style={{
        height: BAR_HEIGHT + insets.bottom,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 8,
        paddingHorizontal: HORIZONTAL_PADDING,
        backgroundColor: isDark
          ? "rgba(30,30,30,0.85)"
          : "rgba(245,245,245,0.85)",
        // top border replaces the full opaque border
        borderTopWidth: 1,
        borderTopColor: isDark
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.06)",
        // iOS blur-like feel via slight transparency (already set above)
      }}
    >
      {/* pill track: relative container so absolute children are positioned inside */}
      <Animated.View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Android glow layer (behind pill) */}
        {Platform.OS === "android" && (
          <Animated.View
            style={[
              glowStyle,
              {
                position: "absolute",
                top: -2,
                left: -4,
                width: tabWidth + 8,
                height: PILL_HEIGHT + 4,
                borderRadius: 999,
                backgroundColor: activeColor,
                opacity: 0.12,
              },
            ]}
          />
        )}

        {/* animated pill background */}
        <Animated.View
          style={[
            pillStyle,
            {
              position: "absolute",
              top: 0,
              left: 0,
              width: tabWidth,
              height: PILL_HEIGHT,
              borderRadius: 999,
              borderWidth: 1,
              // elevation for Android shadow fallback
              ...(Platform.OS === "android" ? { elevation: 4 } : {}),
            },
          ]}
        />

        {/* tab items row */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title ?? route.name;
          const isFocused = state.index === index;
          const iconName =
            ICON_MAP[route.name] ?? "circle";

          const accessibilityLabel =
            typeof options.tabBarAccessibilityLabel === "string"
              ? options.tabBarAccessibilityLabel
              : label;

          return (
            <AnimatedTabItem
              key={route.key}
              label={label}
              iconName={iconName as any}
              isFocused={isFocused}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
              tabWidth={tabWidth}
              accessibilityLabel={accessibilityLabel}
              onPress={() => handlePress(route)}
              onLongPress={() => handleLongPress(route)}
            />
          );
        })}
      </Animated.View>
    </Animated.View>
  );
}
