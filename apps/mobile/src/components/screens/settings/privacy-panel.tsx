import { Pressable, View } from "react-native";

import { Typography } from "@/components/ui/typography";
import { ZenCard } from "@/components/ui/zen/zen-card";

const PRIVACY_POINTS = [
  {
    title: "Stored on this device",
    description: "Your practice history, schedule, and preferences stay on this device.",
  },
  {
    title: "No account",
    description: "Zen does not ask you to sign in or create a profile.",
  },
  {
    title: "No tracking",
    description: "Zen does not track your activity or send analytics about your practice.",
  },
] as const;

export function PrivacySummary() {
  return (
    <View className="gap-3">
      {PRIVACY_POINTS.map((point) => (
        <ZenCard key={point.title} className="gap-1 px-4 py-4">
          <Typography variant="bodyBold">{point.title}</Typography>
          <Typography variant="small" tone="muted">
            {point.description}
          </Typography>
        </ZenCard>
      ))}
    </View>
  );
}

export function ResetLocalDataButton({ disabled, onPress }: { disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={disabled ? "Resetting local data" : "Reset Local Data"}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className="min-h-14 w-full items-center justify-center rounded-xl border border-danger px-4 py-3"
      disabled={disabled}
      onPress={onPress}
    >
      <Typography variant="bodyBold" tone="danger">
        {disabled ? "Resetting…" : "Reset Local Data"}
      </Typography>
    </Pressable>
  );
}
