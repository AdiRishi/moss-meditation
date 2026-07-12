import { SymbolView, type SymbolViewProps } from "expo-symbols";

export type ZenIconName =
  | "home"
  | "progress"
  | "settings"
  | "sun"
  | "moon"
  | "bell"
  | "bowl"
  | "wood"
  | "back"
  | "forward"
  | "play"
  | "pause"
  | "check"
  | "calendar"
  | "palette"
  | "motion"
  | "lock"
  | "info"
  | "plus"
  | "minus"
  | "clock"
  | "history"
  | "close";

const ICONS = {
  home: { ios: "house", android: "home", web: "home" },
  progress: { ios: "chart.bar", android: "bar_chart", web: "bar_chart" },
  settings: { ios: "gearshape", android: "settings", web: "settings" },
  sun: { ios: "sun.max", android: "light_mode", web: "light_mode" },
  moon: { ios: "moon", android: "dark_mode", web: "dark_mode" },
  bell: { ios: "bell", android: "notifications", web: "notifications" },
  bowl: { ios: "cup.and.saucer", android: "emoji_food_beverage", web: "emoji_food_beverage" },
  wood: { ios: "tree", android: "forest", web: "forest" },
  back: { ios: "chevron.left", android: "chevron_left", web: "chevron_left" },
  forward: { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
  play: { ios: "play.fill", android: "play_arrow", web: "play_arrow" },
  pause: { ios: "pause.fill", android: "pause", web: "pause" },
  check: { ios: "checkmark", android: "check", web: "check" },
  calendar: { ios: "calendar", android: "calendar_month", web: "calendar_month" },
  palette: { ios: "paintpalette", android: "palette", web: "palette" },
  motion: { ios: "figure.arms.open", android: "visibility", web: "visibility" },
  lock: { ios: "lock", android: "lock", web: "lock" },
  info: { ios: "info.circle", android: "info", web: "info" },
  plus: { ios: "plus", android: "add", web: "add" },
  minus: { ios: "minus", android: "remove", web: "remove" },
  clock: { ios: "clock", android: "schedule", web: "schedule" },
  history: { ios: "calendar.badge.clock", android: "history", web: "history" },
  close: { ios: "xmark", android: "close", web: "close" },
} as const satisfies Record<ZenIconName, SymbolViewProps["name"]>;

type ZenIconProps = Omit<SymbolViewProps, "name"> & {
  name: ZenIconName;
};

export function ZenIcon({ name, size = 22, weight = "light", ...props }: ZenIconProps) {
  return <SymbolView name={ICONS[name]} size={size} weight={weight} resizeMode="scaleAspectFit" {...props} />;
}
