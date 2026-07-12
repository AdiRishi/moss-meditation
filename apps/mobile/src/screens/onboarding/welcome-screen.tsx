import { useRouter } from "expo-router";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { StandardScrollView } from "@/components/ui/screen-containers/standard-scroll-view";
import { Typography } from "@/components/ui/typography";
import { LandscapeArtwork } from "@/components/ui/zen/brand-assets";
import { ZenPrimaryButton } from "@/components/ui/zen/zen-button";
import { useMeditation } from "@/providers/meditation-provider";

export function WelcomeScreen() {
  const router = useRouter();
  const { preferences, reducedMotion, savePreferences } = useMeditation();

  const continueOnboarding = async () => {
    await savePreferences({ ...preferences, onboardingStep: "goal" });
    router.push("/onboarding/goal");
  };

  return (
    <StandardScrollView contentContainerClassName="min-h-full justify-between gap-8 pb-6 pt-10">
      <Animated.View entering={reducedMotion ? undefined : FadeIn.duration(450)} className="gap-3 pt-8">
        <Typography variant="h1">Welcome.</Typography>
        <Typography variant="h3" tone="accent" className="max-w-64 font-serif font-normal">
          A quieter way to{"\n"}keep your practice.
        </Typography>
      </Animated.View>

      <LandscapeArtwork height={360} className="-mx-6" />

      <View className="gap-7">
        <View className="flex-row justify-center gap-2" accessibilityLabel="Onboarding step 1 of 4">
          <View className="size-2 rounded-full bg-accent" />
          <View className="size-2 rounded-full bg-stone" />
          <View className="size-2 rounded-full bg-stone" />
          <View className="size-2 rounded-full bg-stone" />
        </View>
        <ZenPrimaryButton onPress={() => void continueOnboarding()}>Continue</ZenPrimaryButton>
      </View>
    </StandardScrollView>
  );
}
