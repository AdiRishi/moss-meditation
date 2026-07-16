import { AboutPanel } from "@/components/screens/settings/about-panel";
import { SettingsScreenLayout } from "@/components/screens/settings/settings-layout";
import { getAppVersion } from "@/lib/app-version";

export function AboutScreen() {
  return (
    <SettingsScreenLayout title="About">
      <AboutPanel version={getAppVersion()} />
    </SettingsScreenLayout>
  );
}
