import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { EnsoMark } from "@/components/ui/moss/brand-assets";
import { StandardView } from "@/components/ui/screen-containers/standard-view";
import { Typography } from "@/components/ui/typography";
import { durations, easings } from "@/lib/motion";
import { useMeditation } from "@/providers/meditation-provider";

const ONBOARDING_ROUTES = {
  welcome: "/onboarding/welcome",
  goal: "/onboarding/goal",
  schedule: "/onboarding/schedule",
  reminders: "/onboarding/reminders",
  complete: "/(tabs)/today",
} as const;

const BRAND_MOMENT_MS = 1_100;
// With the breath gone under reduced motion the hold is pure latency; keep
// just enough to avoid a flash of brand mark before the redirect.
const REDUCED_MOTION_HOLD_MS = 400;

export function LaunchScreen() {
  const { activeSession, isReady, pendingCompletion, preferences, reducedMotion } = useMeditation();
  const [brandMomentComplete, setBrandMomentComplete] = useState(false);
  const breath = useSharedValue(1);
  // Someone returning to a live session or an unsaved completion is not here
  // for a brand moment — recover first, breathe later.
  const resumingSession = Boolean(pendingCompletion || activeSession);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const holdMs = reducedMotion ? REDUCED_MOTION_HOLD_MS : BRAND_MOMENT_MS;
    const timeout = setTimeout(() => setBrandMomentComplete(true), holdMs);
    return () => clearTimeout(timeout);
  }, [isReady, reducedMotion]);

  useEffect(() => {
    if (!isReady || reducedMotion || resumingSession) {
      return;
    }
    breath.set(withTiming(1.02, { duration: BRAND_MOMENT_MS, easing: easings.move }));
  }, [breath, isReady, reducedMotion, resumingSession]);

  const breathStyle = useAnimatedStyle(() => ({ transform: [{ scale: breath.get() }] }));

  if (!isReady) {
    return null;
  }

  if (pendingCompletion) {
    return <Redirect href={{ pathname: "/session-complete", params: { id: pendingCompletion.id } }} />;
  }

  if (activeSession) {
    return <Redirect href="/meditation" />;
  }

  if (!brandMomentComplete) {
    return (
      <StandardView className="flex-1 items-center justify-center bg-background">
        <Animated.View
          entering={FadeIn.duration(reducedMotion ? 300 : durations.entranceSlow).easing(easings.enter)}
          exiting={FadeOut.duration(reducedMotion ? 200 : durations.exit).easing(easings.exit)}
          className="items-center gap-5"
        >
          <Animated.View style={breathStyle}>
            <EnsoMark size={126} />
          </Animated.View>
          <Typography variant="display" align="center">
            Moss
          </Typography>
          <Typography variant="reflection" tone="accent" align="center">
            A quiet rhythm{"\n"}for daily practice.
          </Typography>
        </Animated.View>
      </StandardView>
    );
  }

  if (!preferences.onboardingCompleted) {
    return <Redirect href={ONBOARDING_ROUTES[preferences.onboardingStep]} />;
  }

  return <Redirect href="/(tabs)/today" />;
}
