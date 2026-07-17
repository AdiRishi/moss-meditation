import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

import { OnboardingProgress } from "@/components/screens/onboarding/onboarding-progress";
import { LandscapeArtwork } from "@/components/ui/moss/brand-assets";
import { MossPrimaryButton } from "@/components/ui/moss/moss-button";
import { NotificationPreview } from "@/components/ui/moss/notification-preview";
import { MossToggleCard } from "@/components/ui/moss/toggle-card";
import { StickyFooterScrollView } from "@/components/ui/screen-containers/sticky-footer-scroll-view";
import { Typography } from "@/components/ui/typography";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useMeditation } from "@/providers/meditation-provider";

export function ReminderPermissionScreen() {
  const router = useRouter();
  const { preferences, saveNotificationPreferences } = useMeditation();
  const [backgroundCompletionAlertsEnabled, setBackgroundCompletionAlertsEnabled] = useState(
    preferences.backgroundCompletionAlertsEnabled,
  );
  const [remindersEnabled, setRemindersEnabled] = useState(preferences.remindersEnabled);
  const continueAction = useAsyncAction();

  const finishOnboarding = async () => {
    const completed = await continueAction.run(async () => {
      const nextPreferences = {
        ...preferences,
        backgroundCompletionAlertsEnabled,
        remindersEnabled,
        onboardingStep: "complete" as const,
        onboardingCompleted: true,
      };
      await saveNotificationPreferences(nextPreferences, {
        requestPermission: backgroundCompletionAlertsEnabled || remindersEnabled,
      });
      router.replace("/(tabs)/today");
    });
    if (!completed) {
      Alert.alert("Couldn’t finish setup", "Your choices are still here. Please try again.");
    }
  };

  return (
    <StickyFooterScrollView.Root>
      <StickyFooterScrollView.Body contentContainerClassName="justify-between gap-8 pt-12">
        <View className="gap-7">
          <OnboardingProgress step={3} />
          <View className="gap-3">
            <Typography accessibilityRole="header" variant="h1">
              Hear the ending,{"\n"}wherever your phone rests.
            </Typography>
            <Typography tone="muted">
              Moss uses notifications for background completion sounds and, if you choose, gentle practice reminders.
            </Typography>
          </View>
          <View className="gap-3">
            <MossToggleCard
              enabled={backgroundCompletionAlertsEnabled}
              icon="sound"
              label="Session completion"
              onChange={setBackgroundCompletionAlertsEnabled}
              value="Hear the sound with Moss in the background"
            />
            <MossToggleCard
              enabled={remindersEnabled}
              icon="bell"
              label="Practice reminders"
              onChange={setRemindersEnabled}
              value="Before your planned practice"
            />
          </View>
          {backgroundCompletionAlertsEnabled || remindersEnabled ? (
            <NotificationPreview
              message={backgroundCompletionAlertsEnabled ? "Your quiet pause is complete." : "Take a breath."}
            />
          ) : null}
        </View>
        <LandscapeArtwork height={180} className="-mx-6" fadeTop={48} fadeBottom={64} />
      </StickyFooterScrollView.Body>
      <StickyFooterScrollView.Footer>
        <MossPrimaryButton isDisabled={continueAction.isPending} onPress={() => void finishOnboarding()}>
          {continueAction.isPending ? "Saving…" : "Continue"}
        </MossPrimaryButton>
      </StickyFooterScrollView.Footer>
    </StickyFooterScrollView.Root>
  );
}
