import * as Haptics from "expo-haptics";

export function selectionHaptic() {
  if (process.env.EXPO_OS === "ios") {
    void Haptics.selectionAsync();
  }
}

export function impactHaptic() {
  if (process.env.EXPO_OS === "ios") {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}
