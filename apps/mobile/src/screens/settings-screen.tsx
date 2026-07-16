import { type Href, useRouter } from "expo-router";

import { AppVersionLabel } from "@/components/screens/settings/app-version-label";
import { SettingsScreenLayout } from "@/components/screens/settings/settings-layout";
import { SettingsMenu } from "@/components/screens/settings/settings-menu";
import { getAppVersion } from "@/lib/app-version";

export function SettingsScreen() {
  const router = useRouter();

  return (
    <SettingsScreenLayout title="Settings" showBack={false}>
      <SettingsMenu onNavigate={(href) => router.push(href as Href)} />
      <AppVersionLabel version={getAppVersion()} />
    </SettingsScreenLayout>
  );
}
