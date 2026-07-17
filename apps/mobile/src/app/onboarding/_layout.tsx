import { Stack } from "expo-router";

import { useMeditation } from "@/providers/meditation-provider";

export default function OnboardingLayout() {
  const { reducedMotion } = useMeditation();

  // Reduced motion drops the slide but keeps a fade — the same substitution
  // iOS makes for its own transitions.
  return <Stack screenOptions={{ headerShown: false, animation: reducedMotion ? "fade" : "slide_from_right" }} />;
}
