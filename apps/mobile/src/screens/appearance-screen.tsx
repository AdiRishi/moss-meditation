import { useState } from "react";

import { AppearanceChoiceList, SettingsToggleCard } from "@/components/screens/settings/settings-controls";
import {
  SettingsFeedback,
  SettingsLoading,
  SettingsScreenLayout,
  SettingsSection,
} from "@/components/screens/settings/settings-layout";
import type { AppPreferences } from "@/domain/meditation";
import { useMeditation } from "@/providers/meditation-provider";

type SaveFeedback = { message: string; tone: "success" | "danger" } | null;

export function AppearanceScreen() {
  const { error, isReady, preferences, reducedMotion, savePreferences } = useMeditation();
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<SaveFeedback>(null);

  if (!isReady) {
    return <SettingsLoading title="Appearance" />;
  }

  const apply = async (next: AppPreferences) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await savePreferences(next);
      setFeedback({ message: "Appearance saved.", tone: "success" });
    } catch {
      setFeedback({ message: "Your appearance setting couldn’t be saved. Please try again.", tone: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  const visibleFeedback =
    feedback ?? (error ? { message: "Your local settings are unavailable right now.", tone: "danger" as const } : null);

  return (
    <SettingsScreenLayout title="Appearance">
      <SettingsSection title="Colour theme" description="System follows the appearance chosen for your device.">
        <AppearanceChoiceList
          disabled={isSaving}
          value={preferences.appearance}
          onChange={(appearance) => void apply({ ...preferences, appearance })}
        />
      </SettingsSection>

      <SettingsSection
        title="Motion"
        description="Respects system settings. Zen remains fully usable without animated transitions."
      >
        <SettingsToggleCard
          disabled={isSaving}
          enabled={preferences.reducedMotion}
          icon="motion"
          label="Reduced motion"
          onChange={(reducedMotion) => void apply({ ...preferences, reducedMotion })}
          value={
            preferences.reducedMotion
              ? "Always use quieter transitions"
              : reducedMotion
                ? "On through your system setting"
                : "Follows your system setting"
          }
        />
      </SettingsSection>

      {visibleFeedback ? (
        <SettingsFeedback tone={visibleFeedback.tone}>{visibleFeedback.message}</SettingsFeedback>
      ) : null}
    </SettingsScreenLayout>
  );
}
