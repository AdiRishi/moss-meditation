import { useThemeColor } from "heroui-native";
import type { Ref } from "react";
import {
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type VariantProps, tv } from "tailwind-variants";

import { useScreenContainerScrollInsets } from "./use-screen-container-insets";

const screenScrollViewVariants = tv({
  base: "flex-1 bg-background px-6",
});

export type ScreenScrollViewBaseProps = ScrollViewProps &
  VariantProps<typeof screenScrollViewVariants> & {
    containerStyle?: StyleProp<ViewStyle>;
    edgeToEdge?: boolean;
    /**
     * Size the content to the visible viewport (the scroll frame minus safe areas) so
     * `justify-between` compositions can pin content to the visible bottom edge.
     * Percentage heights and `grow` cannot express this on iOS, where safe areas are
     * applied as content insets rather than padding.
     */
    fillViewport?: boolean;
    ref?: Ref<ScrollView>;
  };

export function ScreenScrollViewBase({
  automaticallyAdjustsScrollIndicatorInsets,
  children,
  className,
  containerStyle,
  contentInsetAdjustmentBehavior,
  contentContainerClassName,
  contentContainerStyle,
  edgeToEdge,
  fillViewport = false,
  onLayout,
  ref,
  showsHorizontalScrollIndicator = false,
  showsVerticalScrollIndicator = false,
  style,
  ...props
}: ScreenScrollViewBaseProps) {
  const safeAreaInsets = useScreenContainerScrollInsets(edgeToEdge);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const backgroundColor = useThemeColor("background");

  // On iOS the scroll frame spans the full screen and safe areas arrive as content
  // insets, so the visible viewport excludes them. On Android the outer view already
  // pads the safe areas away from the scroll frame.
  const insetAdjustment = edgeToEdge ? 0 : insets.top + insets.bottom;
  const fillViewportStyle = fillViewport ? { minHeight: windowHeight - insetAdjustment } : null;

  return (
    <View style={[{ flex: 1, backgroundColor }, safeAreaInsets, containerStyle]}>
      <ScrollView
        ref={ref}
        automaticallyAdjustsScrollIndicatorInsets={automaticallyAdjustsScrollIndicatorInsets ?? !edgeToEdge}
        className={screenScrollViewVariants({ class: className })}
        contentContainerClassName={contentContainerClassName}
        contentContainerStyle={[contentContainerStyle, fillViewportStyle]}
        contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior ?? (edgeToEdge ? "never" : "automatic")}
        onLayout={onLayout}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        style={style}
        {...props}
      >
        {children}
      </ScrollView>
    </View>
  );
}
