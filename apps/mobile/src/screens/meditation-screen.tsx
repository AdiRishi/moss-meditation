import { useKeepAwake } from "expo-keep-awake";
import { Redirect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, BackHandler, Pressable, View } from "react-native";

import { BreathingField } from "@/components/screens/meditation/breathing-field";
import { StandardScrollView } from "@/components/ui/screen-containers/standard-scroll-view";
import { Typography } from "@/components/ui/typography";
import { CompletionSoundRow, GroupedList } from "@/components/ui/zen/list-row";
import { ZenPrimaryButton, ZenSecondaryButton } from "@/components/ui/zen/zen-button";
import { ZenIcon } from "@/components/ui/zen/zen-icon";
import { formatRemainingTime, projectSession } from "@/domain/session-timer";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useMeditation } from "@/providers/meditation-provider";

export function MeditationScreen() {
  useKeepAwake("meditation-session");
  const router = useRouter();
  const colors = useThemeColors();
  const {
    abandonSession,
    activeSession,
    completeSession,
    pauseSession,
    pendingCompletion,
    reducedMotion,
    resumeSession,
  } = useMeditation();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const completionStarted = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 250);
    return () => clearInterval(interval);
  }, []);

  const projection = activeSession ? projectSession(activeSession, nowMs) : null;

  const confirmEnd = useCallback(() => {
    Alert.alert("End this session?", "An early ending will not be added to your progress.", [
      { text: "Keep sitting", style: "cancel" },
      {
        text: "End session",
        style: "destructive",
        onPress: () => {
          void abandonSession().then(() => router.replace("/(tabs)/today"));
        },
      },
    ]);
  }, [abandonSession, router]);

  useEffect(() => {
    if (!activeSession) {
      return;
    }
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      confirmEnd();
      return true;
    });
    return () => subscription.remove();
  }, [activeSession, confirmEnd]);

  useEffect(() => {
    if (!activeSession || !projection?.isComplete || completionStarted.current) {
      return;
    }
    completionStarted.current = true;
    void (async () => {
      const completed = await completeSession();
      const sessionId = completed?.id ?? pendingCompletion?.id;
      router.replace({
        pathname: "/session-complete",
        params: sessionId ? { id: sessionId, playSound: "1" } : {},
      });
    })();
  }, [activeSession, completeSession, pendingCompletion?.id, projection?.isComplete, router]);

  if (!activeSession || !projection) {
    if (pendingCompletion) {
      return <Redirect href={{ pathname: "/session-complete", params: { id: pendingCompletion.id } }} />;
    }
    return <Redirect href="/(tabs)/today" />;
  }

  const isPaused = activeSession.status === "paused";
  const isEnding = projection.phase === "ending";

  return (
    <StandardScrollView contentContainerClassName="min-h-full items-center justify-between gap-4 pb-7 pt-8">
      <Typography variant="h3" align="center" className="font-serif font-normal">
        {isEnding ? "Session ending" : "Meditation"}
      </Typography>

      <View className="items-center">
        <BreathingField reducedMotion={reducedMotion} ending={isEnding} />
        <Typography variant="display" align="center" tabularNums selectable>
          {formatRemainingTime(projection.remainingMs)}
        </Typography>
        {isEnding ? (
          <View className="items-center gap-2 pt-2">
            <Typography variant="h2" align="center">
              Gently returning.
            </Typography>
            <Typography tone="muted" align="center">
              Carry this calm into your day.
            </Typography>
          </View>
        ) : (
          <Typography tone="muted" align="center">
            {isPaused ? "Paused" : "Time remaining"}
          </Typography>
        )}
      </View>

      <View className="w-full gap-5">
        {!isEnding ? (
          <GroupedList>
            <CompletionSoundRow sound={activeSession.completionSound} />
          </GroupedList>
        ) : null}

        {isPaused ? (
          <View className="gap-3">
            <ZenPrimaryButton onPress={() => void resumeSession()}>Resume</ZenPrimaryButton>
            <ZenSecondaryButton onPress={confirmEnd}>End session</ZenSecondaryButton>
          </View>
        ) : isEnding ? (
          <ZenSecondaryButton onPress={confirmEnd}>End session</ZenSecondaryButton>
        ) : (
          <Pressable
            accessibilityLabel="Pause session"
            accessibilityRole="button"
            className="mx-auto size-16 items-center justify-center rounded-full bg-surface"
            style={{ boxShadow: "0 8px 24px rgba(30, 35, 38, 0.08)" }}
            onPress={() => void pauseSession()}
          >
            <ZenIcon name="pause" size={22} tintColor={colors.foreground} />
          </Pressable>
        )}
      </View>
    </StandardScrollView>
  );
}
