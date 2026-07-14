import { useRouter } from "expo-router";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { StandardScrollView } from "@/components/ui/screen-containers/standard-scroll-view";
import { Typography } from "@/components/ui/typography";
import { LandscapeArtwork } from "@/components/ui/zen/brand-assets";
import { ZenPrimaryButton } from "@/components/ui/zen/zen-button";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useMeditation } from "@/providers/meditation-provider";

export function WelcomeScreen() {
  const router = useRouter();
  const { preferences, reducedMotion, savePreferences } = useMeditation();
  const action = useAsyncAction();

  const continueOnboarding = async () => {
    const completed = await action.run(() => savePreferences({ ...preferences, onboardingStep: "goal" }));
    if (completed) {
      router.push("/onboarding/goal");
    }
  };

  return (
    <StandardScrollView fillViewport contentContainerClassName="justify-between gap-8 pb-6 pt-10">
      <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(450)} className="gap-3 pt-10">
        <Typography accessibilityRole="header" variant="h1">
          Welcome.
        </Typography>
        <Typography variant="reflection" tone="accent">
          A quieter way to{"\n"}keep your practice.
        </Typography>
      </Animated.View>

      <LandscapeArtwork height={296} className="-mx-6" />

      <View className="gap-8">
        <View className="flex-row justify-center gap-2" accessibilityLabel="Onboarding step 1 of 4">
          <View className="size-2 rounded-full bg-accent" />
          <View className="size-2 rounded-full bg-stone" />
          <View className="size-2 rounded-full bg-stone" />
          <View className="size-2 rounded-full bg-stone" />
        </View>
        {action.error ? (
          <Typography variant="small" tone="danger" accessibilityLiveRegion="polite">
            Your choice couldn’t be saved. Please try again.
          </Typography>
        ) : null}
        <ZenPrimaryButton isDisabled={action.isPending} onPress={() => void continueOnboarding()}>
          {action.isPending ? "Saving…" : "Continue"}
        </ZenPrimaryButton>
      </View>
    </StandardScrollView>
  );
}
