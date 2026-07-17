import { Switch, View } from "react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";

import { Typography } from "../typography";
import { MossCard } from "./moss-card";
import { MossIcon, type MossIconName } from "./moss-icon";

export function MossToggleCard({
  icon,
  label,
  value,
  enabled,
  disabled,
  onChange,
}: {
  icon: MossIconName;
  label: string;
  value?: string;
  enabled: boolean;
  disabled?: boolean;
  onChange: (enabled: boolean) => void;
}) {
  const colors = useThemeColors();

  return (
    <MossCard>
      <View className="min-h-16 flex-row items-center gap-4 px-4 py-3">
        <View className="w-8 items-center justify-center">
          <MossIcon name={icon} size={22} tintColor={colors.muted} />
        </View>
        <View className="flex-1 gap-0.5">
          <Typography variant="body">{label}</Typography>
          {value ? (
            <Typography variant="small" tone="muted">
              {value}
            </Typography>
          ) : null}
        </View>
        <Switch
          accessibilityLabel={label}
          accessibilityState={{ checked: enabled, disabled }}
          disabled={disabled}
          ios_backgroundColor={colors.border}
          onValueChange={onChange}
          trackColor={{ false: colors.border, true: colors.accent }}
          value={enabled}
        />
      </View>
    </MossCard>
  );
}
