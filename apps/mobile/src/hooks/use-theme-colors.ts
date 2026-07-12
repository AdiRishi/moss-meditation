import { useThemeColor } from "heroui-native";
import { useCSSVariable } from "uniwind";

export function useThemeColors() {
  const [accent, accentForeground, accentSoft, background, border, surface, foreground, muted, success, warning] =
    useThemeColor([
      "accent",
      "accent-foreground",
      "accent-soft",
      "background",
      "border",
      "surface",
      "foreground",
      "muted",
      "success",
      "warning",
    ]);

  const info = useCSSVariable("--info") as string;

  return {
    accent,
    accentForeground,
    accentSoft,
    background,
    border,
    surface,
    foreground,
    muted,
    success,
    warning,
    info,
  } as const;
}
