import { Separator } from "heroui-native";
import { Children } from "react";
import { Pressable, View } from "react-native";

import { formatPracticeTime } from "@/domain/date-time";
import type { CompletionSound, PracticeTime } from "@/domain/meditation";
import { getCompletionSoundLabel } from "@/domain/meditation";
import { useThemeColors } from "@/hooks/use-theme-colors";

import { Typography } from "../typography";
import { ZenCard } from "./zen-card";
import { ZenIcon, type ZenIconName } from "./zen-icon";

type ZenListRowProps = {
  icon: ZenIconName;
  label: string;
  value?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  accessibilityHint?: string;
};

export function ZenListRow({
  icon,
  label,
  value,
  onPress,
  trailing,
  showChevron = Boolean(onPress),
  accessibilityHint,
}: ZenListRowProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityHint={accessibilityHint}
      className="min-h-16 flex-row items-center gap-4 px-4 py-3"
      disabled={!onPress}
      onPress={onPress}
    >
      <View className="size-10 items-center justify-center rounded-full bg-surface-secondary">
        <ZenIcon name={icon} size={22} tintColor={colors.muted} />
      </View>
      <View className="flex-1 gap-0.5">
        <Typography variant="body">{label}</Typography>
        {value ? (
          <Typography variant="small" tone="muted" tabularNums>
            {value}
          </Typography>
        ) : null}
      </View>
      {trailing}
      {showChevron ? <ZenIcon name="forward" size={16} tintColor={colors.muted} /> : null}
    </Pressable>
  );
}

export function PracticeTimeRow({
  time,
  onPress,
  trailing,
  value = formatPracticeTime(time),
}: {
  time: PracticeTime;
  onPress?: () => void;
  trailing?: React.ReactNode;
  value?: string;
}) {
  return (
    <ZenListRow
      icon={time.hour < 12 ? "sun" : "moon"}
      label={time.label}
      value={value}
      onPress={onPress}
      trailing={trailing}
      showChevron={Boolean(onPress) && !trailing}
    />
  );
}

export function CompletionSoundRow({
  sound,
  onPress,
  trailing,
}: {
  sound: CompletionSound;
  onPress?: () => void;
  trailing?: React.ReactNode;
}) {
  const icon: ZenIconName = sound === "soft-chime" ? "bell" : sound === "low-bowl" ? "bowl" : "wood";
  return (
    <ZenListRow
      icon={icon}
      label="Completion sound"
      value={getCompletionSoundLabel(sound)}
      onPress={onPress}
      trailing={trailing}
      showChevron={Boolean(onPress) && !trailing}
    />
  );
}

export function GroupedList({ children }: { children: React.ReactNode | React.ReactNode[] }) {
  const items = Children.toArray(children);
  return (
    <ZenCard>
      {items.map((child, index) => (
        <View key={index}>
          {index > 0 ? <Separator /> : null}
          {child}
        </View>
      ))}
    </ZenCard>
  );
}
