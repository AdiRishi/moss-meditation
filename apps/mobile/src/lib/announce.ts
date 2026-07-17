import { AccessibilityInfo } from "react-native";

/**
 * Speak a status change to screen-reader users. accessibilityLiveRegion only
 * works on Android, so iOS gets an explicit announcement; Android keeps the
 * live region to avoid double-speaking.
 */
export function announce(message: string) {
  if (process.env.EXPO_OS === "ios") {
    AccessibilityInfo.announceForAccessibility(message);
  }
}
