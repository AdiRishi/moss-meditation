import * as Application from "expo-application";

export function getAppVersion(): string {
  return Application.nativeApplicationVersion ?? "1.0.0";
}
