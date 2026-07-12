import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { TimePickerSheet } from "@/components/screens/onboarding/time-picker-sheet";
import { StandardScrollView } from "@/components/ui/screen-containers/standard-scroll-view";
import { Typography } from "@/components/ui/typography";
import { GroupedList, PracticeTimeRow } from "@/components/ui/zen/list-row";
import { ScreenHeader } from "@/components/ui/zen/screen-header";
import { ZenPrimaryButton, ZenSecondaryButton } from "@/components/ui/zen/zen-button";
import type { PracticeTime } from "@/domain/meditation";
import { useMeditation } from "@/providers/meditation-provider";

export function OnboardingScheduleScreen() {
  const router = useRouter();
  const { preferences, savePreferences } = useMeditation();
  const [practiceTimes, setPracticeTimes] = useState(preferences.practiceTimes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingTime = practiceTimes.find((time) => time.id === editingId) ?? null;

  const updateTime = (updated: PracticeTime) => {
    setPracticeTimes((times) => times.map((time) => (time.id === updated.id ? updated : time)));
  };

  const continueOnboarding = async () => {
    await savePreferences({ ...preferences, practiceTimes, onboardingStep: "reminders" });
    router.push("/onboarding/reminders");
  };

  return (
    <>
      <StandardScrollView contentContainerClassName="min-h-full justify-between gap-8 pb-6">
        <View className="gap-8">
          <ScreenHeader onBack={() => router.back()} />
          <Typography variant="h1">When would you{"\n"}like to practise?</Typography>
          <GroupedList>
            {practiceTimes.map((time) => (
              <PracticeTimeRow key={time.id} time={time} onPress={() => setEditingId(time.id)} />
            ))}
          </GroupedList>
          <Typography tone="muted">
            These times are gentle intentions. You can change or turn them off whenever you like.
          </Typography>
        </View>
        <View className="gap-3">
          <ZenPrimaryButton onPress={() => void continueOnboarding()}>Continue</ZenPrimaryButton>
          <ZenSecondaryButton
            onPress={() => setPracticeTimes((times) => times.map((time) => ({ ...time, enabled: false })))}
          >
            Keep times flexible
          </ZenSecondaryButton>
        </View>
      </StandardScrollView>
      <TimePickerSheet practiceTime={editingTime} onChange={updateTime} onClose={() => setEditingId(null)} />
    </>
  );
}
