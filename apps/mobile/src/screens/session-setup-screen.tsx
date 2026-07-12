import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { StandardScrollView } from "@/components/ui/screen-containers/standard-scroll-view";
import { Typography } from "@/components/ui/typography";
import { DurationSelector } from "@/components/ui/zen/duration-selector";
import { CompletionSoundRow, GroupedList } from "@/components/ui/zen/list-row";
import { ScreenHeader } from "@/components/ui/zen/screen-header";
import { ZenPrimaryButton } from "@/components/ui/zen/zen-button";
import type { SESSION_DURATIONS } from "@/domain/meditation";
import { impactHaptic } from "@/lib/haptics";
import { useMeditation } from "@/providers/meditation-provider";

export function SessionSetupScreen() {
  const router = useRouter();
  const { activeSession, notificationPermission, pendingCompletion, preferences, startSession } = useMeditation();
  const [duration, setDuration] = useState<(typeof SESSION_DURATIONS)[number]>(preferences.lastDurationMinutes);
  const [isStarting, setIsStarting] = useState(false);

  if (pendingCompletion) {
    return <Redirect href={{ pathname: "/session-complete", params: { id: pendingCompletion.id } }} />;
  }
  if (activeSession) {
    return <Redirect href="/meditation" />;
  }

  const begin = async () => {
    setIsStarting(true);
    impactHaptic();
    await startSession(duration, preferences.completionSound);
    router.replace("/meditation");
  };

  return (
    <StandardScrollView contentContainerClassName="min-h-full justify-between gap-8 pb-6">
      <View className="gap-9">
        <ScreenHeader />
        <Typography variant="h1">How long would{"\n"}you like to sit?</Typography>
        <DurationSelector value={duration} onChange={setDuration} />
        <GroupedList>
          <CompletionSoundRow
            sound={preferences.completionSound}
            onPress={() => router.push({ pathname: "/completion-sound", params: { source: "session-setup" } })}
          />
        </GroupedList>
        {notificationPermission === "granted" ? null : (
          <Typography variant="small" tone="muted">
            Keep Zen open during your session to hear the completion sound.
          </Typography>
        )}
      </View>
      <ZenPrimaryButton isDisabled={isStarting} onPress={() => void begin()}>
        Begin
      </ZenPrimaryButton>
    </StandardScrollView>
  );
}
