import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { PrivacySummary, ResetLocalDataButton } from "@/components/screens/settings/privacy-panel";
import { SettingsFeedback, SettingsScreenLayout, SettingsSection } from "@/components/screens/settings/settings-layout";
import { useMeditation } from "@/providers/meditation-provider";

type ResetFeedback = { message: string; tone: "success" | "danger" } | null;

export function PrivacyScreen() {
  const router = useRouter();
  const { resetAllData } = useMeditation();
  const [isResetting, setIsResetting] = useState(false);
  const [feedback, setFeedback] = useState<ResetFeedback>(null);

  const reset = async () => {
    setIsResetting(true);
    setFeedback(null);
    try {
      await resetAllData();
      setFeedback({ message: "Local data has been reset.", tone: "success" });
      router.replace("/");
    } catch {
      setFeedback({ message: "Your local data couldn’t be reset. Please try again.", tone: "danger" });
    } finally {
      setIsResetting(false);
    }
  };

  const confirmReset = () => {
    Alert.alert(
      "Reset local data?",
      "Your practice history, schedule, reminders, and preferences will be removed from this device. This can’t be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset Local Data", style: "destructive", onPress: () => void reset() },
      ],
    );
  };

  return (
    <SettingsScreenLayout title="Privacy">
      <SettingsSection title="Privacy by design" description="No accounts. No tracking.">
        <PrivacySummary />
      </SettingsSection>

      <SettingsSection
        title="Reset Zen"
        description="Remove your practice history and restore every preference to its original setting."
      >
        <ResetLocalDataButton disabled={isResetting} onPress={confirmReset} />
      </SettingsSection>

      {feedback ? <SettingsFeedback tone={feedback.tone}>{feedback.message}</SettingsFeedback> : null}
    </SettingsScreenLayout>
  );
}
