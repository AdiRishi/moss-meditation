import { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { useThemeColors } from "@/hooks/use-theme-colors";
import { easings } from "@/lib/motion";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Maximum arc sweep with a 12-degree gap at full progress. */
const MAX_SWEEP = 348 / 360;

type SessionRingProps = {
  size: number;
  /** Fraction of the ring drawn, 0..1. A value of 1 still leaves the ensō gap open. */
  progress: number;
  strokeWidth?: number;
  /** Animate progress changes (including the initial draw from zero). */
  animated?: boolean;
  /**
   * After the first draw, glide between steady ticks at constant speed (the
   * meditation countdown) instead of easing out on every update.
   */
  continuous?: boolean;
  drawDurationMs?: number;
  arcColor?: string;
  trackColor?: string;
  children?: React.ReactNode;
};

export function SessionRing({
  size,
  progress,
  strokeWidth = 2,
  animated = false,
  continuous = false,
  drawDurationMs = 450,
  arcColor,
  trackColor,
  children,
}: SessionRingProps) {
  const colors = useThemeColors();
  const clamped = Math.min(Math.max(progress, 0), 1);
  const drawn = useSharedValue(animated ? 0 : clamped);
  const firstDraw = useRef(true);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!animated) {
      drawn.set(clamped);
      return;
    }
    if (continuous && !firstDraw.current) {
      // Steady once-a-second ticks glide linearly so the arc never surges
      // and stalls; withTiming retargets from the current sweep.
      drawn.set(withTiming(clamped, { duration: 1_000, easing: Easing.linear }));
    } else {
      drawn.set(withTiming(clamped, { duration: drawDurationMs, easing: easings.draw }));
      firstDraw.current = false;
    }
  }, [animated, clamped, continuous, drawDurationMs, drawn]);

  const arcProps = useAnimatedProps(() => {
    const arcLength = drawn.get() * MAX_SWEEP * circumference;
    return {
      strokeDasharray: [arcLength, circumference],
      opacity: arcLength > 0.5 ? 1 : 0,
    };
  });

  return (
    <View style={{ height: size, width: size }}>
      <Svg height={size} width={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor ?? colors.border}
          strokeWidth={1}
        />
        <AnimatedCircle
          animatedProps={arcProps}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={arcColor ?? colors.accent}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </Svg>
      {children ? <View className="absolute inset-0 items-center justify-center">{children}</View> : null}
    </View>
  );
}
