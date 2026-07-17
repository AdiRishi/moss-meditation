import { useState } from "react";

import { AddPracticeTimeButton, PracticeTimeControls } from "@/components/screens/settings/settings-controls";
import {
  SettingsFeedback,
  SettingsFormLayout,
  SettingsLoading,
  SettingsSection,
  type SettingsFeedbackState,
} from "@/components/screens/settings/settings-layout";
import { CounterCard } from "@/components/ui/moss/counter-card";
import { WeekdaySelector } from "@/components/ui/moss/weekday-selector";
import { createPracticeTimeId } from "@/domain/identifiers";
import { MAX_PRACTICE_TIMES, type AppPreferences } from "@/domain/meditation";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useMeditation } from "@/providers/meditation-provider";

export function ScheduleScreen() {
  const meditation = useMeditation();

  if (!meditation.isReady) {
    return <SettingsLoading title="Schedule" />;
  }

  return <ScheduleEditor />;
}

function ScheduleEditor() {
  const { error, preferences, saveNotificationPreferences } = useMeditation();
  const [draft, setDraft] = useState<AppPreferences>(preferences);
  const saveAction = useAsyncAction();
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [feedback, setFeedback] = useState<SettingsFeedbackState>(null);

  // Any edit returns the save button to "Save" and clears stale outcome messages.
  const editDraft = (update: (current: AppPreferences) => AppPreferences) => {
    setIsDraftSaved(false);
    setFeedback(null);
    setDraft(update);
  };

  const save = async () => {
    await saveAction.run(async () => {
      setFeedback(null);
      const result = await saveNotificationPreferences(draft);
      setDraft(result.preferences);
      if (result.status === "sync-failed") {
        setFeedback({
          message: "Your schedule is saved, but reminders couldn’t be updated. Try saving again.",
          tone: "danger",
        });
        return;
      }
      setIsDraftSaved(true);
    });
  };

  const saveState = saveAction.isPending ? "saving" : isDraftSaved ? "saved" : "idle";

  const visibleFeedback =
    (saveAction.error
      ? { message: "Your schedule couldn’t be saved. Please try again.", tone: "danger" as const }
      : feedback) ??
    (error ? { message: "Your settings couldn’t be loaded right now.", tone: "danger" as const } : null);

  return (
    <SettingsFormLayout
      title="Schedule"
      saveState={saveState}
      onSave={() => void save()}
      feedback={
        visibleFeedback ? (
          <SettingsFeedback tone={visibleFeedback.tone}>{visibleFeedback.message}</SettingsFeedback>
        ) : null
      }
    >
      <SettingsSection title="Practice days">
        <WeekdaySelector
          selected={draft.selectedWeekdays}
          onChange={(selectedWeekdays) => editDraft((current) => ({ ...current, selectedWeekdays }))}
        />
      </SettingsSection>

      <SettingsSection title="Sessions per day">
        <CounterCard
          value={draft.sessionsPerDay}
          label={draft.sessionsPerDay === 1 ? "session each day" : "sessions each day"}
          accessibilityLabel="sessions per day"
          minimum={1}
          maximum={3}
          onChange={(sessionsPerDay) => editDraft((current) => ({ ...current, sessionsPerDay }))}
        />
      </SettingsSection>

      <SettingsSection title="Practice times">
        <PracticeTimeControls
          times={draft.practiceTimes}
          onChange={(practiceTimes) => editDraft((current) => ({ ...current, practiceTimes }))}
        />
        <AddPracticeTimeButton
          disabled={draft.practiceTimes.length >= MAX_PRACTICE_TIMES}
          onPress={() =>
            editDraft((current) => ({
              ...current,
              practiceTimes: [
                ...current.practiceTimes,
                {
                  id: createPracticeTimeId(),
                  label: `Practice ${current.practiceTimes.length + 1}`,
                  hour: 12,
                  minute: 0,
                  enabled: true,
                  reminderLeadMinutes: 10,
                },
              ],
            }))
          }
        />
      </SettingsSection>
    </SettingsFormLayout>
  );
}
