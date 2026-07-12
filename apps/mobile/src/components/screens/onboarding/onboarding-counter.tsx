import { Pressable, View } from "react-native";

import { Typography } from "@/components/ui/typography";
import { ZenCard } from "@/components/ui/zen/zen-card";
import { ZenIcon } from "@/components/ui/zen/zen-icon";
import { useThemeColors } from "@/hooks/use-theme-colors";

type OnboardingCounterProps = {
  value: number;
  label: string;
  minimum: number;
  maximum: number;
  onChange: (value: number) => void;
};

export function OnboardingCounter({ value, label, minimum, maximum, onChange }: OnboardingCounterProps) {
  const colors = useThemeColors();

  return (
    <ZenCard className="flex-row items-center justify-between px-4 py-4">
      <Pressable
        accessibilityLabel={`Decrease ${label}`}
        accessibilityRole="button"
        className="size-11 items-center justify-center rounded-full border border-stone"
        disabled={value <= minimum}
        onPress={() => onChange(Math.max(minimum, value - 1))}
      >
        <ZenIcon name="minus" size={18} tintColor={value <= minimum ? colors.border : colors.foreground} />
      </Pressable>
      <View className="items-center gap-0.5">
        <Typography variant="h2" align="center" tone="accent" tabularNums>
          {value}
        </Typography>
        <Typography variant="caption" tone="muted" align="center">
          {label}
        </Typography>
      </View>
      <Pressable
        accessibilityLabel={`Increase ${label}`}
        accessibilityRole="button"
        className="size-11 items-center justify-center rounded-full border border-stone"
        disabled={value >= maximum}
        onPress={() => onChange(Math.min(maximum, value + 1))}
      >
        <ZenIcon name="plus" size={18} tintColor={value >= maximum ? colors.border : colors.foreground} />
      </Pressable>
    </ZenCard>
  );
}
