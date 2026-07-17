import { useEffect, type ReactNode } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { MossButtonLabel, MossPrimaryButton } from "@/components/ui/moss/moss-button";
import { MossIcon } from "@/components/ui/moss/moss-icon";
import { ScreenHeader } from "@/components/ui/moss/screen-header";
import { StandardScrollView } from "@/components/ui/screen-containers/standard-scroll-view";
import { StickyFooterScrollView } from "@/components/ui/screen-containers/sticky-footer-scroll-view";
import { Typography } from "@/components/ui/typography";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/cn";
import { successHaptic } from "@/lib/haptics";
import { crossfadeIn, crossfadeOut, glide } from "@/lib/motion";
import { useMeditation } from "@/providers/meditation-provider";

type SettingsScreenLayoutProps = {
  title: string;
  children: ReactNode;
  showBack?: boolean;
  contentContainerClassName?: string;
};

function SettingsTitle({ title, showBack }: Pick<SettingsScreenLayoutProps, "title" | "showBack">) {
  if (showBack) {
    return <ScreenHeader title={title} />;
  }

  return (
    <View className="min-h-14 items-center justify-center py-2">
      <Typography accessibilityRole="header" variant="h4" align="center" className="font-serif font-normal">
        {title}
      </Typography>
    </View>
  );
}

export function SettingsScreenLayout({
  title,
  children,
  showBack = true,
  contentContainerClassName,
}: SettingsScreenLayoutProps) {
  return (
    <StandardScrollView className="flex-1" contentContainerClassName={cn("gap-8 pb-10", contentContainerClassName)}>
      <SettingsTitle title={title} showBack={showBack} />
      {children}
    </StandardScrollView>
  );
}

export type SettingsSaveState = "idle" | "saving" | "saved";

type SettingsFormLayoutProps = {
  title: string;
  children: ReactNode;
  onSave: () => void;
  saveState?: SettingsSaveState;
  saveDisabled?: boolean;
  saveLabel?: string;
  feedback?: ReactNode;
};

/** The save button confirms its own outcome: label changes crossfade instead of snapping. */
function SaveButtonContent({ state, idleLabel }: { state: SettingsSaveState; idleLabel: string }) {
  const colors = useThemeColors();
  const label = state === "saving" ? "Saving…" : state === "saved" ? "Saved" : idleLabel;

  return (
    <View className="h-6 w-full">
      <Animated.View
        key={state}
        entering={crossfadeIn}
        exiting={crossfadeOut}
        className="absolute inset-0 flex-row items-center justify-center gap-1.5"
      >
        {state === "saved" ? <MossIcon name="check" size={16} tintColor={colors.accentForeground} /> : null}
        <MossButtonLabel>{label}</MossButtonLabel>
      </Animated.View>
    </View>
  );
}

export function SettingsFormLayout({
  title,
  children,
  onSave,
  saveState = "idle",
  saveDisabled = false,
  saveLabel = "Save",
  feedback,
}: SettingsFormLayoutProps) {
  const { reducedMotion } = useMeditation();
  const isSaving = saveState === "saving";

  useEffect(() => {
    if (saveState === "saved") {
      successHaptic();
    }
  }, [saveState]);

  return (
    <StickyFooterScrollView.Root>
      <StickyFooterScrollView.FormBody className="flex-1" contentContainerClassName="gap-8 pb-8">
        <SettingsTitle title={title} showBack />
        {children}
      </StickyFooterScrollView.FormBody>
      <StickyFooterScrollView.Footer className="border-t border-border">
        {feedback ? (
          <Animated.View entering={crossfadeIn} exiting={crossfadeOut} className="pb-3">
            {feedback}
          </Animated.View>
        ) : null}
        <Animated.View layout={glide(reducedMotion)}>
          <MossPrimaryButton
            accessibilityState={{ busy: isSaving, disabled: isSaving || saveDisabled }}
            accessibilityLabel={saveState === "saved" ? "Saved" : saveLabel}
            isDisabled={isSaving || saveDisabled}
            onPress={onSave}
          >
            <SaveButtonContent state={saveState} idleLabel={saveLabel} />
          </MossPrimaryButton>
        </Animated.View>
      </StickyFooterScrollView.Footer>
    </StickyFooterScrollView.Root>
  );
}

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <View className="gap-3">
      <View className="gap-1">
        <Typography variant="bodyBold">{title}</Typography>
        {description ? (
          <Typography variant="small" tone="muted">
            {description}
          </Typography>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function SettingsFeedback({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "success" | "danger";
}) {
  return (
    <Typography variant="small" tone={tone === "success" ? "muted" : tone} accessibilityLiveRegion="polite" selectable>
      {children}
    </Typography>
  );
}

export type SettingsFeedbackState = {
  message: string;
  tone: "muted" | "success" | "danger";
} | null;

export function SettingsLoading({ title }: { title: string }) {
  return (
    <SettingsScreenLayout title={title}>
      <View className="min-h-48 items-center justify-center">
        <Typography variant="small" tone="muted" accessibilityLiveRegion="polite">
          Loading…
        </Typography>
      </View>
    </SettingsScreenLayout>
  );
}
