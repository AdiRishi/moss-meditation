import { useState } from "react";
import { Linking, View } from "react-native";

import { QuietHoursControl, ReminderTimeControls } from "@/components/screens/settings/settings-controls";
import {
  SettingsFeedback,
  SettingsFormLayout,
  SettingsLoading,
  SettingsSection,
  type SettingsFeedbackState,
} from "@/components/screens/settings/settings-layout";
import { MossSecondaryButton } from "@/components/ui/moss/moss-button";
import { NotificationPreview } from "@/components/ui/moss/notification-preview";
import { MossToggleCard } from "@/components/ui/moss/toggle-card";
import type { AppPreferences } from "@/domain/meditation";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useMeditation } from "@/providers/meditation-provider";

export function RemindersScreen() {
  const meditation = useMeditation();

  if (!meditation.isReady) {
    return <SettingsLoading title="Notifications" />;
  }

  return <RemindersEditor />;
}

function RemindersEditor() {
  const { error, notificationPermission, preferences, saveNotificationPreferences } = useMeditation();
  const [draft, setDraft] = useState<AppPreferences>(preferences);
  const saveAction = useAsyncAction();
  const [feedback, setFeedback] = useState<SettingsFeedbackState>(null);

  const openDeviceSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      setFeedback({ message: "Device settings couldn’t be opened. Please try again.", tone: "danger" });
    }
  };

  const save = async () => {
    await saveAction.run(async () => {
      setFeedback(null);
      const notificationsRequested = draft.backgroundCompletionAlertsEnabled || draft.remindersEnabled;
      const result = await saveNotificationPreferences(draft, {
        requestPermission:
          notificationsRequested && notificationPermission.status !== "granted" && notificationPermission.canAskAgain,
      });
      setDraft(result.preferences);

      if (result.status === "sync-failed") {
        setFeedback({
          message: "Your choices are saved, but notifications couldn’t be updated. Please try again.",
          tone: "danger",
        });
        return;
      }

      if (result.status === "disabled") {
        setFeedback({ message: "Notifications are off. Your timing choices are saved.", tone: "success" });
      } else if (result.status === "permission-denied") {
        setFeedback({
          message: "Your choices are saved. Allow notifications in device settings when you want Moss to use them.",
          tone: "muted",
        });
      } else if (result.status === "sound-disabled") {
        setFeedback({
          message: "Your choices are saved. Turn on notification sounds in device settings to hear session endings.",
          tone: "muted",
        });
      } else if (result.status === "no-scheduled-times") {
        setFeedback({
          message: "Your choices are saved. No reminders currently fall outside quiet hours.",
          tone: "muted",
        });
      } else {
        setFeedback({ message: "Notification settings saved.", tone: "success" });
      }
    });
  };

  const visibleFeedback =
    (saveAction.error
      ? { message: "Your notification settings couldn’t be saved. Please try again.", tone: "danger" as const }
      : feedback) ??
    (error ? { message: "Your local settings are unavailable right now.", tone: "danger" as const } : null);

  return (
    <SettingsFormLayout
      title="Notifications"
      isSaving={saveAction.isPending}
      onSave={() => void save()}
      feedback={
        visibleFeedback ? (
          <SettingsFeedback tone={visibleFeedback.tone}>{visibleFeedback.message}</SettingsFeedback>
        ) : null
      }
    >
      <SettingsSection
        title="Session completion"
        description="Use a local notification when Moss is in the background."
      >
        <MossToggleCard
          enabled={draft.backgroundCompletionAlertsEnabled}
          icon="sound"
          label="Background completion sound"
          onChange={(backgroundCompletionAlertsEnabled) =>
            setDraft((current) => ({ ...current, backgroundCompletionAlertsEnabled }))
          }
          value="Hear the selected sound when a session ends"
        />
      </SettingsSection>

      <SettingsSection title="Practice reminders" description="A gentle prompt before your planned practice.">
        <MossToggleCard
          enabled={draft.remindersEnabled}
          icon="bell"
          label="Practice reminders"
          onChange={(remindersEnabled) => setDraft((current) => ({ ...current, remindersEnabled }))}
          value="Gentle and optional"
        />
      </SettingsSection>

      {notificationPermission.status !== "granted" &&
      (draft.backgroundCompletionAlertsEnabled || draft.remindersEnabled) ? (
        <View className="gap-3">
          <SettingsFeedback>
            Notifications are off in device settings. Moss will keep your choices until you allow them.
          </SettingsFeedback>
          {notificationPermission.canAskAgain ? null : (
            <MossSecondaryButton onPress={() => void openDeviceSettings()}>Open device settings</MossSecondaryButton>
          )}
        </View>
      ) : null}

      {notificationPermission.status === "granted" &&
      !notificationPermission.allowsSound &&
      draft.backgroundCompletionAlertsEnabled ? (
        <View className="gap-3">
          <SettingsFeedback>
            Notification sounds are off in device settings, so background session endings will be silent.
          </SettingsFeedback>
          <MossSecondaryButton onPress={() => void openDeviceSettings()}>Open device settings</MossSecondaryButton>
        </View>
      ) : null}

      <SettingsSection title="Reminder timing" description="Choose how early each planned pause should arrive.">
        <ReminderTimeControls
          enabled={draft.remindersEnabled}
          times={draft.practiceTimes}
          onChange={(practiceTimes) => setDraft((current) => ({ ...current, practiceTimes }))}
        />
      </SettingsSection>

      <SettingsSection title="Quiet hours" description="No practice reminders arrive during this window.">
        <QuietHoursControl
          enabled={draft.remindersEnabled}
          startMinute={draft.quietHours.startMinute}
          endMinute={draft.quietHours.endMinute}
          onChange={(quietHours) => setDraft((current) => ({ ...current, quietHours }))}
        />
      </SettingsSection>

      <SettingsSection title="Preview">
        <NotificationPreview />
      </SettingsSection>
    </SettingsFormLayout>
  );
}
